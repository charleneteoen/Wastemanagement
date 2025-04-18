"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { Edit, ChevronDown, Check, X, Upload } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AreaChart, type DataPoint } from "@/components/area-chart"
import { ScatterChart, type ScatterDataPoint } from "@/components/scatter-chart"
import { BarChart, type BarDataPoint } from "@/components/bar-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChartDataService, type ChartDataFilter } from "@/services/chart-data-service"
import { generateResult } from "./simulation"



// Input Declarations
interface CombinedInputFormat {
  foodOps: {
    dailyLoadGeneral: number;
    dailyLoadRecycled: number;
  };
  office: {
    dailyLoadGeneral: number;
    dailyLoadRecycled: number;
  };
  others: {
    dailyLoadGeneral: number;
    dailyLoadRecycled: number;
  };
  companySetting: {
    costAdhoc: number;
    regularBinCostMonthlyPerBin: number;
    recyclableBinCostMonthlyPerBin: number;
    generalBins: number;
    recyclableBins: number;
    garbageTimesClearedPerDay: 1 | 2
  };
}

// Output Declarations
interface OutputVariable {
  binsLoad : never[],
  binsOverfilled : never[],
  adhocTrips : never[],
  statistics: {
    averageMonthlyCost: number
    monthlyAdhocCost: number
    monthsElapsed: number
    recommendations: string
  }
}

export default function Dashboard() {
  const [timeRangeOverfilled, setTimeRangeOverfilled] = useState("Last 1 Year")
  const [timeRangeAdhoc, setTimeRangeAdhoc] = useState("Next 1 Month")
  const [timeRangeLoad, setTimeRangeLoad] = useState("Next 1 Month")

  // State to track which card is being edited
  const [editingId, setEditingId] = useState<string | null>(null)

  // State for chart data
  const [binsLoadData, setBinsLoadData] = useState<DataPoint[]>([])
  const [binsOverfilledData, setBinsOverfilledData] = useState<ScatterDataPoint[]>([])
  const [adhocTripsData, setAdhocTripsData] = useState<BarDataPoint[]>([])
  const [isLoadingCharts, setIsLoadingCharts] = useState(true)
  const [filterDaysOverfilled, setFilterDaysOverfilled] = useState(30)
  const [filterDaysAdhoc, setFilterDaysAdhoc] = useState(30)
  const [filterDaysLoad, setFilterDaysLoad] = useState(30)
  const [reload, setReload] = useState(false)
  const [combinedInputValues, setCombinedInputValues] = useState<CombinedInputFormat>({
    foodOps: {
      dailyLoadGeneral: 0,
      dailyLoadRecycled: 0,
    },
    office: {
      dailyLoadGeneral: 0,
      dailyLoadRecycled: 0,
    },
    others: {
      dailyLoadGeneral: 0,
      dailyLoadRecycled: 0,
    },
    companySetting: {
      costAdhoc: 0,
      regularBinCostMonthlyPerBin: 0,
      recyclableBinCostMonthlyPerBin: 0,
      generalBins: 0,
      recyclableBins: 0,
      garbageTimesClearedPerDay: 1,
    },
  })
  const [outputState, setOutputState] = useState<OutputVariable>({
    binsLoad: [],
    binsOverfilled: [],
    adhocTrips: [],
    statistics: {
      averageMonthlyCost: 0,
      monthlyAdhocCost: 0,
      monthsElapsed: 0,
      recommendations: "Generate a report to see more details",
    },
  })


  // State for input variables
  const [inputVariablesComponentControl, setinputVariablesComponentControl] = useState([
    {
      id: "dailyLoadGeneralFoodOps",
      label: "Food Ops Daily Approx Load",
      sublabel: "(General)",
      value: "500",
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
      id: "dailyLoadRecycledFoodOps",
      label: "Food Ops Daily Approx Load",
      sublabel: "(Recycled)",
      value: "20",
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
      id: "dailyLoadGeneralRegular",
      label: "Regular Daily Approx Load",
      sublabel: "(General)",
      value: "500",
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
      id: "dailyLoadRecycledRegular",
      label: "Regular Daily Approx Load",
      sublabel: "(Recycled)",
      value: "20",
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
      id: "dailyLoadGeneralOthers",
      label: "Others Daily Approx Load",
      sublabel: "(General)",
      value: "300",
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
      id: "dailyLoadRecycledOthers",
      label: "Others Daily Approx Load",
      sublabel: "(Recycled)",
      value: "20",
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
  ])

  const [inputVariablesCompanyControl, setInputVariablesCompanyControl] = useState([
    {
      id: "costAdhoc",
      label: "Cost Per Adhoc",
      sublabel: "Waste Collection",
      value: "100",
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
    },])

  

  // Temporary state for editing
  const [tempValue, setTempValue] = useState("")

  // Function to start editing a card
  const startEditing = (id: string, currentValue: string) => {
    setEditingId(id)
    setTempValue(currentValue)
  }

  // Function to save the edited value
  const saveEdit = (inputControl :string) => {
    if (inputControl === "company") {
      setInputVariablesCompanyControl(
        inputVariablesCompanyControl.map((variable) => (variable.id === editingId ? { ...variable, value: tempValue } : variable)),
      )
    }
    else if (inputControl === "component") {
      setinputVariablesComponentControl(
        inputVariablesComponentControl.map((variable) => (variable.id === editingId ? { ...variable, value: tempValue } : variable)),
      )
    }
    
    setEditingId(null)
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
  const loadChartData = async (chartdata:any) => {
    setIsLoadingCharts(true)
    console.log(filterDaysAdhoc, filterDaysLoad, filterDaysOverfilled)

    try {
      const filter: ChartDataFilter = {
        days: filterDaysLoad,
      }

      const data = await ChartDataService.fetchChartData(filter, chartdata)

      setBinsLoadData(data.binsLoad)
      setBinsOverfilledData(data.binsOverfilled)
      setAdhocTripsData(data.adhocTrips)
      setStatistics(data.statistics)
      setReload(!reload)
    } catch (error) {
      console.error("Error loading chart data:", error)
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoadingCharts(false)
    }
  }

  // Load chart data when timeRange or selectedCategory changes
  useEffect(() => {
    loadChartData(outputState);
    }, [timeRangeAdhoc,timeRangeLoad,timeRangeOverfilled])

  function generateReport() {
    // Grabs values for input variables from component dicts
    const foodOpsDailyLoadGeneral = parseFloat(inputVariablesComponentControl[0].value)
    const foodOpsDailyLoadRecycled = parseFloat(inputVariablesComponentControl[1].value)
    const regularDailyLoadGeneral = parseFloat(inputVariablesComponentControl[2].value)
    const regularDailyLoadRecycled = parseFloat(inputVariablesComponentControl[3].value)
    const othersDailyLoadGeneral = parseFloat(inputVariablesComponentControl[4].value)
    const othersDailyLoadRecycled = parseFloat(inputVariablesComponentControl[5].value)
    const costAdhoc = parseFloat(inputVariablesCompanyControl[0].value)
    const generalBins = parseFloat(inputVariablesCompanyControl[1].value)
    const recyclableBins = parseFloat(inputVariablesCompanyControl[2].value)
    const timesClearedPerDay = parseFloat(inputVariablesCompanyControl[3].value)
    const combinedInputsLocal = {
      foodOps: {
        dailyLoadGeneral: foodOpsDailyLoadGeneral,
        dailyLoadRecycled: foodOpsDailyLoadRecycled,
      },
      office: {
        dailyLoadGeneral: regularDailyLoadGeneral,
        dailyLoadRecycled: regularDailyLoadRecycled,
      },
      others: {
        dailyLoadGeneral: othersDailyLoadGeneral,
        dailyLoadRecycled: othersDailyLoadRecycled,
      },
      companySetting: {
        costAdhoc,
        regularBinCostMonthlyPerBin: 500,
        recyclableBinCostMonthlyPerBin: 200,
        generalBins,
        recyclableBins,
        garbageTimesClearedPerDay: timesClearedPerDay as 1 | 2,
      },
    }
    console.log(combinedInputsLocal)
    setCombinedInputValues(combinedInputsLocal);
    const result: OutputVariable = {
      ...generateResult(combinedInputsLocal),
      statistics: {
        averageMonthlyCost: 0,
        monthlyAdhocCost: 0,
        monthsElapsed: 0,
        recommendations: "No recommendations available",
        ...generateResult(combinedInputsLocal).statistics,
      },
    }
    setOutputState(result)
    loadChartData(result)
  };

  useEffect(() => {
    loadChartData(outputState)
  }, [filterDaysAdhoc,filterDaysLoad,filterDaysOverfilled])

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
      {/* End Sidebar */}

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center">
            {/* TODO: Disable Excel Template */}
            {/* <Link href="/excel-template" className="mr-4">
              <Button variant="outline" className="bg-[#2d2d42] border-[#3d3d52] text-white">
                <Upload className="mr-2 h-4 w-4" />
                Excel Template
              </Button>
            </Link> */}

            <Avatar className="h-10 w-10 border-2 border-[#4ecca3]">
              <AvatarImage src="/placeholder-user.jpg" alt="Jerrick" />
              <AvatarFallback className="bg-[#2d2d42] text-white">JR</AvatarFallback>
            </Avatar>

            {/* Disable Drop Down */}
            {/* <DropdownMenu>
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
            </DropdownMenu> */}
            {/* Just show Jerrick's Name */}
            <div className="ml-2 pr-4 text-white">Jerrick</div>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Input Variables</h2>
          {/* Custom Tenant Category Dropdown */}
          {/* Sets Selected Category to change the input load but cost per adhoc is the same */}
          {/* <div className="mb-6">
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
          </div> */}

          {/* Scrollable Input Variables */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inputVariablesComponentControl.map((variable) => (
              <Card
                key={variable.id}
                className="bg-[#2d2d42] border-none text-white p-6 relative flex items-center"
              >
                <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => startEditing(variable.id, variable.value)}
                >
                <Edit className="h-4 w-4" />
                </Button>

                {/* Editing Widget */}
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
                    onClick={() => saveEdit("component")}
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
                // Display Static Variable After Editing
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
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inputVariablesCompanyControl.map((variable) => (
              <Card
                key={variable.id}
                className="bg-[#2d2d42] border-none text-white p-6 relative flex items-center"
              >
                <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => startEditing(variable.id, variable.value)}
                >
                <Edit className="h-4 w-4" />
                </Button>

                {/* Editing Widget */}
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
                    onClick={() => saveEdit("company")}
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
                // Display Static Variable After Editing
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
            <div className="mt-4 ">
              <Button
                variant="outline"
                className="bg-[#4ecca3] border-[#3d3d52] text-white"
                onClick={generateReport}
                disabled={isLoadingCharts}
                >
                  Generate Report
                </Button>
            </div>
          </div>
        </section>

        <section>
          {/* Statistics Section */}
          {/* Connected */}
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
              <div className="text-3xl font-bold">${outputState.statistics.averageMonthlyCost.toFixed(2)}</div>
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
              <div className="text-3xl font-bold">${outputState.statistics.monthlyAdhocCost.toFixed(2)}</div>
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
              <div className="text-3xl font-bold">{outputState.statistics.monthsElapsed.toFixed(0)}</div>
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
              <p className="text-sm text-gray-300">{outputState.statistics.recommendations}</p>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          {/* Graph Section */}
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
                    {timeRangeLoad}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#2d2d42] text-white border-[#3d3d52]">
                    <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => {setTimeRangeLoad("Next 1 Month"); setFilterDaysLoad(30)}}>
                    Next 1 Month
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => {setTimeRangeLoad("Next 3 Months"); setFilterDaysLoad(90)}}>
                    Next 3 Months
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => {setTimeRangeLoad("Next 6 Months"); setFilterDaysLoad(180)}}>
                    Next 6 Months
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => {setTimeRangeLoad("Next 1 Year"); setFilterDaysLoad(365)}}>
                    Next 1 Year
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Graphs for Bins Load */}
          <Card className="bg-[#1a1a2e] border-[#2d2d42] p-4">
            <div className="relative h-64" key={reload ? "reload-true" : "reload-false"}>
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
                    {timeRangeOverfilled}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#2d2d42] text-white border-[#3d3d52]">
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeOverfilled("Next 1 Month")}>
                    Next 1 Month
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeOverfilled("Next 3 Months")}>
                    Next 3 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeOverfilled("Next 6 Months")}>
                    Next 6 Months
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeOverfilled("Next 1 Year")}>
                    Next 1 Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Card className="bg-[#1a1a2e] border-[#2d2d42] p-4">
            <div className="relative h-64" key={reload? "reload-true" : "reload-false"}>
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
                    {timeRangeAdhoc}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#2d2d42] text-white border-[#3d3d52]">
                  <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeAdhoc("Next 1 Month")}>
                      Next 1 Month
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeAdhoc("Next 3 Months")}>
                      Next 3 Months
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeAdhoc("Next 6 Months")}>
                      Next 6 Months
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3d3d52]" onClick={() => setTimeRangeAdhoc("Next 1 Year")}>
                      Next 1 Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Card className="bg-[#1a1a2e] border-[#2d2d42] p-4">
            <div className="relative h-64" key={reload ? "reload-true" : "reload-false"}>
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
