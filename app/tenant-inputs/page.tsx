import type { Metadata } from "next"
import TenantInputForm from "@/components/tenant-input-form"

export const metadata: Metadata = {
  title: "Tenant Waste Management Inputs",
  description: "Input form for tenant waste management data",
}

export default function TenantInputsPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tenant Waste Management Inputs</h1>
          <p className="text-muted-foreground mt-2">
            Enter tenant categories and waste collection details to optimize waste management
          </p>
        </div>
        <TenantInputForm />
      </div>
    </div>
  )
}
