"use client"

import { usePathname } from "next/navigation"
import { useEffect, useReducer, useState } from "react"
import { Button } from "@/components/ui/button"
import { Combobox } from "./components/combobox"
import { AgeRange } from "./components/age-range"
import { communities, sectors, stages, genderOptions } from "./constants"
import { audienceReducer, initialState } from "./reducer"
import type { AudienceDetails, Location } from "./types"

interface AudienceContentProps {
  initialData?: AudienceDetails
  location: Location[]
  onSave: (data: AudienceDetails) => Promise<void>
}

export default function AudienceContent({ initialData, location, onSave }: AudienceContentProps) {
  const pathname = usePathname()
  const mode = pathname.includes("edit") ? "edit" : "add"
  const programId = pathname.split("/").pop()

  const [state, dispatch] = useReducer(audienceReducer, initialState)
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    if (mode === "edit" && programId) fetchAudienceDetails(programId)
    fetchLocations()
  }, [mode, programId])

  const fetchAudienceDetails = async (id: string) => {
    try {
      // Simulated API call
      const data: AudienceDetails = {
        location: "UAE",
        community: "auto-rickshaw",
        gender: "male",
        ageMin: "20",
        ageMax: "30",
        stage: "idea",
        sector: "ai",
      }
      Object.keys(data).forEach((key) =>
        dispatch({ type: key, payload: data[key as keyof AudienceDetails] })
      )
    } catch (error) {
      console.error("Error fetching audience details:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all")
      const data = await response.json()
      const formattedLocations = data
        .map((country: any) => ({
          name: country.name.common,
          code: country.cca2,
        }))
        .sort((a: Location, b: Location) => a.name.localeCompare(b.name))
      setLocations(formattedLocations)
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const handleSave = async () => {
    console.log(mode === "edit" ? "Updating audience" : "Creating audience", state)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6">
      <h1 className="text-xl font-semibold">
        {mode === "edit" ? "Edit Audience" : "Add Audience"}
      </h1>

      <div className="grid grid-cols-2 gap-6">
        <Combobox
          label="Location"
          value={state.location}
          options={locations.map((loc) => ({ value: loc.code, label: loc.name }))}
          onChange={(value) => dispatch({ type: "location", payload: value })}
          placeholder="Select location..."
        />

        <Combobox
          label="Community"
          value={state.community}
          options={communities}
          onChange={(value) => dispatch({ type: "community", payload: value })}
          placeholder="Select community..."
        />

        <Combobox
          label="Gender"
          value={state.gender}
          options={genderOptions}
          onChange={(value) => dispatch({ type: "gender", payload: value })}
          placeholder="Select gender..."
        />

        <AgeRange
          minAge={state.ageMin}
          maxAge={state.ageMax}
          onMinChange={(value) => dispatch({ type: "ageMin", payload: value })}
          onMaxChange={(value) => dispatch({ type: "ageMax", payload: value })}
        />

        <Combobox
          label="Stage"
          value={state.stage}
          options={stages}
          onChange={(value) => dispatch({ type: "stage", payload: value })}
          placeholder="Select stage..."
        />

        <Combobox
          label="Sector"
          value={state.sector}
          options={sectors}
          onChange={(value) => dispatch({ type: "sector", payload: value })}
          placeholder="Select sector..."
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  )
}

