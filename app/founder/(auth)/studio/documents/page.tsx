"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter, usePathname } from "next/navigation"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { StudioCard } from "../components/layout/studio-card"
// import { useSearch } from "@/contexts/search-context"

interface DocumentDetails {
    title: string;
    url: string;
    files: File[]
}

export default function DocumentPage() {
    const router = useRouter()
    const pathname = usePathname()
    const mode = pathname.includes('edit') ? 'edit' : 'add'
    const programId = pathname.split('/').pop()
    // const { searchQuery, filterValue } = useSearch()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [details, setDetails] = useState<DocumentDetails>({
        title: "",
        url: "",
        files: []
    })
    const [dragActive, setDragActive] = useState(false)
    const [filteredFiles, setFilteredFiles] = useState<File[]>([])

    useEffect(() => {
        if (mode === 'edit' && programId) {
            fetchDocumentDetails(programId)
        }
    }, [mode, programId])

    useEffect(() => {
        setFilteredFiles(details.files)
    }, [details.files])

    const fetchDocumentDetails = async (id: string) => {
        // Simulate API call
        const data = {
            title: "Program Document",
            url: "https://example.com/doc",
            files: []
        }
        setDetails(data)
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type === "application/pdf"
        )
        if (files.length > 0) {
            setDetails(prev => ({ ...prev, files: [...prev.files, ...files] }))
        }
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        if (files.length > 0) {
            setDetails(prev => ({ ...prev, files: [...prev.files, ...files] }))
        }
    }

    const handleSave = async () => {
        if (mode === 'edit') {
            console.log("Updating document:", programId, details)
        } else {
            console.log("Creating document:", details)
        }
    }

    const removeFile = (index: number) => {
        setDetails(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }))
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    // Filter files based on search and filter
    // const filteredFiles = details.files.filter(file => {
    //     const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    //     const matchesFilter = filterValue === 'all' ||
    //         (filterValue === 'pdf' && file.type === 'application/pdf') ||
    //         (filterValue === 'doc' && file.type.includes('word')) ||
    //         (filterValue === 'other' && !file.type.includes('pdf') && !file.type.includes('word'))
    //     return matchesSearch && matchesFilter
    // })

    return (
        <StudioCard
            title={mode === 'edit' ? 'Edit Documents' : 'Add Documents'}
            description={mode === 'edit' ? 'Update program documents' : 'Add program documents'}
        >
            <div className="pr-8 space-y-6">
                <div className="space-y-4">
                    <Label>Upload Documents</Label>
                    <div className="text-xs text-muted-foreground mb-2">
                        Upload your documents in PDF format (max 10MB each)
                    </div>

                    <div
                        className={cn(
                            "border-2 border-dashed rounded-[0.3rem] p-8 transition-colors",
                            dragActive ? "border-blue-600 bg-blue-50/50" : "border-border"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">
                                {dragActive ? "Drop your files here" : "Drop your files here or"}
                            </div>
                            {!dragActive && (
                                <Button
                                    variant="outline"
                                    onClick={handleButtonClick}
                                >
                                    Choose Files
                                </Button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {filteredFiles.length > 0 && (
                        <div className="space-y-2 pt-4">
                            <Label className="text-sm text-muted-foreground">Uploaded Files</Label>
                            <div className="space-y-2">
                                {filteredFiles.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center gap-2 p-4 border rounded-[0.3rem] bg-muted/50"
                                    >
                                        <File className="h-4 w-4" />
                                        <span className="text-sm flex-1">{file.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(index)}
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-center">
                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={details.files.length === 0}
                    >
                        {mode === 'edit' ? 'Update' : 'Save'}
                    </Button>
                </div>
            </div>
        </StudioCard>
    )
} 