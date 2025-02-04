"use client"

import * as React from "react"
import { Search, ChevronDown } from "lucide-react"

export const LANGUAGES = {
  indian: [
    { value: "hindi", label: "Hindi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "marathi", label: "Marathi" },
    { value: "bengali", label: "Bengali" },
    { value: "gujarati", label: "Gujarati" },
    { value: "punjabi", label: "Punjabi" },
    { value: "odia", label: "Odia" },
    { value: "assamese", label: "Assamese" },
    { value: "urdu", label: "Urdu" }
  ],
  international: [
    { value: "english", label: "English" },
    { value: "mandarin", label: "Mandarin" },
    { value: "spanish", label: "Spanish" },
    { value: "arabic", label: "Arabic" },
    { value: "french", label: "French" }
  ]
}

interface LanguageComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function LanguageCombobox({ value, onChange }: LanguageComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const comboboxRef = React.useRef<HTMLDivElement>(null)

  const allLanguages = [...LANGUAGES.indian, ...LANGUAGES.international]
  const selectedLanguage = allLanguages.find((language) => language.value === value)

  // Filter languages based on search query
  const filteredIndianLanguages = LANGUAGES.indian.filter(lang =>
    lang.label.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredInternationalLanguages = LANGUAGES.international.filter(lang =>
    lang.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-[280px]" ref={comboboxRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-background border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">
          {selectedLanguage?.label || "Select language..."}
        </span>
        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <div className="flex items-center px-3 py-2 border-b">
            <Search className="w-4 h-4 mr-2 opacity-50" />
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {(filteredIndianLanguages.length > 0 || filteredInternationalLanguages.length > 0) ? (
              <>
                {filteredIndianLanguages.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                      Indian Languages
                    </div>
                    {filteredIndianLanguages.map((language) => (
                      <button
                        key={language.value}
                        onClick={() => {
                          onChange(language.value)
                          setIsOpen(false)
                          setSearchQuery("")
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-muted/50 ${
                          value === language.value ? "bg-blue-500/10 text-blue-600" : ""
                        }`}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                )}
                
                {filteredInternationalLanguages.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                      International Languages
                    </div>
                    {filteredInternationalLanguages.map((language) => (
                      <button
                        key={language.value}
                        onClick={() => {
                          onChange(language.value)
                          setIsOpen(false)
                          setSearchQuery("")
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-muted/50 ${
                          value === language.value ? "bg-blue-500/10 text-blue-600" : ""
                        }`}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 