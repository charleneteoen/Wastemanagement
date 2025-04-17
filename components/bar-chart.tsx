"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

/**
 * Data point structure for the BarChart
 */
export interface BarDataPoint {
  date: string
  value: number
}

/**
 * Props for the BarChart component
 */
export interface BarChartProps {
  /** Array of data points to display in the chart */
  data: BarDataPoint[]
  /** Color for the bars */
  barColor: string
  /** Optional title for the chart */
  title?: string
  /** Optional y-axis label */
  yAxisLabel?: string
  /** Optional maximum value for the y-axis */
  yAxisMax?: number
}

export function BarChart({ data, barColor, title, yAxisLabel = "", yAxisMax }: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const labels = data.map((d) => d.date)
    const values = data.map((d) => d.value)

    // Calculate max value for y-axis if not provided
    const calculatedMax = yAxisMax || Math.max(...values) * 1.2 || 1

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Adhoc Trips",
            data: values,
            backgroundColor: barColor,
            borderColor: barColor,
            borderWidth: 0,
            borderRadius: 2,
            barThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: title
            ? {
                display: true,
                text: title,
                color: "#fff",
                font: {
                  size: 16,
                  weight: "bold",
                },
              }
            : undefined,
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: "#2d2d42",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#3d3d52",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#6c7293",
            },
          },
          y: {
            min: 0,
            max: calculatedMax,
            grid: {
              color: "#2d2d4220",
              drawBorder: false,
            },
            ticks: {
              color: "#6c7293",
              stepSize: 1,
              precision: 0,
            },
            title: yAxisLabel
              ? {
                  display: true,
                  text: yAxisLabel,
                  color: "#6c7293",
                }
              : undefined,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, barColor, title, yAxisLabel, yAxisMax])

  return <canvas ref={chartRef} />
}
