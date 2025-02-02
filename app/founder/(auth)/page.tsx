"use client"
import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { founderAnalytics, daftarPerformanceData } from "@/lib/dummy-data/analytics"
import ReactApexChart from "react-apexcharts"
import { BaseChartOptions, ChartData } from "@/lib/types/chart"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Download, Plus, Target, Users, TrendingUp, Award, Briefcase, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as XLSX from 'xlsx'

const Chart = dynamic(() => import('react-apexcharts') as any, { ssr: false }) as typeof ReactApexChart

// Enhanced quick stats
const quickStats = [
    {
        title: "Total Pitches",
        value: founderAnalytics.pitchesGiven,
        change: "+15.3%",
        trend: "up",
        icon: Target
    },
    {
        title: "Success Rate",
        value: `${((founderAnalytics.pitchesApproved / founderAnalytics.pitchesGiven) * 100).toFixed(1)}%`,
        change: "+8.2%",
        trend: "up",
        icon: TrendingUp
    },
    {
        title: "Active Offers",
        value: founderAnalytics.offersReceived - founderAnalytics.offersAccepted - founderAnalytics.offersRejected,
        change: "-2.5%",
        trend: "down",
        icon: Briefcase
    },
    {
        title: "Investor Meetings",
        value: "32",
        change: "+12.1%",
        trend: "up",
        icon: Users
    }
]

// Add more detailed performance metrics
const pitchPerformance = [
    { month: "Jan", approved: 12, rejected: 3, pending: 5 },
    { month: "Feb", approved: 15, rejected: 4, pending: 6 },
    { month: "Mar", approved: 18, rejected: 2, pending: 8 },
    { month: "Apr", approved: 22, rejected: 5, pending: 4 },
    { month: "May", approved: 20, rejected: 3, pending: 7 }
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
                Approved: perf.approved,
                Rejected: perf.rejected,
                Pending: perf.pending,
                "Success Rate": `${((perf.approved / (perf.approved + perf.rejected)) * 100).toFixed(1)}%`
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
        colors: ['#16a34a', '#dc2626', '#f59e0b'],
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
            name: 'Approved',
            data: pitchPerformance.map(p => p.approved)
        },
        {
            name: 'Rejected',
            data: pitchPerformance.map(p => p.rejected)
        },
        {
            name: 'Pending',
            data: pitchPerformance.map(p => p.pending)
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
                        <h3 className="text-sm text-gray-400">{stat.title}</h3>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pitch Performance */}
                <div className="lg:col-span-2 bg-[#1a1a1a] p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Pitch Performance</h3>
                    <div className="h-[400px]">
                        <Chart
                            options={pitchPerformanceOptions}
                            series={pitchPerformanceSeries}
                            type="bar"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Additional charts and metrics... */}
            </div>
        </div>
    )
}