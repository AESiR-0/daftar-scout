import { ApexOptions } from "apexcharts"

export interface ChartData {
    name: string
    data: number[]
}

export interface BaseChartOptions extends ApexOptions {
    chart: {
        type: "bar" | "area" | "line"
        background: string
        toolbar: {
            show: boolean
        }
    }
    colors: string[]
    xaxis: {
        categories: string[]
        labels: {
            style: {
                colors: string
            }
        }
    }
    yaxis: {
        labels: {
            style: {
                colors: string
            }
            formatter?: (value: number) => string
        }
    }
    grid: {
        borderColor: string
        strokeDashArray: number
    }
    theme: {
        mode: 'dark' | 'light'
    }
    tooltip: {
        theme: 'dark' | 'light'
        y?: {
            formatter?: (value: number) => string
        }
    }
} 