"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Plan } from "@/app/page"

interface PixFormProps {
  selectedPlan: Plan
  onBack: () => void
}

export function PixForm({ selectedPlan, onBack }: PixFormProps) {
  const [showPixCode, setShowPixCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  })
  const [pixResponse, setPixResponse] = useState<{
    success: boolean
    encodedImage: string
    payload: string
    expirationDate: string
  } | null>(null)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos em segundos
  const [copySuccess, setCopySuccess] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (showPixCode && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showPixCode, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "")
  }

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, "")
  }

  const generateExternalRef = (email: string, planId: string) => {
    const planName = planId === "silver" ? "silver" : "padrao"
    return `${email}_${planName}`
  }

  const calculateDueDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7) // 7 dias a partir de hoje
    return date.toISOString().split("T")[0]
  }

  const handleGeneratePix = async () => {
    setIsLoading(true)
    setError("")

    try {
      const planName = selectedPlan.id === "silver" ? "silver" : "padrao"
      const annualValue = selectedPlan.price * 12

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formatPhone(formData.phone),
        cpf: formatCPF(formData.cpf),
        plano: planName,
        valor: annualValue,
        externalRef: generateExternalRef(formData.email, selectedPlan.id),
        dueDate: calculateDueDate(),
      }

      const response = await fetch(
        "https://webhook.agenciasclick.com.br/webhook/0a310dc4-3e1d-4659-89a1-2f7793cf20d3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText || "Erro ao gerar PIX. Tente novamente."}`)
      }

      const data = await response.json()

      if (data.success) {
        setPixResponse(data)
        setShowPixCode(true)
        setTimeLeft(15 * 60) // Reset timer para 15 minutos
      } else {
        throw new Error("Erro ao processar pagamento PIX")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPixCode = async () => {
    if (pixResponse?.payload) {
      try {
        await navigator.clipboard.writeText(pixResponse.payload)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error("Erro ao copiar:", err)
      }
    }
  }

  const annualValue = selectedPlan.price * 12

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        {showPixCode ? "Seu PIX foi gerado!" : "Informe seus dados para gerar o Pix"}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {!showPixCode ? (
        <div className="space-y-6">
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone (somente números)</Label>
            <Input
              id="phone"
              placeholder="11999999999"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", formatPhone(e.target.value))}
              maxLength={11}
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF (somente números)</Label>
            <Input
              id="cpf"
              placeholder="12345678901"
              value={formData.cpf}
              onChange={(e) => handleInputChange("cpf", formatCPF(e.target.value))}
              maxLength={11}
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-semibold text-gray-900">{selectedPlan.name}</div>
                <div className="text-sm text-gray-600">{selectedPlan.description}</div>
                <div className="text-sm text-gray-600">
                  Equivale a 12x R$ {selectedPlan.price.toFixed(2).replace(".", ",")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">R$ {annualValue.toFixed(2).replace(".", ",")}</div>
                <div className="text-sm text-gray-600">pagamento à vista</div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGeneratePix}
            disabled={isLoading || !formData.name || !formData.email || !formData.phone || !formData.cpf}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg disabled:opacity-50"
          >
            {isLoading ? "Gerando PIX..." : "Gerar PIX"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timer de urgência */}
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <span className="font-semibold text-orange-800">Tempo restante para pagamento</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">{formatTime(timeLeft)}</div>
            <p className="text-orange-700 text-sm">
              Você tem <strong>15 minutos</strong> para realizar o pagamento e garantir a condição especial.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-800 font-medium mb-2">PIX gerado com sucesso!</p>
            <p className="text-green-700 text-sm">
              Seu acesso será liberado automaticamente após o pagamento ser confirmado.
            </p>
          </div>

          {/* QR Code */}
          {pixResponse?.encodedImage && (
            <Card className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Escaneie o QR Code</h3>
              <img
                src={`data:image/png;base64,${pixResponse.encodedImage}`}
                alt="QR Code PIX"
                className="w-64 h-64 mx-auto mb-4 border rounded-lg shadow-sm bg-white"
              />
              <p className="text-sm text-gray-600">Abra o app do seu banco e escaneie este código</p>
            </Card>
          )}

          {/* Código Copia e Cola */}
          {pixResponse?.payload && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Código PIX Copia e Cola</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ou, se preferir, copie o código abaixo e pague no app do seu banco
              </p>
              <div className="bg-gray-100 p-4 rounded-lg border mb-4">
                <textarea
                  readOnly
                  value={pixResponse.payload}
                  className="w-full h-24 text-xs font-mono bg-transparent border-none resize-none focus:outline-none"
                />
              </div>
              <Button
                onClick={handleCopyPixCode}
                variant={copySuccess ? "default" : "outline"}
                className={`w-full ${copySuccess ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              >
                📋 {copySuccess ? "Código copiado!" : "Copiar código PIX"}
              </Button>
            </Card>
          )}

          {/* Resumo do pedido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-900">{selectedPlan.name}</div>
                <div className="text-sm text-gray-600">Assinatura anual à vista</div>
                <div className="text-sm text-gray-600">
                  Equivale a 12x R$ {selectedPlan.price.toFixed(2).replace(".", ",")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 text-xl">R$ {annualValue.toFixed(2).replace(".", ",")}</div>
              </div>
            </div>
          </div>

          {/* Informações importantes */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Instruções importantes:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• O pagamento será processado automaticamente</li>
              <li>• Você receberá um e-mail de confirmação após o pagamento</li>
              <li>• Seu acesso será liberado em até 5 minutos</li>
              <li>• Guarde este código PIX até a confirmação do pagamento</li>
            </ul>
          </div>

          {timeLeft <= 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
              <p className="text-red-800 font-medium">⏰ Tempo esgotado!</p>
              <p className="text-red-700 text-sm mt-1">
                O prazo para pagamento expirou. Gere um novo PIX para continuar.
              </p>
              <Button
                onClick={() => {
                  setShowPixCode(false)
                  setPixResponse(null)
                  setTimeLeft(15 * 60)
                }}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
              >
                Gerar novo PIX
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
