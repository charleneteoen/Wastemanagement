"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Plus, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

// Define the schema for throwing trips
const throwingTripSchema = z.object({
  time: z.string().min(1, "Please enter an approximate throwing time"),
})

// Define the schema for tenant categories
const tenantCategorySchema = z.object({
  name: z.string().min(1, "Tenant category name is required"),
  number: z.coerce.number().min(1, "Number must be at least 1"),
  dailyLoad: z.object({
    monday: z.coerce.number().min(0, "Load cannot be negative"),
    tuesday: z.coerce.number().min(0, "Load cannot be negative"),
    wednesday: z.coerce.number().min(0, "Load cannot be negative"),
    thursday: z.coerce.number().min(0, "Load cannot be negative"),
    friday: z.coerce.number().min(0, "Load cannot be negative"),
    saturday: z.coerce.number().min(0, "Load cannot be negative"),
    sunday: z.coerce.number().min(0, "Load cannot be negative"),
  }),
  throwingTrips: z.array(throwingTripSchema).min(1).max(5),
})

// Define the form schema
const formSchema = z.object({
  tenantCategories: z.array(tenantCategorySchema).min(1).max(5),
  costPerAdhocTrip: z.coerce.number().min(0, "Cost cannot be negative"),
  costPerMonthlySubscriptionGeneral: z.coerce.number().min(0, "Cost cannot be negative"),
  costPerMonthlySubscriptionRecycle: z.coerce.number().min(0, "Cost cannot be negative"),
})

type FormValues = z.infer<typeof formSchema>

// Default values for the form
const defaultTenantCategory = {
  name: "",
  number: 1,
  dailyLoad: {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  },
  throwingTrips: [{ time: "08:00" }],
}

const defaultValues: FormValues = {
  tenantCategories: [defaultTenantCategory],
  costPerAdhocTrip: 0,
  costPerMonthlySubscriptionGeneral: 0,
  costPerMonthlySubscriptionRecycle: 0,
}

export default function TenantInputForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Field array for tenant categories
  const {
    fields: tenantFields,
    append: appendTenant,
    remove: removeTenant,
  } = useFieldArray({
    control: form.control,
    name: "tenantCategories",
  })

  // State to store the field arrays for throwing trips
  const [throwingTripsArrays, setThrowingTripsArrays] = useState<any[]>([])

  useEffect(() => {
    // Initialize the field arrays for throwing trips when tenantFields change
    const initialThrowingTripsArrays = tenantFields.map((_, tenantIndex) =>
      useFieldArray({
        control: form.control,
        name: `tenantCategories.${tenantIndex}.throwingTrips`,
      }),
    )
    setThrowingTripsArrays(initialThrowingTripsArrays)
  }, [tenantFields, form.control])

  // Function to handle throwing trips for a specific tenant category
  const getThrowingTripsFieldArray = (tenantIndex: number) => {
    return throwingTripsArrays[tenantIndex]
  }

  function onSubmit(data: FormValues) {
    toast({
      title: "Form submitted",
      description: "Your tenant waste management data has been saved.",
    })
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tenantFields.map((tenantField, tenantIndex) => {
              const throwingTripsArray = getThrowingTripsFieldArray(tenantIndex)

              return (
                <div key={tenantField.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Tenant Category {tenantIndex + 1}</h3>
                    {tenantIndex > 0 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeTenant(tenantIndex)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`tenantCategories.${tenantIndex}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Residential, Commercial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tenantCategories.${tenantIndex}.number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Tenants</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel>Daily Approximate Load (kg)</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mt-2">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name={`tenantCategories.${tenantIndex}.dailyLoad.${day}` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="capitalize text-xs">{day}</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel>Daily Throwing Trips</FormLabel>
                      {throwingTripsArray?.fields.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => throwingTripsArray?.append({ time: "" })}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Trip
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {throwingTripsArray?.fields.map((tripField, tripIndex) => (
                        <div key={tripField.id} className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`tenantCategories.${tenantIndex}.throwingTrips.${tripIndex}.time`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {tripIndex > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => throwingTripsArray?.remove(tripIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove trip</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {tenantFields.length < 5 && (
              <Button type="button" variant="outline" onClick={() => appendTenant(defaultTenantCategory)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant Category
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="costPerAdhocTrip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost per Adhoc Waste Collection Trip ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPerMonthlySubscriptionGeneral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost per Monthly Subscription - General ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPerMonthlySubscriptionRecycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost per Monthly Subscription - Recycle ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Data
          </Button>
        </div>
      </form>
    </Form>
  )
}
