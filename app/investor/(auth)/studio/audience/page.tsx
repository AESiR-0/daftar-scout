"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AgeRange } from "./components/age-range"
import { Combobox } from "./components/combobox"
import { useRouter } from "next/navigation"

export default function AudiencePage() {
  const router = useRouter()
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65])

  const handleNext = () => {
    // Handle the next action
    router.push("/investor/studio/pitch")
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Target Audience</h1>
          <p className="text-sm text-muted-foreground">
            Define your target audience to help us match you with the right startups
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Location</Label>
              <Combobox
                label="Location"
                value="Location"
                options={[]}
                selected={selectedLocations}
                onChange={(value: string) => setSelectedLocations(prev => [...prev, value])}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Age Range</Label>
              <AgeRange
                minAge={ageRange[0].toString()}
                maxAge={ageRange[1].toString()}
                onMinChange={(value) => setAgeRange([Number(value), ageRange[1]])}
                onMaxChange={(value) => setAgeRange([ageRange[0], Number(value)])}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

