"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProgramDetails {
  name: string;
  description: string;
}

export default function DetailsPage() {
  const pathname = usePathname()
  const mode = pathname.split('/')[3]
  const programId = pathname.split('/')[4]
  const [details, setDetails] = useState<ProgramDetails>({
    name: "",
    description: "",
  })

  useEffect(() => {
    if (mode === 'edit' && programId) {
      fetchProgramDetails(programId)
    }
  }, [mode, programId])

  const fetchProgramDetails = async (id: string) => {
    // Simulate API call
    const data = {
      name: "Example Program",
      description: "Program description..."
    }
    setDetails(data)
  }

  const handleSave = async () => {
    if (mode === 'edit') {
      console.log("Updating program:", programId, details)
    } else {
      console.log("Creating new program:", details)
    }
  }

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Edit Program Details' : 'Create New Program'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Program Name</Label>
            <Input
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              placeholder="Enter program name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={details.description}
              onChange={(e) => setDetails({ ...details, description: e.target.value })}
              placeholder="Enter program description"
              className="min-h-[200px] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mode === 'edit' ? 'Update Program' : 'Create Program'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

