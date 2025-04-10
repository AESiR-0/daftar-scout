"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const parts = pathname.split("/") // ['', 'investor', 'scout', '{scoutId}', 'studio']
    const scoutId = parts[3]

    if (scoutId) {
      router.push(`/investor/scout/${scoutId}/studio/details`)
    }
  }, [pathname, router])

  return null
}
