"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ExcelTemplateGuide() {
  return (
    <div className="container mx-auto py-8 bg-[#1a1a2e] text-white">
      <h1 className="text-2xl font-bold mb-6">Excel Template for Waste Management Dashboard</h1>
      <p className="mb-6">
        Below is a detailed view of how your Excel document should be structured. You can use this as a guide to create
        your own Excel file with your actual data.
      </p>

      <Tabs defaultValue="tenant-categories" className="w-full">
        <TabsList className="bg-[#2d2d42] border-[#3d3d52]">
          <TabsTrigger value="tenant-categories" className="data-[state=active]:bg-[#3d3d52]">
            Sheet 1: Tenant Categories
          </TabsTrigger>
          <TabsTrigger value="daily-waste" className="data-[state=active]:bg-[#3d3d52]">
            Sheet 2: Daily Waste Data
          </TabsTrigger>
          <TabsTrigger value="monthly-stats" className="data-[state=active]:bg-[#3d3d52]">
            Sheet 3: Monthly Statistics
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-[#3d3d52]">
            Sheet 4: Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenant-categories">
          <Card className="bg-[#2d2d42] border-[#3d3d52]">
            <CardHeader>
              <CardTitle>Sheet 1: Tenant Categories</CardTitle>
              <CardDescription className="text-gray-400">
                This sheet contains basic tenant information and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableHead className="text-white">Category Name</TableHead>
                      <TableHead className="text-white">No. of Tenants</TableHead>
                      <TableHead className="text-white">Daily Approx Load (kg)</TableHead>
                      <TableHead className="text-white">Cost Per Adhoc ($)</TableHead>
                      <TableHead className="text-white">Monthly Cost ($)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>Food T</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell>120</TableCell>
                      <TableCell>1500</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>Residential</TableCell>
                      <TableCell>35</TableCell>
                      <TableCell>78</TableCell>
                      <TableCell>85</TableCell>
                      <TableCell>2200</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>Commercial</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>120</TableCell>
                      <TableCell>150</TableCell>
                      <TableCell>3500</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>Retail</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>65</TableCell>
                      <TableCell>100</TableCell>
                      <TableCell>1800</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-waste">
          <Card className="bg-[#2d2d42] border-[#3d3d52]">
            <CardHeader>
              <CardTitle>Sheet 2: Daily Waste Data</CardTitle>
              <CardDescription className="text-gray-400">
                This sheet tracks daily waste generation for your charts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Category Name</TableHead>
                      <TableHead className="text-white">General Waste (kg)</TableHead>
                      <TableHead className="text-white">Recyclable Waste (kg)</TableHead>
                      <TableHead className="text-white">Bins Filled (General)</TableHead>
                      <TableHead className="text-white">Bins Filled (Recyclable)</TableHead>
                      <TableHead className="text-white">Bins Overfilled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>2023-04-14</TableCell>
                      <TableCell>Food T</TableCell>
                      <TableCell>40</TableCell>
                      <TableCell>15</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>0</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>2023-04-14</TableCell>
                      <TableCell>Residential</TableCell>
                      <TableCell>65</TableCell>
                      <TableCell>25</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>1</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>2023-04-15</TableCell>
                      <TableCell>Food T</TableCell>
                      <TableCell>42</TableCell>
                      <TableCell>18</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>0</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>2023-04-15</TableCell>
                      <TableCell>Residential</TableCell>
                      <TableCell>70</TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>2</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly-stats">
          <Card className="bg-[#2d2d42] border-[#3d3d52]">
            <CardHeader>
              <CardTitle>Sheet 3: Monthly Statistics</CardTitle>
              <CardDescription className="text-gray-400">
                This sheet tracks monthly aggregated data for your statistics section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableHead className="text-white">Month</TableHead>
                      <TableHead className="text-white">Year</TableHead>
                      <TableHead className="text-white">Total Waste (kg)</TableHead>
                      <TableHead className="text-white">Recycled Waste (kg)</TableHead>
                      <TableHead className="text-white">Diversion Rate (%)</TableHead>
                      <TableHead className="text-white">Total Cost ($)</TableHead>
                      <TableHead className="text-white">Savings ($)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>January</TableCell>
                      <TableCell>2023</TableCell>
                      <TableCell>2400</TableCell>
                      <TableCell>1400</TableCell>
                      <TableCell>58.3</TableCell>
                      <TableCell>8500</TableCell>
                      <TableCell>1200</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>February</TableCell>
                      <TableCell>2023</TableCell>
                      <TableCell>1980</TableCell>
                      <TableCell>1290</TableCell>
                      <TableCell>65.2</TableCell>
                      <TableCell>7800</TableCell>
                      <TableCell>1500</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>March</TableCell>
                      <TableCell>2023</TableCell>
                      <TableCell>2780</TableCell>
                      <TableCell>1890</TableCell>
                      <TableCell>68.0</TableCell>
                      <TableCell>9200</TableCell>
                      <TableCell>1800</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>April</TableCell>
                      <TableCell>2023</TableCell>
                      <TableCell>1890</TableCell>
                      <TableCell>1390</TableCell>
                      <TableCell>73.5</TableCell>
                      <TableCell>7500</TableCell>
                      <TableCell>2100</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="bg-[#2d2d42] border-[#3d3d52]">
            <CardHeader>
              <CardTitle>Sheet 4: Recommendations (Optional)</CardTitle>
              <CardDescription className="text-gray-400">
                You can include a sheet for recommendations based on data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Recommendation</TableHead>
                      <TableHead className="text-white">Priority</TableHead>
                      <TableHead className="text-white">Potential Savings ($)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>2023-04-20</TableCell>
                      <TableCell>Increase recycling bins in Food T area to improve diversion</TableCell>
                      <TableCell>High</TableCell>
                      <TableCell>500</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>2023-04-20</TableCell>
                      <TableCell>Adjust collection schedule for Residential to prevent overflow</TableCell>
                      <TableCell>Medium</TableCell>
                      <TableCell>300</TableCell>
                    </TableRow>
                    <TableRow className="border-[#3d3d52] hover:bg-[#3d3d52]/50">
                      <TableCell>2023-04-20</TableCell>
                      <TableCell>Consider compactors for Commercial waste to reduce volume</TableCell>
                      <TableCell>Low</TableCell>
                      <TableCell>1200</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Excel Import Guidelines</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>File Format:</strong> Save as .xlsx or .csv (for individual sheets)
          </li>
          <li>
            <strong>Data Types:</strong>
            <ul className="list-circle pl-6 mt-2 space-y-1">
              <li>Ensure dates are in a consistent format (YYYY-MM-DD recommended)</li>
              <li>Numbers should not include currency symbols in Excel (formatting only)</li>
              <li>Percentages should be entered as decimal values (e.g., 58.3 not 58.3%)</li>
            </ul>
          </li>
          <li>
            <strong>Data Validation:</strong>
            <ul className="list-circle pl-6 mt-2 space-y-1">
              <li>Category names should be consistent across all sheets</li>
              <li>No missing values in required fields</li>
              <li>Date ranges should be continuous for accurate chart visualization</li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex justify-center">
        <Button className="bg-[#4ecca3] hover:bg-[#3db893] text-[#1a1a2e]">
          <Download className="mr-2 h-4 w-4" />
          Create Your Excel File Based on This Template
        </Button>
      </div>
    </div>
  )
}
