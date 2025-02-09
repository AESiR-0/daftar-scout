"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"

interface ComboboxProps {
    options: string[]
    value?: string | null
    onSelect: (value: string) => void
    placeholder?: string
    disabled?: boolean
}

export function Combobox({ options, value, onSelect, placeholder = "Select option...", disabled = false }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full text-sm font-normal text-muted-foreground bg-transparent text-left justify-between"
                >
                    {value
                        ? value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." disabled={disabled} />
                    <CommandEmpty>No option found.</CommandEmpty>
                    <ScrollArea className="max-h-full">
                        <CommandGroup className="bg-[#0e0e0e]">
                            <CommandList>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={(currentValue) => {
                                            onSelect(currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.toLowerCase() ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </CommandGroup>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover >
    )
} 