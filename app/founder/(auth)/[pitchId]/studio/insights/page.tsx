"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function InsightsPage() {
  return (
    <div className="flex px-5 mt-10 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No data available.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 