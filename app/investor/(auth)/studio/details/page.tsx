"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Editor } from "novel-lightweight"
import { useTheme } from "next-themes"

interface ScoutDetails {
  name: string;
  description: string;
}

export default function DetailsPage() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const mode = pathname.split('/')[3]
  const ScoutId = pathname.split('/')[4]
  const [details, setDetails] = useState<ScoutDetails>({
    name: "",
    description: "",
  })

  useEffect(() => {
    if (mode === 'edit' && ScoutId) {
      fetchScoutDetails(ScoutId)
    }
  }, [mode, ScoutId])

  const fetchScoutDetails = async (id: string) => {
    // Simulate API call
    const data = {
      name: "Example Scout",
      description: "Scout description..."
    }
    setDetails(data)
  }

  const handleSave = async () => {
    if (mode === 'edit') {
      console.log("Updating Scout:", ScoutId, details)
    } else {
      console.log("Creating new Scout:", details)
    }
  }

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Edit Scout Details' : 'Create New Scout'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scout Name</Label>
            <Input
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              placeholder="Enter Scout name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <div className="min-h-[400px] border rounded-lg">
              <Editor
                defaultValue={details.description}
                onUpdate={(editor: any) => {
                  if (editor) {
                    setDetails(prev => ({
                      ...prev,
                      description: editor.getHTML()
                    }))
                  }
                }}
                disableLocalStorage
                className="min-h-[400px]"
                editorProps={{
                  attributes: {
                    class: " border-none  max-w-none p-4  min-h-[400px]"
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mode === 'edit' ? 'Update Scout' : 'Create Scout'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

