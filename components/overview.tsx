"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    "Total Waste": 2400,
    Recycled: 1400,
  },
  {
    name: "Feb",
    "Total Waste": 1980,
    Recycled: 1290,
  },
  {
    name: "Mar",
    "Total Waste": 2780,
    Recycled: 1890,
  },
  {
    name: "Apr",
    "Total Waste": 1890,
    Recycled: 1390,
  },
  {
    name: "May",
    "Total Waste": 2390,
    Recycled: 1590,
  },
  {
    name: "Jun",
    "Total Waste": 3490,
    Recycled: 2490,
  },
  {
    name: "Jul",
    "Total Waste": 2340,
    Recycled: 1482,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total Waste" fill="#8884d8" />
        <Bar dataKey="Recycled" fill="#4ade80" />
      </BarChart>
    </ResponsiveContainer>
  )
}
