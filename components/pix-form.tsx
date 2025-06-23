"use client"

import { useState } from "react"
import { ArrowLeft, Copy, QrCode } from "lucide-react"
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
  const [pixCode] = useState(
    "00020126580014BR.GOV.BCB.PIX013636c4b8c4-4c4c-4c4c-4c4c-4c4c4c4c4c4c5204000053039865802BR5925CLICKVETFLIX CURSOS LTDA6009SAO PAULO62070503***6304ABCD",
  )

  const handleGeneratePix = () => {
    setShowPixCode(true)
  }

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    // Aqui você pode adicionar um toast de confirmação
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

      {!showPixCode ? (
        <div className="space-y-6">
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" placeholder="Seu nome completo" />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="seu@email.com" />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(11) 99999-9999" />
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
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg"
          >
            Gerar PIX
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-800 font-medium mb-2">PIX gerado com sucesso!</p>
            <p className="text-green-700 text-sm">
              Seu acesso será liberado automaticamente após o pagamento ser confirmado. O PIX tem validade limitada.
            </p>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Código PIX Copia e Cola</h3>
            <div className="bg-gray-100 p-3 rounded border text-sm font-mono break-all mb-4">{pixCode}</div>
            <Button onClick={handleCopyPixCode} variant="outline" className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copiar código PIX
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <QrCode className="w-32 h-32 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold text-gray-900 mb-2">QR Code PIX</h3>
            <p className="text-sm text-gray-600">Escaneie este código com o app do seu banco</p>
          </Card>

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
                <div className="font-semibold text-gray-900">R$ {annualValue.toFixed(2).replace(".", ",")}</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⏰ <strong>Importante:</strong> Este PIX tem validade limitada. Após o pagamento, seu acesso será liberado
              automaticamente em até 5 minutos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
