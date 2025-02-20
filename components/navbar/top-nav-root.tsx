"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function TopNavRoot() {

    return (
        <div>
            <div className="flex h-14 items-center px-4 justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="font-medium">
                        Daftar OS Technology
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <nav className="flex items-center space-x-4">
                        <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-white">
                            Daftar's Den
                        </Link>
                        <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-white">
                            Pricing
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            Sign Up
                        </Button>
                        <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                            Login
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 