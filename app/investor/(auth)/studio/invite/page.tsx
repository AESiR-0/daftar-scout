"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Upload, Download, Eye, Trash2 } from "lucide-react"
import { usePathname } from "next/navigation"

interface UploadedFile {
  id: string
  name: string
  size: string
  uploadedAt: string
}

function InviteContent() {
  const router = useRouter()
  const pathname = usePathname()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const mode = pathname.split('/')[3]
  const programId = pathname.split('/')[4]

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls,.csv'
    input.multiple = true
    input.onchange = (e) => {
      const uploadedFiles = Array.from((e.target as HTMLInputElement).files || [])
      const newFiles = uploadedFiles.map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: new Date().toLocaleString()
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
    input.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = (id: string) => {
    // Add download logic
    console.log("Downloading file:", id)
  }

  const handleView = (id: string) => {
    // Add view logic
    console.log("Viewing file:", id)
  }

  const handleRemove = (id: string) => {
    setFiles(files.filter(file => file.id !== id))
  }

  const handleSave = () => {
    console.log("Saving invites")
    router.push("/investor/studio/schedule")
  }

  return (
    <div className=" space-y-6 container mx-auto px-4">
      <div className="max-w-6xl space-y-6">
        {/* Format Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">File Format Requirements</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>The Excel/CSV file should contain the following columns:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Founder Name</li>
              <li>Email Address</li>
              <li>Company Name</li>
              <li>Industry/Sector</li>
              <li>Stage</li>
            </ul>
          </div>
        </div>

        {/* Upload Section */}
        <div
          className="border-2 border-dashed rounded-[0.3rem] p-8"
          onClick={handleUpload}
        >
          <div className="flex flex-col items-center gap-2 cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm font-medium">Upload Database Files</div>
            <p className="text-xs text-muted-foreground">
              Upload Excel or CSV files containing founder details
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Choose Files
            </Button>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 rounded-[0.3rem] bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.size} • {file.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file.id)}
                    className="text-xs w-fit"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(file.id)}
                    className="text-xs"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(file.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={files.length === 0}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InviteContent;