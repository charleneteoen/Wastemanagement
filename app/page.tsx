"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Edit, ChevronDown, Check, X, Upload } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AreaChart, type DataPoint } from "@/components/area-chart"
import { ScatterChart, type ScatterDataPoint } from "@/components/scatter-chart"
import { BarChart, type BarDataPoint } from "@/components/bar-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartDataService, type ChartDataFilter } from "@/services/chart-data-service"

// Define types for our input variables
interface InputVariable {
  id: string
  label: string
  sublabel?: string
  value: string
  icon: React.ReactNode
  unit?: string
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("Last 7 days")
  const [selectedCategory, setSelectedCategory] = useState("Food Ops")

  // State to track which card is being edited
  const [editingId, setEditingId] = useState<string | null>(null)

  // State for chart data
  const [binsLoadData, setBinsLoadData] = useState<DataPoint[]>([])
  const [binsOverfilledData, setBinsOverfilledData] = useState<ScatterDataPoint[]>([])
  const [adhocTripsData, setAdhocTripsData] = useState<BarDataPoint[]>([])
  const [isLoadingCharts, setIsLoadingCharts] = useState(true)

  // State for input variables
  const [inputVariables, setInputVariables] = useState<InputVariable[]>([
    {
      id: "dailyLoadGeneral",
      label: "Daily Approx Load",
      sublabel: "(General)",
      value: "1200",
      unit: "L",
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      id: "dailyLoadRecycled",
      label: "Daily Approx Load",
      sublabel: "(Recycled)",
      value: "120",
      unit: "L",
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      id: "costAdhoc",
      label: "Cost Per Adhoc",
      sublabel: "Waste Collection",
      value: "120",
      unit: "$",
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "generalBins",
      label: "Number of",
      sublabel: "General Bins",
      value: "3",
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      id: "recyclableBins",
      label: "Number of",
      sublabel: "Recyclables Bins",
      value: "1",
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      id: "timesClearedPerDay",
      label: "Number of times",
      sublabel: "cleared a day",
      value: "2",
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ])

  // Temporary state for editing
  const [tempValue, setTempValue] = useState("")

  // Function to start editing a card
  const startEditing = (id: string, currentValue: string) => {
    setEditingId(id)
    setTempValue(currentValue)
  }

  // Function to save the edited value
  const saveEdit = () => {
    if (editingId) {
      setInputVariables(
        inputVariables.map((variable) => (variable.id === editingId ? { ...variable, value: tempValue } : variable)),
      )
      setEditingId(null)
    }
  }

  // Function to cancel editing
  const cancelEdit = () => {
    setEditingId(null)
  }

  // Add state for statistics
  const [statistics, setStatistics] = useState({
    averageMonthlyCost: 0,
    monthlyAdhocCost: 0,
    monthsElapsed: 0,
    recommendations: "",
  })

  // Function to load chart data
  const loadChartData = async () => {
    setIsLoadingCharts(true)

    try {
      const filter: ChartDataFilter = {
        timeRange,
        tenantCategory: selectedCategory,
      }

      const data = await ChartDataService.fetchChartData(filter)

      setBinsLoadData(data.binsLoad)
      setBinsOverfilledData(data.binsOverfilled)
      setAdhocTripsData(data.adhocTrips)
      setStatistics(data.statistics)
    } catch (error) {
      console.error("Error loading chart data:", error)
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoadingCharts(false)
    }
  }

  // Load chart data when timeRange or selectedCategory changes
  useEffect(() => {
    loadChartData()
  }, [timeRange, selectedCategory])

  return (
    <div className="flex h-screen bg-[#1a1a2e] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a2e] border-r border-[#2d2d42] p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-[#4ecca3] text-2xl font-bold">VIDACITY</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Button variant="secondary" className="w-full justify-start bg-[#2d2d42] hover:bg-[#3d3d52] text-white">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2d2d42]">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Button>
        </nav>

        <div className="mt-auto space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2d2d42]">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Help
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2d2d42]">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center">
            <Link href="/excel-template" className="mr-4">
              <Button variant="outline" className="bg-[#2d2d42] border-[#3d3d52] text-white">
                <Upload className="mr-2 h-4 w-4" />
                Excel Template
              </Button>
            </Link>
            <Avatar className="h-10 w-10 border-2 border-[#4ecca3]">
              <AvatarImage src="/placeholder-user.jpg" alt="Jerrick" />
              <AvatarFallback className="bg-[#2d2d42] text-white">JR</AvatarFallback>
            </Avatar>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-2 text-white">
                  Jerrick
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#2d2d42] text-white border-[#3d3d52]">
                <DropdownMenuItem className="hover:bg-[#3d3d52]">Profile</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#3d3d52]">Settings</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#3d3d52]">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Input Variables</h2>

          {/* Custom Tenant Category Dropdown */}
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] h-[100px] bg-[#2d2d42] border-[#3d3d52] text-white justify-between p-6"
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-2xl font-bold">1</div>
                    <div className="text-left">
                      <div className="text-sm text-gray-400">Tenant Category</div>
                      <div className="text-xl font-semibold mt-1">{selectedCategory}</div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#2d2d42] border-[#3d3d52] text-white w-[240px]">
                <DropdownMenuItem
                  className="py-3 hover:bg-[#3d3d52] focus:bg-[#3d3d52]"
                  onClick={() => setSelectedCategory("Food Ops")}
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-lg font-bold">1</div>
                    <div>
                      <div className="text-sm text-gray-400">Tenant Category</div>
                      <div className="text-lg font-semibold">Food Ops</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="py-3 hover:bg-[#3d3d52] focus:bg-[#3d3d52]"
                  onClick={() => setSelectedCategory("Regular")}
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-lg font-bold">2</div>
                    <div>
                      <div className="text-sm text-gray-400">Tenant Category</div>
                      <div className="text-lg font-semibold">Regular</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="py-3 hover:bg-[#3d3d52] focus:bg-[#3d3d52]"
                  onClick={() => setSelectedCategory("Others")}
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-lg font-bold">3</div>
                    <div>
                      <div className="text-sm text-gray-400">Tenant Category</div>
                      <div className="text-lg font-semibold">Others</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Scrollable Input Variables */}
          <div className="relative">
            <ScrollArea className="w-full pb-4">
              <div className="flex space-x-4 pb-2">
                {inputVariables.map((variable) => (
                  <Card
                    key={variable.id}
                    className="bg-[#2d2d42] border-none text-white p-6 relative w-[240px] h-[100px] flex items-center"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => startEditing(variable.id, variable.value)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {editingId === variable.id ? (
                      <div className="flex items-center w-full">
                        <Input
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="bg-[#3d3d52] border-[#4d4d62] text-white h-8"
                          autoFocus
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300 hover:bg-[#3d3d52]"
                            onClick={saveEdit}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-[#3d3d52]"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center w-full">
                        <div className="bg-[#3d3d52] p-2 rounded-md mr-3">{variable.icon}</div>
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-400">{variable.label}</div>
                          {variable.sublabel && <div className="text-sm text-gray-400">{variable.sublabel}</div>}
                          <div className="text-2xl font-bold mt-1">
                            {variable.unit && variable.unit !== "$"
                              ? `${variable.value} ${variable.unit}`
                              : variable.unit === "$"
                                ? `${variable.unit}${variable.value}`
                                : variable.value}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#2d3e50] border-none text-white p-4">
              <div className="flex items-center mb-4">
                <div className="bg-[#4ecca3] p-2 rounded-full mr-2">
                  <svg
                    className="h-5 w-5 text-[#2d3e50]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm">Average Monthly Cost</span>
              </div>
              <div className="text-3xl font-bold">${statistics.averageMonthlyCost}</div>
            </Card>

            <Card className="bg-[#2d3e50] border-none text-white p-4">
              <div className="flex items-center mb-4">
                <div className="bg-[#4ecca3] p-2 rounded-full mr-2">
                  <svg
                    className="h-5 w-5 text-[#2d3e50]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm">Monthly Ad-hoc Cost</span>
              </div>
              <div className="text-3xl font-bold">${statistics.monthlyAdhocCost}</div>
            </Card>

            <Card className="bg-[#2d3e50] border-none text-white p-4">
              <div className="flex items-center mb-4">
                <div className="bg-[#4ecca3] p-2 rounded-full mr-2">
                  <svg
                    className="h-5 w-5 text-[#2d3e50]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm">Months elapsed</span>
              </div>
              <div className="text-3xl font-bold">{statistics.monthsElapsed}</div>
            </Card>

            <Card className="bg-[#2d3e50] border-none text-white p-4">
              <div className="flex items-center mb-4">
                <div className="bg-[#4ecca3] p-2 rounded-full mr-2">
                  <svg
                    className="h-5 w-5 text-[#2d3e50]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm">Recommendations</span>
              </div>
              <p className="text-sm text-gray-300">{statistics.recommendations}</p>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Load of Bins</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#4ecca3] mr-2"></div>
                <span className="text-sm text-gray-300">General</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#eeff41] mr-2"></div>
                <span className="text-sm text-gray-300">Recyclable</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-[#2d2d42] border-[#3d3d52] text-white">
                    {timeRange}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#2d2d42] text-white border-[#3d3d52]">
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 7 days")}>
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 30 days")}>
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 90 days")}>
                    Last 90 days
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Card className="bg-[#1a1a2e] border-[#2d2d42] p-4">
            <div className="relative h-64">
              {isLoadingCharts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white">Loading chart data...</div>
                </div>
              ) : (
                <AreaChart
                  data={binsLoadData}
                  generalColor="#4ecca3"
                  recyclableColor="#eeff41"
                  yAxisLabel="Number of Bins"
                  yAxisMax={4}
                />
              )}
            </div>
          </Card>
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">No. of overfilled bins</h2>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-[#2d2d42] border-[#3d3d52] text-white">
                    {timeRange}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#2d2d42] text-white border-[#3d3d52]">
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 7 days")}>
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 30 days")}>
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 90 days")}>
                    Last 90 days
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Card className="bg-[#1a1a2e] border-[#2d2d42] p-4">
            <div className="relative h-64">
              {isLoadingCharts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white">Loading chart data...</div>
                </div>
              ) : (
                <ScatterChart
                  data={binsOverfilledData}
                  generalColor="#4ecca3"
                  recyclableColor="#eeff41"
                  yAxisLabel="Number of Bins"
                  yAxisMax={2}
                />
              )}
            </div>
          </Card>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">No. of adhoc Trips</h2>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-[#2d2d42] border-[#3d3d52] text-white">
                    {timeRange}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#2d2d42] text-white border-[#3d3d52]">
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 7 days")}>
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 30 days")}>
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRange("Last 90 days")}>
                    Last 90 days
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Card className="bg-[#1a1a2e] border-[#2d2d42] p-4">
            <div className="relative h-64">
              {isLoadingCharts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white">Loading chart data...</div>
                </div>
              ) : (
                <BarChart data={adhocTripsData} barColor="#4ecca3" yAxisLabel="Number of Trips" yAxisMax={1} />
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
