import type { DataPoint } from "@/components/area-chart"
import type { ScatterDataPoint } from "@/components/scatter-chart"
import type { BarDataPoint } from "@/components/bar-chart"

/**
 * Interface for chart data response from API
 */
export interface ChartDataResponse {
  binsLoad: DataPoint[]
  binsOverfilled: ScatterDataPoint[]
  adhocTrips: BarDataPoint[]
  statistics: {
    averageMonthlyCost: number
    monthlyAdhocCost: number
    monthsElapsed: number
    recommendations: string
  }
}

/**
 * Interface for chart data filter options
 */
export interface ChartDataFilter {
  days: number
}

/**
 * Service for fetching and managing chart data
 */


// currently using mock data for development and testing
export class ChartDataService {
  /**
   * Fetch chart data based on filter options
   */
  static async fetchChartData(filter: ChartDataFilter, output : any): Promise<ChartDataResponse> {

    const days = filter.days;
    output.binsLoad = output.binsLoad.slice(0, days);
    output.binsOverfilled = output.binsOverfilled.slice(0, days);
    output.adhocTrips = output.adhocTrips.slice(0, days);
    return output;
  }

  /**
   * Generate mock data for development and testing
   * In a real application, this would be replaced with actual API calls
   */
  // private static generateMockData(filter: ChartDataFilter): ChartDataResponse {
  //   // Generate dates based on the time range
  //   const dates = this.generateDatesForRange(filter.timeRange)

  //   // Generate bins load data (line chart)
  //   const binsLoad = [
  //     { date: "Apr 14", general: 2, recyclable: 1 },
  //     { date: "Apr 15", general: 3, recyclable: 2 },
  //     { date: "Apr 16", general: 2, recyclable: 3 },
  //     { date: "Apr 17", general: 3, recyclable: 2 },
  //     { date: "Apr 18", general: 4, recyclable: 2 },
  //     { date: "Apr 19", general: 3, recyclable: 2 },
  //     { date: "Apr 20", general: 4, recyclable: 3 },
  //   ]

  //   // Generate bins overfilled data (scatter plot)
  //   const binsOverfilled = [
  //     { date: "Apr 14", general: null, recyclable: null },
  //     { date: "Apr 15", general: null, recyclable: null },
  //     { date: "Apr 16", general: 1, recyclable: 1 },
  //     { date: "Apr 17", general: 1, recyclable: null },
  //     { date: "Apr 18", general: 2, recyclable: null },
  //     { date: "Apr 19", general: null, recyclable: 1 },
  //     { date: "Apr 20", general: null, recyclable: 1 },
  //   ]

  //   // Generate adhoc trips data (bar chart)
  //   const adhocTrips = [
  //     { date: "Apr 14", value: 1 },
  //     { date: "Apr 15", value: 0 },
  //     { date: "Apr 16", value: 0 },
  //     { date: "Apr 17", value: 1 },
  //     { date: "Apr 18", value: 0 },
  //     { date: "Apr 19", value: 0 },
  //     { date: "Apr 20", value: 1 },
  //   ]

  //   // Generate statistics data based on tenant category
  //   let statistics = {
  //     averageMonthlyCost: 2000,
  //     monthlyAdhocCost: 600,
  //     monthsElapsed: 20,
  //     recommendations: "No issues with overfilled bins",
  //   }

  //   // Adjust statistics based on tenant category
  //   if (filter.tenantCategory === "Regular") {
  //     statistics = {
  //       averageMonthlyCost: 1500,
  //       monthlyAdhocCost: 450,
  //       monthsElapsed: 20,
  //       recommendations: "Consider adding more recycling bins",
  //     }
  //   } else if (filter.tenantCategory === "Others") {
  //     statistics = {
  //       averageMonthlyCost: 1200,
  //       monthlyAdhocCost: 300,
  //       monthsElapsed: 20,
  //       recommendations: "Optimize collection schedule to reduce costs",
  //     }
  //   }

  //   return {
  //     binsLoad,
  //     binsOverfilled,
  //     adhocTrips,
  //     statistics,
  //   }
  // }

  /**
   * Generate date strings based on the selected time range
   */
  private static generateDatesForRange(timeRange: string): string[] {
    const dates: string[] = []
    const today = new Date()
    let daysToGenerate = 7

    // Determine how many days to generate based on the time range
    if (timeRange === "Last 30 days") {
      daysToGenerate = 30
    } else if (timeRange === "Last 90 days") {
      daysToGenerate = 90
    }

    // Generate dates in "MMM DD" format
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Format date as "Apr 14" style
      const month = date.toLocaleString("default", { month: "short" })
      const day = date.getDate()
      dates.push(`${month} ${day}`)
    }

    return dates
  }
}
