"use client"

import { ArrowLeft, CreditCard, Smartphone } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Plan, PaymentMethodType } from "@/app/page"

interface PaymentMethodProps {
  selectedPlan: Plan
  onPaymentMethodSelect: (method: PaymentMethodType) => void
  onBack: () => void
}

export function PaymentMethod({ selectedPlan, onPaymentMethodSelect, onBack }: PaymentMethodProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Escolha como você quer pagar</h1>

      <p className="text-gray-600 mb-8">Sua forma de pagamento está criptografada e você pode mudá-la quando quiser.</p>

      <div className="space-y-4 mb-8">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onPaymentMethodSelect("credit-card")}
        >
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-6 h-6 text-gray-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Cartão de Crédito</h3>
                <p className="text-sm text-gray-600">Visa, Mastercard, Elo, American Express</p>
              </div>
            </div>
            <div className="text-gray-400">›</div>
          </div>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onPaymentMethodSelect("pix")}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="w-6 h-6 text-gray-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">PIX</h3>
                <p className="text-sm text-gray-600">Pagamento instantâneo</p>
              </div>
            </div>
            <div className="text-gray-400">›</div>
          </div>
        </Card>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-gray-900">{selectedPlan.name}</div>
            <div className="text-sm text-gray-600">{selectedPlan.description}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">R$ {selectedPlan.price.toFixed(2).replace(".", ",")}/mês</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>🔒 Segurança e tranquilidade.</p>
        <p>Cancele online com facilidade.</p>
      </div>
    </div>
  )
}
