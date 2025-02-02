import React from 'react'
import { X } from 'lucide-react' // Assuming you're using lucide-react for icons

interface ModalProps {
    children: React.ReactNode
    isOpen: boolean
    onClose: () => void
}

export function Modal({ children, isOpen, onClose }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed  inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-50 w-full max-w-4xl rounded-lg bg-[#0e0e0e] p-4 shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 hover:text-black transition-all duration-300"
                    aria-label="Close modal"
                >
                    <X className="h-6 w-6 " />
                </button>

                <div className="my-2">
                    {children}
                </div>
            </div>
        </div>
    )
}