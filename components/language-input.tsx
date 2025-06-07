"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Language {
  id: string;
  language_name: string;
}

interface LanguageInputProps {
  selectedLanguages: { id: string; name: string }[];
  onLanguagesChange: (languages: { id: string; name: string }[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function LanguageInput({ selectedLanguages, onLanguagesChange, isLoading, disabled }: LanguageInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchLanguages = async () => {
    try {
      const response = await fetch(`/api/endpoints/getAllLanguages?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to fetch languages");
      const { data } = await response.json();
      
      if (Array.isArray(data)) {
        // Filter out already selected languages
        const filteredLanguages = data.filter(
          (lang: Language) => !selectedLanguages.some(selected => selected.id === lang.id.toString())
        );
        setAvailableLanguages(filteredLanguages);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      setAvailableLanguages([]);
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
    fetchLanguages();
  };

  const handleAddLanguage = (languageId: string) => {
    const selectedLang = availableLanguages.find(lang => lang.id.toString() === languageId);
    if (selectedLang && selectedLanguages.length < 3) {
      onLanguagesChange([
        ...selectedLanguages,
        { id: selectedLang.id.toString(), name: selectedLang.language_name }
      ]);
      setSearchQuery(""); // Clear search after selection
      setIsOpen(false);
    }
  };

  const handleRemoveLanguage = (languageId: string) => {
    onLanguagesChange(selectedLanguages.filter(lang => lang.id !== languageId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-input-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedLanguages.length < 3 && (
          <div className="relative w-[180px] language-input-container">
            {isOpen && availableLanguages.length > 0 && (
              <div className="absolute bottom-full mb-1 w-full bg-background border rounded-md shadow-lg">
                <ScrollArea className="h-[200px]">
                  {availableLanguages.map((lang) => (
                    <div
                      key={lang.id}
                      className="px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                      onClick={() => handleAddLanguage(lang.id.toString())}
                    >
                      {lang.language_name}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
            <Input
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchLanguages();
              }}
              onClick={handleInputClick}
              disabled={disabled}
              className="w-full"
            />
            {isLoading && (
              <div className="absolute right-2 top-2.5 text-xs text-muted-foreground">
                Loading...
              </div>
            )}
          </div>
        )}
        {selectedLanguages.map((lang) => (
          <Badge
            key={lang.id}
            className="bg-muted rounded-[0.35rem]"
          >
            {lang.name}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 hover:bg-transparent"
              onClick={() => handleRemoveLanguage(lang.id)}
              disabled={disabled}
            >
              <X className="h-3 w-3 rounded-[0.35rem]" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
} 