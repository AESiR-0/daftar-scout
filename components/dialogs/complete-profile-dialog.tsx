"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const languages = [
  "English",
  "Hindi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Kannada",
  "Malayalam"
]

export function CompleteProfileDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+91",
    phone: "",
    gender: "",
    dob: undefined as Date | undefined,
    preferredLanguages: [] as string[],
  })

  const handleSubmit = () => {
    // Validate all fields are filled
    if (
      !formData.firstName || 
      !formData.lastName || 
      !formData.countryCode ||
      !formData.phone || 
      !formData.gender || 
      !formData.dob ||
      formData.preferredLanguages.length === 0
    ) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      })
      return
    }

    // Handle profile completion
    toast({
      title: "Profile completed",
      description: "Welcome to Daftar OS"
    })
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                value={formData.firstName}
                placeholder="First Name"
                onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Input
                value={formData.lastName}
                placeholder="Last Name"
                onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                className="w-20"
                value={formData.countryCode}
                onChange={(e) => setFormData(prev => ({...prev, countryCode: e.target.value}))}
                placeholder="Country Code"
              />
              <Input
                className="flex-1"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({...prev, gender: value}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dob && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dob ? format(formData.dob, "PPP") : <span>Date of Birth</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dob}
                  onSelect={(date) => setFormData(prev => ({...prev, dob: date}))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Preferred Languages to connect with founders</Label>
            <Select
              value={formData.preferredLanguages[0]}
              onValueChange={(value) => 
                setFormData(prev => ({
                  ...prev, 
                  preferredLanguages: [...prev.preferredLanguages, value]
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select languages" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem 
                    key={lang} 
                    value={lang}
                    disabled={formData.preferredLanguages.includes(lang)}
                  >
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferredLanguages.map(lang => (
                <Badge 
                  key={lang}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => 
                    setFormData(prev => ({
                      ...prev,
                      preferredLanguages: prev.preferredLanguages.filter(l => l !== lang)
                    }))
                  }
                >
                  {lang}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit}>Complete Profile</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 