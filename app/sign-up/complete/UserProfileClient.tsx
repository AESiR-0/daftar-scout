"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Country codes (simplified list)
const countryCodes = [
  { code: "+1", label: "US (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+91", label: "India (+91)" },
  { code: "+33", label: "France (+33)" },
];

// Language options
const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Hindi",
  "Arabic",
];

// Zod schema for form validation
const profileSchema: any = z.object({
  name: z.string().min(1, "First name cannot be empty"),
  lastName: z.string().min(1, "Last name cannot be empty"),
  gender: z.string().min(1, "Gender cannot be empty"),
  number: z.string().min(1, "Phone number cannot be empty"),
  countryCode: z.string().min(1, "Country code cannot be empty"),
  dob: z.string().min(1, "Date of birth cannot be empty"),
  location: z.string().min(1, "Location cannot be empty"),
  role: z.enum(["founder", "investor"], { message: "Please select a role" }),
  languages: z
    .array(z.string())
    .min(1, "Please select at least one language")
    .refine(
      (langs) => (formData.role === "founder" ? langs.length <= 3 : true),
      { message: "Founders can select up to 3 languages only" }
    ),
});

interface UserProfileProps {
  initialData: {
    name: string | null;
    lastName: string | null;
    gender: string | null;
    number: string | null;
    countryCode: string | null;
    dob: string | null;
    location: string | null;
    role: string | null;
    languages: string[];
  };
  userMail: string;
}

// Keep formData in scope for the refine function
let formData: z.infer<typeof profileSchema>;

export default function UserProfileClient({ initialData, userMail }: UserProfileProps) {
  // Convert null values to empty strings for Zod compatibility
  formData = {
    name: initialData.name ?? "",
    lastName: initialData.lastName ?? "",
    gender: initialData.gender ?? "",
    number: initialData.number ?? "",
    countryCode: initialData.countryCode ?? "+1",
    dob: initialData.dob ?? "",
    location: initialData.location ?? "",
    role: initialData.role ?? "",
    languages: initialData.languages ?? [],
  };

  const [formState, setFormState] = useState(formData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false); // For Combobox popover
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormState((prev: any) => {
      const currentLanguages = prev.languages || [];
      if (currentLanguages.includes(language)) {
        return { ...prev, languages: currentLanguages.filter((lang: any) => lang !== language) };
      } else {
        if (prev.role === "founder" && currentLanguages.length >= 3) {
          return prev; // Error will be caught by Zod
        }
        return { ...prev, languages: [...currentLanguages, language] };
      }
    });
    setErrors((prev) => ({ ...prev, languages: undefined }));
  };

  const handleSubmit = async () => {
    const result = profileSchema.safeParse(formState);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/endpoints/users/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: formState, email: userMail }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0e0e0e] h-fit p-4">
      <Card className="border-none my-4 container mx-auto px-4 bg-[#1a1a1a] text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-center">Complete Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Input Fields */}
            {[
              { field: "name", label: "First Name" },
              { field: "lastName", label: "Last Name" },
              { field: "gender", label: "Gender" },
              { field: "dob", label: "Date of Birth", type: "date" },
              { field: "location", label: "Location" },
            ].map(({ field, label, type }) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field} className="text-sm font-medium text-gray-300">
                  {label}
                </Label>
                <Input
                  id={field}
                  type={type || "text"}
                  value={formState[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    "bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500 rounded-[0.35rem] py-2 px-3",
                    errors[field] && "border-red-500 focus:ring-red-500"
                  )}
                />
                {errors[field] && (
                  <p className="text-sm text-red-500">{errors[field]}</p>
                )}
              </div>
            ))}

            {/* Phone Number with Country Code */}
            <div className="space-y-2">
              <Label htmlFor="number" className="text-sm font-medium text-gray-300">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <Select
                  value={formState.countryCode || "+1"}
                  onValueChange={(value) => handleChange("countryCode", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-24 bg-[#2a2a2a] border-[#3a3a3a] text-white rounded-[0.35rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a2a] text-white border-[#3a3a3a]">
                    {countryCodes.map(({ code, label }) => (
                      <SelectItem key={code} value={code}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="number"
                  type="text"
                  value={formState.number || ""}
                  onChange={(e) => handleChange("number", e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500 rounded-[0.35rem] py-2 px-3",
                    errors.number && "border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
              {(errors.countryCode || errors.number) && (
                <p className="text-sm text-red-500">
                  {errors.countryCode || errors.number}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2 col-span-full">
              <Label htmlFor="role" className="text-sm font-medium text-gray-300">
                Role
              </Label>
              <Select
                value={formState.role || ""}
                onValueChange={(value) => handleChange("role", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={cn(
                  "bg-[#2a2a2a] border-[#3a3a3a] text-white rounded-[0.35rem]",
                  errors.role && "border-red-500"
                )}>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2a] text-white border-[#3a3a3a]">
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
            </div>

            {/* Language Selection (Role-Based Combobox) */}
            {formState.role && (
              <div className="space-y-2 col-span-full">
                <Label className="text-sm font-medium text-gray-300">
                  {formState.role === "founder"
                    ? "Preferred Languages to Connect with Investors (Max 3)"
                    : "Preferred Languages to Connect with Founders"}
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between bg-[#2a2a2a] border-[#3a3a3a] text-white rounded-[0.35rem] hover:bg-[#3a3a3a]",
                        errors.languages && "border-red-500"
                      )}
                      disabled={isSubmitting}
                    >
                      {formState.languages.length > 0
                        ? formState.languages.join(", ")
                        : "Select languages..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-[#2a2a2a] border-[#3a3a3a] text-white">
                    <Command>
                      <CommandInput
                        placeholder="Search languages..."
                        className="bg-[#2a2a2a] border-none text-white placeholder:text-gray-500"
                      />
                      <CommandList>
                        <CommandEmpty>No languages found.</CommandEmpty>
                        <CommandGroup>
                          {languages.map((language) => (
                            <CommandItem
                              key={language}
                              value={language}
                              onSelect={() => {
                                handleLanguageToggle(language);
                              }}
                              className="hover:bg-[#3a3a3a] text-white"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formState.languages.includes(language) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {language}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.languages && (
                  <p className="text-sm text-red-500">{errors.languages}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="col-span-full">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 rounded-[0.35rem] py-3 text-lg font-semibold"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}