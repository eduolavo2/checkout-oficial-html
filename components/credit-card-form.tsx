"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Lock, CheckCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import type { Plan } from "@/app/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreditCardFormProps {
  selectedPlan: Plan
  onBack: () => void
}

declare global {
  interface Window {
    pagarme: any
  }
}

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "")

  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false // CPFs com todos os dígitos iguais

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanCPF.charAt(10))) return false

  return true
}

// Função para validar data de validade
const validateExpiryDate = (expiryDate: string): boolean => {
  if (expiryDate.length !== 5) return false

  const [month, year] = expiryDate.split("/")
  const monthNum = Number.parseInt(month)
  const yearNum = Number.parseInt(`20${year}`)

  if (monthNum < 1 || monthNum > 12) return false

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return false
  }

  return true
}

// Função para formatar CPF
const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "")
  return cleanValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function CreditCardForm({ selectedPlan, onBack }: CreditCardFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState("")
  const [installments, setInstallments] = useState("12")
  const [pagarmeLoaded, setPagarmeLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [retryCount, setRetryCount] = useState(0)

  // URLs de fallback para o script Pagar.me
  const pagarmeUrls = [
    "https://assets.pagar.me/pagarme-js/4.18.0/pagarme.min.js",
    "https://assets.pagar.me/pagarme-js/4.0/pagarme.min.js",
    "https://assets.pagar.me/js/pagarme.min.js",
  ]

  // Função para carregar o script Pagar.me com fallback
  const loadPagarmeScript = (urlIndex = 0) => {
    // Limpar estados anteriores
    setScriptError(false)
    setLoadingTimeout(false)
    setPagarmeLoaded(false)

    // Verificar se já existe
    if (typeof window !== "undefined" && window.pagarme) {
      console.log("Pagar.me já carregado")
      setPagarmeLoaded(true)
      return
    }

    // Se esgotou todas as URLs
    if (urlIndex >= pagarmeUrls.length) {
      console.error("Todas as URLs do Pagar.me falharam")
      setScriptError(true)
      return
    }

    // Remover script anterior se existir
    const existingScript = document.querySelector('script[src*="pagarme"]')
    if (existingScript) {
      existingScript.remove()
    }

    const currentUrl = pagarmeUrls[urlIndex]
    console.log(`Tentando carregar Pagar.me da URL ${urlIndex + 1}/${pagarmeUrls.length}: ${currentUrl}`)

    const script = document.createElement("script")
    script.src = currentUrl
    script.async = true

    script.onload = () => {
      console.log(`Script Pagar.me carregado com sucesso da URL: ${currentUrl}`)
      setPagarmeLoaded(true)
      setRetryCount(0)
    }

    script.onerror = () => {
      console.error(`Erro ao carregar script da URL: ${currentUrl}`)
      // Tentar próxima URL
      setTimeout(() => {
        loadPagarmeScript(urlIndex + 1)
      }, 1000)
    }

    document.head.appendChild(script)

    // Timeout de 15 segundos para cada tentativa
    setTimeout(() => {
      if (!pagarmeLoaded && !scriptError && urlIndex === pagarmeUrls.length - 1) {
        console.warn("Timeout no carregamento do Pagar.me")
        setLoadingTimeout(true)
      }
    }, 15000)
  }

  // Carregamento inicial do script
  useEffect(() => {
    loadPagarmeScript()
  }, [])

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
    if (error) setError("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    clearFieldError(name)

    let formattedValue = value

    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .trim()
        .substr(0, 19)
    } else if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{2})/, "$1/$2")
        .substr(0, 5)
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").substr(0, 4)
    } else if (name === "cpf") {
      formattedValue = formatCPF(value).substr(0, 14)
    } else if (name === "name" || name === "cardName") {
      formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      errors.email = "E-mail é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "E-mail inválido"
    }

    const cleanCPF = formData.cpf.replace(/\D/g, "")
    if (!cleanCPF) {
      errors.cpf = "CPF é obrigatório"
    } else if (!validateCPF(cleanCPF)) {
      errors.cpf = "CPF inválido"
    }

    const cleanCardNumber = formData.cardNumber.replace(/\s/g, "")
    if (!cleanCardNumber) {
      errors.cardNumber = "Número do cartão é obrigatório"
    } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      errors.cardNumber = "Número do cartão inválido"
    }

    if (!formData.cardName.trim()) {
      errors.cardName = "Nome no cartão é obrigatório"
    }

    if (!formData.expiryDate) {
      errors.expiryDate = "Data de validade é obrigatória"
    } else if (!validateExpiryDate(formData.expiryDate)) {
      errors.expiryDate = "Data de validade inválida ou expirada"
    }

    if (!formData.cvv) {
      errors.cvv = "CVV é obrigatório"
    } else if (formData.cvv.length < 3) {
      errors.cvv = "CVV deve ter pelo menos 3 dígitos"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = (): boolean => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      validateCPF(formData.cpf.replace(/\D/g, "")) &&
      formData.cardNumber.replace(/\s/g, "").length >= 13 &&
      formData.cardName.trim() &&
      validateExpiryDate(formData.expiryDate) &&
      formData.cvv.length >= 3 &&
      pagarmeLoaded
    )
  }

  const getPlanId = () => {
    return selectedPlan.id === "silver" ? "6477917" : "6477918"
  }

  const generateInstallmentOptions = () => {
    const options = []
    const annualValue = selectedPlan.price * 12

    for (let i = 1; i <= 12; i++) {
      const installmentValue = (annualValue / i).toFixed(2).replace(".", ",")
      options.push({
        value: i.toString(),
        label: i === 1 ? `1x de R$ ${installmentValue} (à vista)` : `${i}x de R$ ${installmentValue}`,
      })
    }
    return options
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      cpf: "",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    })
    setFieldErrors({})
    setError("")
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setScriptError(false)
    setLoadingTimeout(false)
    loadPagarmeScript()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Guard: verificar se Pagar.me foi carregado
    if (!pagarmeLoaded || typeof window.pagarme === "undefined") {
      setError("Sistema de pagamento ainda não foi carregado. Tente recarregar o script.")
      return
    }

    if (!validateForm()) {
      setError("Por favor, corrija os erros nos campos destacados.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Conectando com Pagar.me...")

      // Conectar com a Pagar.me usando a chave pública
      const client = await window.pagarme.client.connect({
        encryption_key: "ak_live_nv08BgVRmj6NQOtauq421Zbq3rlXQE",
      })

      console.log("Cliente conectado, gerando token do cartão...")

      // Preparar dados do cartão para tokenização
      const cardData = {
        number: formData.cardNumber.replace(/\s/g, ""),
        holder_name: formData.cardName,
        expiration_date: formData.expiryDate.replace("/", ""),
        cvv: formData.cvv,
      }

      // Gerar token do cartão
      const card = await client.cards.create(cardData)
      const cardToken = card.id

      console.log("Token do cartão gerado com sucesso")

      // Preparar payload para o webhook
      const payload = {
        plan_id: getPlanId(),
        card_token: cardToken,
        installments: Number.parseInt(installments),
        customer: {
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, ""),
        },
      }

      console.log("Enviando dados para processamento...")

      // Enviar para o webhook
      const response = await fetch(
        "https://webhook.agenciasclick.com.br/webhook/6dbc3ff1-1013-4886-b7b7-494aa82f0d95",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Erro na resposta:", errorData)

        if (response.status === 400) {
          throw new Error("Dados do cartão inválidos. Verifique as informações e tente novamente.")
        } else if (response.status === 402) {
          throw new Error("Pagamento recusado. Verifique os dados do cartão ou tente outro cartão.")
        } else if (response.status >= 500) {
          throw new Error("Erro interno do servidor. Tente novamente em alguns minutos.")
        } else {
          throw new Error("Erro ao processar pagamento. Tente novamente.")
        }
      }

      const result = await response.json()
      console.log("Pagamento processado com sucesso")

      // Limpar formulário após sucesso
      resetForm()
      setPaymentSuccess(true)
    } catch (error) {
      console.error("Erro no pagamento:", error)

      if (error instanceof Error) {
        if (error.message.includes("Invalid card")) {
          setError("Dados do cartão inválidos. Verifique o número, validade e CVV.")
        } else if (error.message.includes("card_declined")) {
          setError("Cartão recusado. Verifique os dados ou tente outro cartão.")
        } else {
          setError(error.message)
        }
      } else {
        setError("Erro inesperado. Tente novamente em alguns minutos.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-600">Pagamento Aprovado!</h2>
              <p className="text-gray-600">
                Seu pagamento foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Plano Ativado:</h3>
                <p className="text-green-700">{selectedPlan.name}</p>
                <p className="text-green-700">
                  {installments === "1"
                    ? `R$ ${(selectedPlan.price * 12).toFixed(2).replace(".", ",")} (à vista)`
                    : `${installments}x R$ ${((selectedPlan.price * 12) / Number.parseInt(installments)).toFixed(2).replace(".", ",")}`}
                </p>
              </div>
              <Button onClick={() => setPaymentSuccess(false)} variant="outline" className="w-full">
                Fazer Novo Pagamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto font-normal text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamento com Cartão
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {!pagarmeLoaded && !scriptError && !loadingTimeout && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg mb-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-blue-700">
                Carregando sistema de pagamento seguro...
                {retryCount > 0 && ` (Tentativa ${retryCount + 1})`}
              </span>
            </div>
          )}

          {/* Script Error State */}
          {(scriptError || loadingTimeout) && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Erro ao carregar sistema de pagamento</h4>
                  <p className="text-sm text-red-700 mb-3">
                    {scriptError
                      ? "Não foi possível carregar o sistema de pagamento Pagar.me. Isso pode ser devido a bloqueadores de anúncios ou problemas de conectividade."
                      : "O carregamento está demorando mais que o esperado."}
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={handleRetry}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente {retryCount > 0 && `(${retryCount + 1})`}
                    </Button>
                    <div className="text-xs text-red-600">
                      <p>💡 Dicas para resolver:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Desative bloqueadores de anúncios temporariamente</li>
                        <li>Verifique sua conexão com a internet</li>
                        <li>Tente recarregar a página</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form - só aparece quando Pagar.me estiver carregado */}
          {pagarmeLoaded && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>

                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    className={fieldErrors.name ? "border-red-500" : ""}
                    required
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className={fieldErrors.email ? "border-red-500" : ""}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className={fieldErrors.cpf ? "border-red-500" : ""}
                    maxLength={14}
                    required
                  />
                  {fieldErrors.cpf && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.cpf}
                    </p>
                  )}
                </div>
              </div>

              {/* Dados do Cartão */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Dados do Cartão</h3>

                <div>
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="0000 0000 0000 0000"
                    className={fieldErrors.cardNumber ? "border-red-500" : ""}
                    maxLength={19}
                    required
                  />
                  {fieldErrors.cardNumber && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.cardNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    type="text"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Nome como está no cartão"
                    className={fieldErrors.cardName ? "border-red-500" : ""}
                    required
                  />
                  {fieldErrors.cardName && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fieldErrors.cardName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Validade</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="text"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      className={fieldErrors.expiryDate ? "border-red-500" : ""}
                      maxLength={5}
                      required
                    />
                    {fieldErrors.expiryDate && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fieldErrors.expiryDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      type="text"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={fieldErrors.cvv ? "border-red-500" : ""}
                      maxLength={4}
                      required
                    />
                    {fieldErrors.cvv && (
                      <p className="text-sm text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fieldErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="installments">Quantidade de parcelas</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione as parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateInstallmentOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resumo do Pedido */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Resumo do Pedido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{selectedPlan.name}</span>
                    <span className="font-bold">
                      {installments === "1"
                        ? `R$ ${(selectedPlan.price * 12).toFixed(2).replace(".", ",")} (à vista)`
                        : `${installments}x R$ ${((selectedPlan.price * 12) / Number.parseInt(installments)).toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {installments === "1"
                      ? "Pagamento à vista"
                      : `Assinatura anual parcelada em ${installments}x sem juros`}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Segurança */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4" />
                <span>Seus dados estão protegidos com criptografia SSL</span>
              </div>

              <Button type="submit" className="w-full" disabled={!isFormValid() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processando pagamento...
                  </>
                ) : installments === "1" ? (
                  `Pagar R$ ${(selectedPlan.price * 12).toFixed(2).replace(".", ",")} à vista`
                ) : (
                  `Pagar ${installments}x R$ ${((selectedPlan.price * 12) / Number.parseInt(installments)).toFixed(2).replace(".", ",")}`
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
