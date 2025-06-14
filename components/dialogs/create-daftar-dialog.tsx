"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateDaftarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (daftarId: string) => void;
}

const daftarStructures = [
  "Accelerator",
  "Angel Investor",
  "Family Offices",
  "Founder Turned Investor",
  "Government Incubator",
  "Investment Banker",
  "Micro Venture Capitalist",
  "Private Equity",
  "Private Incubator",
  "Startup Studio/Builder",
  "Venture Capitalist",
];

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas, The",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia, The",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands, The",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Niue",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands, The",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates, The",
  "United Kingdom, The",
  "United States, The",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export function CreateDaftarDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDaftarDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    structure: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    vision: "",
  });
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const location = [
        formData.address.street,
        formData.address.city,
        formData.address.state,
        formData.address.country,
        formData.address.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      if (!location) {
        throw new Error("Address is required");
      }

      const response = await fetch("/api/endpoints/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          structure: formData.structure.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ").split("/").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("/"),
          website: formData.website || null, // Only optional field
          bigPicture: formData.vision || null,
          location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create Daftar");
      }

      const { daftarId } = await response.json();
      onSuccess(daftarId);
      toast({
        title: "Daftar created successfully!",
        description: `Your Daftar has been created with ID: ${daftarId}`,
        variant: "success",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating Daftar:", error);
      toast({
        title: "Error creating Daftar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      // Mock join logic (no endpoint provided)
      console.log("Joining Daftar with code:", joinCode);
      onSuccess(joinCode);
      toast({
        title: "Joined Daftar successfully!",
        description: "You have successfully joined the Daftar!",
        variant: "success",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error joining Daftar:", error);
      toast({
        title: "Error joining Daftar",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const isFormValid = () =>
    formData.name &&
    formData.structure &&
    // formData.vision &&
    formData.address.street &&
    formData.address.city &&
    formData.address.country;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Create Daftar</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md bg-background pb-4 px-5">
          {!isCreating || !isJoining ? (
            <div className="space-y-2">
              <div className="space-y-2">
                <Label>Daftar Name *</Label>
                <Input
                  placeholder="Enter Daftar name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Daftar Structure *</Label>
                <Select
                  value={formData.structure}
                  onValueChange={(value) =>
                    handleInputChange("structure", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {daftarStructures.map((structure) => (
                      <SelectItem
                        key={structure}
                        value={structure.toLowerCase()}
                      >
                        {structure}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  placeholder="Enter website (e.g., www.example.com)"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Address *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Street Address"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                  />
                  <Select
                    value={formData.address.country}
                    onValueChange={(value) =>
                      handleAddressChange("country", value)
                    }
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
                  <Input
                    placeholder="Postal Code"
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      handleAddressChange("postalCode", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* <div className="space-y-2">
                  <Label>Vision *</Label>
                  <Textarea
                    placeholder="Enter your Daftar's vision"
                    value={formData.vision}
                    onChange={(e) =>
                      handleInputChange("vision", e.target.value)
                    }
                    required
                  />
                </div> */}

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleCreate}
                  className="bg-muted hover:bg-muted/50 rounded-[0.35rem] text-white"
                  disabled={!isFormValid()}
                >
                  Create Daftar
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isCreating ? "Creating your Daftar" : "Joining Daftar"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCreating
                    ? "Please wait while we set up your Daftar environment."
                    : "Please wait while we process your request."}
                  This may take a few moments.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
