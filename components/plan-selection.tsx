"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Plan } from "@/app/page"

interface PlanSelectionProps {
  plans: Plan[]
  onPlanSelect: (plan: Plan) => void
}

export function PlanSelection({ plans, onPlanSelect }: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan.id)
  }

  const handleContinue = () => {
    const plan = plans.find((p) => p.id === selectedPlan)
    if (plan) {
      onPlanSelect(plan)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Escolha o melhor plano para você</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative cursor-pointer transition-all duration-200 ${
              selectedPlan === plan.id ? "ring-2 ring-red-600 bg-red-50" : "hover:shadow-lg"
            }`}
            onClick={() => handlePlanClick(plan)}
          >
            <div className="p-6">
              {selectedPlan === plan.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">R$ {plan.price.toFixed(2).replace(".", ",")}</div>
                <div className="text-sm text-gray-600">/mês</div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    • {feature}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continuar
        </Button>
      </div>

      <div className="mt-8 text-sm text-gray-600 space-y-4">
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span>Horário das aulas</span>
            <span>24 horas disponível para assistir, aulas gravadas</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span>Resolução</span>
            <span>Até 4K (Ultra HD)</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span>Aparelhos compatíveis</span>
            <span>TV, computador, celular, tablet</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Critérios para ser aluno</span>
            <span>Amar os animais e ter 14 anos ou mais</span>
          </div>
        </div>
      </div>
    </div>
  )
}
