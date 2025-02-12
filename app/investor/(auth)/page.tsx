"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
    const router = useRouter()
    const [loading, setLoading] = useState(0)
    const [showLoading, setShowLoading] = useState(false)

    useEffect(() => {
        if (document.referrer.includes('/login/investor')) {
            setShowLoading(true)
            const interval = setInterval(() => {
                setLoading((prev) => {
                    if (prev < 100) {
                        return prev + 1
                    } else {
                        clearInterval(interval)
                        return prev
                    }
                })
            }, 60) // 6000ms / 100 = 60ms per increment

            const timeout = setTimeout(() => {
                router.push('/investor/scout')
            }, 6000)

            return () => {
                clearInterval(interval)
                clearTimeout(timeout)
            }
        } else {
            router.push('/investor/scout')
        }
    }, [router])

    if (!showLoading) {
        return null
    }

    return (
        <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <h1 className="text-2xl font-bold">Setting up your Daftar</h1>
            <p className="text-lg">Loading... {loading}%</p>
        </div>
    )
}