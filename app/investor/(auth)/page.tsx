"use client"
import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { investmentTrends } from "@/lib/dummy-data/analytics"
import ReactApexChart from "react-apexcharts"
import { BaseChartOptions, ChartData } from "@/lib/types/chart"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users, Target, Briefcase, Award, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import * as XLSX from 'xlsx'

const Chart = dynamic(() => import('react-apexcharts') as any, { ssr: false }) as typeof ReactApexChart

// Quick stats data
const quickStats = [
    {
        title: "Total Investment",
        value: "$2.4M",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign
    },
    {
        title: "Active Deals",
        value: "24",
        change: "+3.2%",
        trend: "up",
        icon: Briefcase
    },
    {
        title: "Portfolio Companies",
        value: "18",
        change: "-2.1%",
        trend: "down",
        icon: Users
    },
    {
        title: "Success Rate",
        value: "76%",
        change: "+5.3%",
        trend: "up",
        icon: Target
    }
]

// Portfolio performance data
const portfolioPerformance = [
    { company: "Tech Innovators", growth: 45, investment: 500000, sector: "AI" },
    { company: "Green Energy Co", growth: 32, investment: 300000, sector: "CleanTech" },
    { company: "HealthTech Plus", growth: 28, investment: 450000, sector: "Healthcare" },
    { company: "FinServ Pro", growth: 38, investment: 600000, sector: "FinTech" },
    { company: "EduTech Solutions", growth: 25, investment: 250000, sector: "Education" }
]

// Sector distribution data
const sectorDistribution = [
    { sector: "AI/ML", percentage: 35 },
    { sector: "FinTech", percentage: 25 },
    { sector: "Healthcare", percentage: 20 },
    { sector: "CleanTech", percentage: 15 },
    { sector: "Others", percentage: 5 }
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
    const router = useRouter()
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

    // Investment Trends Chart Options
    const investmentOptions: BaseChartOptions = {
        chart: {
            type: "bar" as const,
            background: 'transparent',
            toolbar: {
                show: false
            }
        },
        colors: ['#16a34a'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%',
            }
        },
        xaxis: {
            categories: investmentTrends.map(t => t.month),
            labels: {
                style: {
                    colors: '#fff'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#fff'
                },
                formatter: (value: number) => `$${(value / 1000)}K`
            }
        },
        grid: {
            borderColor: '#333333',
            strokeDashArray: 3
        },
        theme: {
            mode: 'dark'
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (value: number) => `$${value.toLocaleString()}`
            }
        }
    }

    const investmentSeries: ChartData[] = [{
        name: 'Investment Amount',
        data: investmentTrends.map(t => t.investmentAmount)
    }]

    // Sector Distribution Chart (Donut)
    const sectorOptions: any = {
        chart: {
            type: 'donut',
            background: 'transparent'
        },
        grid: {
            borderColor: '#333333',
        },
        colors: ['#16a34a', '#2563eb', '#dc2626', '#d97706', '#6366f1'],
        labels: sectorDistribution.map(item => item.sector),
        theme: { mode: 'dark' },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%'
                }
            }
        },
        legend: {
            position: 'bottom',
            labels: { colors: '#fff' }
        }
    }

    const sectorSeries = sectorDistribution.map(item => item.percentage)

    // Portfolio Growth Chart (Mixed)
    const portfolioOptions: any = {
        chart: {
            type: 'line',
            background: 'transparent',
            toolbar: { show: false },
            stacked: false
        },
        stroke: {
            width: [0, 3],
            curve: 'smooth'
        },
        plotOptions: {
            bar: {
                columnWidth: '50%'
            }
        },
        grid: {
            borderColor: '#333333',
            strokeDashArray: 3
        },
        colors: ['#6366f1', '#16a34a'],
        xaxis: {
            categories: portfolioPerformance.map(item => item.company),
            labels: { style: { colors: '#fff' } }
        },
        yaxis: [
            {
                labels: {
                    style: { colors: '#fff' },
                    formatter: (value: number) => `$${value / 1000}K`
                }
            },
            {
                opposite: true,
                labels: {
                    style: { colors: '#fff' },
                    formatter: (value: number) => `${value}%`
                }
            }
        ],
        theme: { mode: 'dark' }
    }

    const portfolioSeries = [
        {
            name: 'Investment',
            type: 'column',
            data: portfolioPerformance.map(item => item.investment)
        },
        {
            name: 'Growth',
            type: 'line',
            data: portfolioPerformance.map(item => item.growth)
        }
    ]

    const handleExport = () => {
        // Prepare data for export
        const exportData = {
            quickStats: quickStats.map(stat => ({
                Metric: stat.title,
                Value: stat.value,
                Change: stat.change
            })),
            portfolioPerformance: portfolioPerformance.map(item => ({
                Company: item.company,
                Growth: `${item.growth}%`,
                Investment: `$${item.investment.toLocaleString()}`,
                Sector: item.sector
            })),
            sectorDistribution: sectorDistribution.map(item => ({
                Sector: item.sector,
                Percentage: `${item.percentage}%`
            }))
        }

        // Create workbook
        const wb = XLSX.utils.book_new()

        // Add Quick Stats sheet
        const wsStats = XLSX.utils.json_to_sheet(exportData.quickStats)
        XLSX.utils.book_append_sheet(wb, wsStats, "Quick Stats")

        // Add Portfolio Performance sheet
        const wsPortfolio = XLSX.utils.json_to_sheet(exportData.portfolioPerformance)
        XLSX.utils.book_append_sheet(wb, wsPortfolio, "Portfolio Performance")

        // Add Sector Distribution sheet
        const wsSector = XLSX.utils.json_to_sheet(exportData.sectorDistribution)
        XLSX.utils.book_append_sheet(wb, wsSector, "Sector Distribution")

        // Save file
        XLSX.writeFile(wb, `investment_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return (
        <div className="min-h-screen bg-[#0e0e0e] p-6 space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Investment Dashboard</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>

                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push("/investor/studio")}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Investment
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
                {/* Investment Trends */}
                <div className="lg:col-span-2 bg-[#1a1a1a] p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Investment Trends</h3>
                    <div className="h-[400px]">
                        <Chart
                            options={investmentOptions}
                            series={investmentSeries}
                            type="bar"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Sector Distribution */}
                <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Sector Distribution</h3>
                    <div className="h-[400px]">
                        <Chart
                            options={sectorOptions}
                            series={sectorSeries}
                            type="donut"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Portfolio Performance */}
                <div className="lg:col-span-3 bg-[#1a1a1a] p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Portfolio Performance</h3>
                    <div className="h-[400px]">
                        <Chart
                            options={portfolioOptions}
                            series={portfolioSeries}
                            type="line"
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}