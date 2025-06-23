"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Plan } from "@/app/page"

interface CreditCardFormProps {
  selectedPlan: Plan
  onBack: () => void
}

export function CreditCardForm({ selectedPlan, onBack }: CreditCardFormProps) {
  const [installments, setInstallments] = useState("12")

  const calculateInstallmentValue = (monthlyValue: number, installmentCount: number) => {
    const annualValue = monthlyValue * 12
    return (annualValue / installmentCount).toFixed(2).replace(".", ",")
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

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Informe os dados do seu cartão de crédito</h1>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" placeholder="Seu nome completo" />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(11) 99999-9999" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" />
        </div>

        <div>
          <Label htmlFor="cardNumber">Número do cartão</Label>
          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Validade (MM/AA)</Label>
            <Input id="expiry" placeholder="12/28" />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input id="cvv" placeholder="123" />
          </div>
        </div>

        <div>
          <Label htmlFor="cardName">Nome no cartão</Label>
          <Input id="cardName" placeholder="Nome como está no cartão" />
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

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="font-semibold text-gray-900">{selectedPlan.name}</div>
              <div className="text-sm text-gray-600">{selectedPlan.description}</div>
              <div className="text-sm text-gray-600">
                Assinatura anual (12x R$ {selectedPlan.price.toFixed(2).replace(".", ",")})
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg">
          Acessar meus Cursos
        </Button>

        <div className="text-sm text-gray-600 text-center">
          A assinatura é anual e será renovada automaticamente. Você pode cancelar a qualquer momento.
        </div>

        <div className="text-xs text-gray-500 space-y-2">
          <p>Cartões que suportam transações de débito e de crédito poderão ser processados de ambas as formas.</p>
          <p>
            Ao marcar a caixa de seleção abaixo, você concorda com nossos Termos de Uso e nossa Declaração de
            Privacidade e indica que tem pelo menos 18 anos. A ClickVetflix renovará automaticamente sua assinatura e
            cobrará o preço da assinatura (atualmente R$ {selectedPlan.price.toFixed(2).replace(".", ",")}/mês) da sua
            forma de pagamento até você cancelar. Você pode cancelar quando quiser para evitar cobranças futuras.
          </p>
        </div>
      </div>
    </div>
  )
}
