import { useState, useRef, useEffect } from 'react'
import { Label } from "@/components/ui/label"

interface ComboboxProps {
    label: string
    value: string
    options: { value: string; label: string }[]
    onChange: (value: string) => void
    placeholder?: string
    selected?: string | string[] | undefined
}

export function Combobox({
    label,
    value,
    options,
    onChange,
    selected,
    placeholder = "Select..."
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const wrapperRef = useRef<HTMLDivElement>(null)

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase())
    )

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <Label>{label}</Label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 text-left border rounded-md bg-[#0e0e0e] hover:bg-accent"
                >
                    {selectedLabel}
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-[#0e0e0e] border rounded-md shadow-lg">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full  bg-[#0e0e0e] p-2 border-b"
                            autoFocus
                        />
                        <div className="max-h-60 overflow-auto">
                            {filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                        setSearch("")
                                    }}
                                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                                >
                                    {option.label}
                                </div>
                            ))}
                            {filteredOptions.length === 0 && (
                                <div className="px-3 py-2 text-muted-foreground">
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 