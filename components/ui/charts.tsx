"use client"

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'

interface LineChartProps {
  data: Array<{ x: string; y: number }>
  categories: string[]
}

interface PieChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = ['#2563eb', '#ec4899', '#eab308']

export function LineChart({ data, categories }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="x"
          stroke="#94a3b8"
          fontSize={12}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '6px',
          }}
          labelStyle={{ color: '#e5e7eb' }}
        />
        <Line
          type="monotone"
          dataKey="y"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function PieChart({ data }: PieChartProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, entry) => sum + entry.value, 0)
  
  // Custom tooltip to show percentages
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(0)
      return (
        <div className="bg-[#1f2937] px-3 py-2 rounded-md border border-border">
          <p className="text-sm text-foreground">{`${payload[0].name}: ${percentage}%`}</p>
        </div>
      )
    }
    return null
  }

  // Custom label to show percentages
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const radian = Math.PI / 180
    const x = cx + radius * Math.cos(-midAngle * radian)
    const y = cy + radius * Math.sin(-midAngle * radian)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium text-muted-foreground"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
} 