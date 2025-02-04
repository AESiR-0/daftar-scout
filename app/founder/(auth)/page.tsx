"use client"
import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { founderAnalytics, daftarPerformanceData } from "@/lib/dummy-data/analytics"
import ReactApexChart from "react-apexcharts"
import { BaseChartOptions, ChartData } from "@/lib/types/chart"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Download, Target, Users, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as XLSX from 'xlsx'

const Chart = dynamic(() => import('react-apexcharts') as any, { ssr: false }) as typeof ReactApexChart

// Quick stats updated for scouting focus
const quickStats = [
    {
        title: "Total Pitches",
        value: founderAnalytics.pitchesGiven,
        change: "+15.3%",
        trend: "up",
        icon: Target
    },
    {
        title: "Scout Requests",
        value: founderAnalytics.scoutingRequests,
        change: "+8.2%",
        trend: "up",
        icon: Users
    },
    {
        title: "Accepted Matches",
        value: founderAnalytics.requestsAccepted,
        change: "+12.1%",
        trend: "up",
        icon: Award
    },
    {
        title: "Avg Response Time",
        value: "48h",
        change: "-2.5%",
        trend: "down",
        icon: Clock
    }
]

// Add more detailed scouting metrics
const pitchPerformance = [
    { month: "Jan", matched: 12, pending: 5, rejected: 3 },
    { month: "Feb", matched: 15, pending: 6, rejected: 4 },
    { month: "Mar", matched: 18, pending: 8, rejected: 2 },
    { month: "Apr", matched: 22, pending: 4, rejected: 5 },
    { month: "May", matched: 20, pending: 7, rejected: 3 }
]

function LoadingSkeleton() {
    return (
        <div className="w-full h-screen bg-[#0e0e0e] animate-pulse p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[500px] bg-gray-800 rounded-lg"></div>
                <div className="h-[500px] bg-gray-800 rounded-lg"></div>
            </div>
        </div>
    )
}

export default function Page() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return <LoadingSkeleton />
    }

    const handleExport = () => {
        const exportData = {
            quickStats: quickStats.map(stat => ({
                Metric: stat.title,
                Value: stat.value,
                Change: stat.change
            })),
            pitchPerformance: pitchPerformance.map(perf => ({
                Month: perf.month,
                Matched: perf.matched,
                Pending: perf.pending,
                Rejected: perf.rejected,
                "Match Rate": `${((perf.matched / (perf.matched + perf.rejected)) * 100).toFixed(1)}%`
            }))
        }

        const wb = XLSX.utils.book_new()

        // Add sheets
        const wsStats = XLSX.utils.json_to_sheet(exportData.quickStats)
        XLSX.utils.book_append_sheet(wb, wsStats, "Performance Metrics")

        const wsPerformance = XLSX.utils.json_to_sheet(exportData.pitchPerformance)
        XLSX.utils.book_append_sheet(wb, wsPerformance, "Pitch Performance")

        // Save file
        XLSX.writeFile(wb, `founder_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    // Chart configurations
    const pitchPerformanceOptions: any = {
        chart: {
            type: 'bar',
            background: 'transparent',
            toolbar: { show: false }
        },
        colors: ['#16a34a', '#f59e0b', '#dc2626'],
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 4,
                columnWidth: '55%',
                stacked: true
            }
        },
        xaxis: {
            categories: pitchPerformance.map(p => p.month),
            labels: { style: { colors: '#fff' } }
        },
        yaxis: {
            labels: { style: { colors: '#fff' } }
        },
        legend: {
            labels: { colors: '#fff' }
        },
        theme: { mode: 'dark' }
    }

    const pitchPerformanceSeries = [
        {
            name: 'Matched',
            data: pitchPerformance.map(p => p.matched)
        },
        {
            name: 'Pending',
            data: pitchPerformance.map(p => p.pending)
        },
        {
            name: 'Rejected',
            data: pitchPerformance.map(p => p.rejected)
        }
    ]

    return (
        <div className="min-h-screen bg-[#0e0e0e] p-6 space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Founder Dashboard</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                    <Card key={index} className="p-6 bg-[#1a1a1a] border-none">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-400">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                            </div>
                            <div className={cn(
                                "p-2 rounded-full",
                                stat.trend === "up" ? "bg-green-500/10" : "bg-red-500/10"
                            )}>
                                <stat.icon className={cn(
                                    "h-5 w-5",
                                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                                )} />
                            </div>
                        </div>
                        <div className="flex items-center mt-4">
                            {stat.trend === "up" ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                            <span className={cn(
                                "text-sm ml-1",
                                stat.trend === "up" ? "text-green-500" : "text-red-500"
                            )}>
                                {stat.change}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">vs last month</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pitch Performance */}
                <div className="lg:col-span-3 bg-[#1a1a1a] p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Scout Matching Performance</h3>
                    <div className="h-[400px]">
                        <Chart
                            options={pitchPerformanceOptions}
                            series={pitchPerformanceSeries}
                            type="bar"
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}