"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// import { FounderDaftarData } from "@/lib/api-types"
// import { apiClient, api } from "@/lib/api-client"

interface CreateDaftarDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (daftarId: string) => void
}

const daftarStructures = [
    "Private Incubator",
    "Government Incubator",
    "Accelerator",
    "Angel Investor",
    "Startup Studio",
    "Founder's Office",
    "Family Offices",
    "Venture Capitalist",
    "Private Equity",
    "Other"
]

const countries = [
    "UAE",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "New Zealand",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Portugal",
    "Greece"
]

export function CreateDaftarDialog({ open, onOpenChange, onSuccess }: CreateDaftarDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        structure: "",
        country: ""
    })
    // const { founderDaftar } = api;
    const [isCreating, setIsCreating] = useState(false)

    const { toast } = useToast(); // Initialize toaster

    const handleSubmit = async () => {
        setIsCreating(true);
        try {
            // const response = await founderDaftar.create({
            //     daftar_name: formData.name,
            //     country: formData.country,
            //     status: "active",
            //     city: "",
            // });
            console.log("Daftar created successfully:", formData);
            toast({
                title: "Daftar created successfully!",
                description: "Your daftar has been created successfully!",
                variant: "success",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating daftar:", error);
            toast({ title: "Error creating daftar ", description: (error as Error).message, variant: "error" }); // Use toaster for error message
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Daftar</DialogTitle>
                </DialogHeader>

                {!isCreating ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Daftar Name</Label>
                            <Input
                                placeholder="Enter daftar name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Daftar Structure</Label>
                            <Select
                                value={formData.structure}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, structure: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select structure" />
                                </SelectTrigger>
                                <SelectContent>
                                    {daftarStructures.map((structure) => (
                                        <SelectItem key={structure} value={structure.toLowerCase()}>
                                            {structure}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Select
                                value={formData.country}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country} value={country.toLowerCase()}>
                                            {country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={!formData.name || !formData.structure || !formData.country}
                            >
                                Publish
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center space-y-4">
                        <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-medium">Creating your Daftar</p>
                            <p className="text-sm text-muted-foreground">
                                Please wait while we set up your Daftar environment.
                                This may take a few moments.
                            </p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
} 