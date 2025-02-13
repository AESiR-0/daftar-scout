"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoadingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // First phase: Loading percentage
    const loadingInterval = setInterval(() => {
      setLoading(prev => {
        if (prev < 100) {
          return prev + 1
        }
        clearInterval(loadingInterval)
        return 100
      })
    }, 30) // Will take 3 seconds to load

    // Second phase: Show welcome message and redirect
    const welcomeTimeout = setTimeout(() => {
      setShowWelcome(true)
      
      // Third phase: Redirect after showing welcome message
      const redirectTimeout = setTimeout(() => {
        router.push('/founder/pitch')
      }, 2000) // Wait 2 seconds after showing welcome message

      return () => clearTimeout(redirectTimeout)
    }, 3500) // Show welcome message after 3.5 seconds

    return () => {
      clearInterval(loadingInterval)
      clearTimeout(welcomeTimeout)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="w-full max-w-3xl p-8">
        {!showWelcome ? (
          <>
            <h1 className="text-2xl font-semibold text-center text-white">
              Setting up your Daftar
            </h1>
            <div className="fixed bottom-12 left-16">
              <span className="text-4xl font-medium text-muted-foreground">
                {loading}%
              </span>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-3xl font-bold text-white">
              Welcome to Daftar Operating System Technology
            </h1>
          </div>
        )}
      </div>
    </div>
  )
} 