"use client"

import { useState } from "react"
import { PlanSelection } from "@/components/plan-selection"
import { PaymentMethod } from "@/components/payment-method"
import { CreditCardForm } from "@/components/credit-card-form"
import { PixForm } from "@/components/pix-form"

export type Plan = {
  id: string
  name: string
  price: number
  description: string
  features: string[]
}

export type PaymentMethodType = "credit-card" | "pix" | null

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(null)

  const plans: Plan[] = [
    {
      id: "silver",
      name: "Plano Silver",
      price: 20.9,
      description: "Todos os cursos liberados",
      features: ["Qualidade Boa", "Suporte ao aluno", "Carta para Estágio", "Certificado"],
    },
    {
      id: "premium",
      name: "Plano Premium",
      price: 34.9,
      description: "Todos os cursos liberados",
      features: ["Qualidade Fantástica", "Suporte ao aluno", "Com Carta para Estágio", "Com Certificado"],
    },
  ]

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    setCurrentStep(2)
  }

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setPaymentMethod(method)
    setCurrentStep(method === "credit-card" ? 3 : 4)
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      setSelectedPlan(null)
    } else if (currentStep === 3 || currentStep === 4) {
      setCurrentStep(2)
      setPaymentMethod(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="text-2xl font-bold">
            <span className="text-green-500">CLICK</span>
            <span className="text-red-600">VETFLIX</span>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="p-4 text-sm text-gray-600">PASSO {currentStep} DE 4</div>

      {/* Content */}
      <main className="px-4 pb-8">
        {currentStep === 1 && <PlanSelection plans={plans} onPlanSelect={handlePlanSelect} />}

        {currentStep === 2 && selectedPlan && (
          <PaymentMethod
            selectedPlan={selectedPlan}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && selectedPlan && paymentMethod === "credit-card" && (
          <CreditCardForm selectedPlan={selectedPlan} onBack={handleBack} />
        )}

        {currentStep === 4 && selectedPlan && paymentMethod === "pix" && (
          <PixForm selectedPlan={selectedPlan} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}
