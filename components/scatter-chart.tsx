"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

/**
 * Data point structure for the ScatterChart
 */
export interface ScatterDataPoint {
  date: string
  general?: number
  recyclable?: number
}

/**
 * Props for the ScatterChart component
 */
export interface ScatterChartProps {
  /** Array of data points to display in the chart */
  data: ScatterDataPoint[]
  /** Color for the general waste points */
  generalColor: string
  /** Color for the recyclable waste points */
  recyclableColor: string
  /** Optional title for the chart */
  title?: string
  /** Optional y-axis label */
  yAxisLabel?: string
  /** Optional maximum value for the y-axis */
  yAxisMax?: number
}

export function ScatterChart({
  data,
  generalColor,
  recyclableColor,
  title,
  yAxisLabel = "",
  yAxisMax,
}: ScatterChartProps) {
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

    // Transform data for scatter plot
    const generalData = data
      .map((d, i) => ({
        x: i,
        y: d.general || null,
      }))
      .filter((d) => d.y !== null)

    const recyclableData = data
      .map((d, i) => ({
        x: i,
        y: d.recyclable || null,
      }))
      .filter((d) => d.y !== null)

    // Calculate max value for y-axis if not provided
    const allValues = [...data.map((d) => d.general || 0), ...data.map((d) => d.recyclable || 0)]
    const calculatedMax = yAxisMax || Math.max(...allValues) * 1.2 || 2

    chartInstance.current = new Chart(ctx, {
      type: "scatter",
      data: {
        labels,
        datasets: [
          {
            label: "General",
            data: generalData,
            backgroundColor: generalColor,
            borderColor: generalColor,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: "Recyclable",
            data: recyclableData,
            backgroundColor: recyclableColor,
            borderColor: recyclableColor,
            pointRadius: 6,
            pointHoverRadius: 8,
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
            display: true,
            position: "top",
            labels: {
              color: "#6c7293",
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: "#2d2d42",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#3d3d52",
            borderWidth: 1,
            callbacks: {
              title: (items) => {
                if (items.length > 0) {
                  const index = items[0].dataIndex
                  return labels[index]
                }
                return ""
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            min: -0.5,
            max: labels.length - 0.5,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#6c7293",
              callback: (value) => labels[value as number] || "",
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
  }, [data, generalColor, recyclableColor, title, yAxisLabel, yAxisMax])

  return <canvas ref={chartRef} />
}
