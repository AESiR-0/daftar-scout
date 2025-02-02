"use client"
import { createContext, useContext, useState } from "react"
import { daftarsData } from "@/lib/dummy-data/daftars"

interface DaftarContextType {
  selectedDaftar: string
  setSelectedDaftar: (id: string) => void
  currentDaftarData: typeof daftarsData[0] | null
}

const DaftarContext = createContext<DaftarContextType | undefined>(undefined)

export function DaftarProvider({ children }: { children: React.ReactNode }) {
  const [selectedDaftar, setSelectedDaftar] = useState(daftarsData[0]?.id || '')

  const currentDaftarData = daftarsData.find(d => d.id === selectedDaftar) || null

  return (
    <DaftarContext.Provider value={{ selectedDaftar, setSelectedDaftar, currentDaftarData }}>
      {children}
    </DaftarContext.Provider>
  )
}

export function useDaftar() {
  const context = useContext(DaftarContext)
  if (context === undefined) {
    throw new Error('useDaftar must be used within a DaftarProvider')
  }
  return context
} 