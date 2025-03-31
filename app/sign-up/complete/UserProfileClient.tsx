"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema: any = z.object({
  name: z.string().min(1, "First name cannot be empty"),
  lastName: z.string().min(1, "Last name cannot be empty"),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  number: z.string().min(1, "Phone number cannot be empty"),
  dob: z.string().min(1, "Date of birth cannot be empty"),
  location: z.string().min(1, "Location cannot be empty"),
  role: z.enum(["founder", "investor"]),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
});

interface UserProfileProps {
  initialData: {
    name: string | null;
    lastName: string | null;
    gender: string | null;
    number: string | null;
    dob: string | null;
    location: string | null;
    role: string | null;
    countryCode: string | null;
    languages: string[] | [];
  };
  userMail: string;
  languageData: {
    id: number;
    language_name: string;
  }[];
}

export default function UserProfileClient({
  initialData,
  languageData,
  userMail,
}: UserProfileProps) {
  const [formState, setFormState] = useState<{
    name: string;
    lastName: string;
    gender: string;
    number: string;
    dob: string;
    location: string;
    countryCode: string;
    role: string;
    languages: string[];
  }>({
    name: initialData.name ?? "",
    lastName: initialData.lastName ?? "",
    gender: initialData.gender ?? "",
    number: initialData.number ?? "",
    dob: initialData.dob ?? "",
    countryCode: initialData.countryCode ?? "",
    location: initialData.location ?? "",
    role: initialData.role ?? "",
    languages: initialData.languages ?? [],
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formState, string>>
  >({});
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (field === "role") {
      setFormState((prev) => ({ ...prev, languages: [] }));
    }
  };

  const handleLanguageToggle = (language: string) => {
    setFormState((prev) => {
      const selectedLanguages = prev.languages.includes(language)
        ? prev.languages.filter((lang) => lang !== language)
        : [...prev.languages, language];

      return { ...prev, languages: selectedLanguages };
    });
    setErrors((prev) => ({ ...prev, languages: undefined }));
  };

  const handleSubmit = async () => {
    console.log("initialData", initialData);

    const result = profileSchema.safeParse(formState);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      console.log("Errors", result.error.flatten().fieldErrors);
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/endpoints/users/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: formState, email: userMail }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
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
          <CardTitle className="text-2xl font-medium text-center">
            Complete Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formState.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formState.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>

            {/* Country Code */}
            <div className="space-y-2">
              <Label htmlFor="countryCode">Country Code</Label>
              <Input
                id="countryCode"
                value={formState.countryCode}
                onChange={(e) => handleChange("countryCode", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input
                id="number"
                value={formState.number}
                onChange={(e) => handleChange("number", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={formState.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white p-2 w-full"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formState.location}
                onChange={(e) => handleChange("location", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>
            {/* Role Selection & Custom Language Dropdown remain unchanged */}
            {/* Role Selection */}
            <div className="space-y-2 colspan-full">
              <Label>Role</Label>
              <select
                value={formState.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white p-2 w-full"
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="founder">Founder</option>
                <option value="investor">Investor</option>
              </select>
            </div>

            {/* Custom Language Dropdown */}
            <div className="relative space-y-2 col-span-full">
              <Label>Languages</Label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-[#2a2a2a] border-[#3a3a3a] text-white w-full flex justify-between p-2 rounded-md"
                >
                  {formState.languages.length
                    ? formState.languages.join(", ")
                    : "Select languages..."}
                  <ChevronsUpDown className="h-5 w-5" />
                </button>

                {dropdownOpen && (
                  <div className="absolute w-full bg-[#2a2a2a] border-[#3a3a3a] text-white rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                    {languageData.length ? (
                      languageData.map((language) => (
                        <div
                          key={language.id}
                          onClick={() =>
                            handleLanguageToggle(language.language_name)
                          }
                          className={`flex items-center p-2 cursor-pointer hover:bg-[#3a3a3a] ${
                            formState.languages.includes(language.language_name)
                              ? "bg-[#444]"
                              : ""
                          }`}
                        >
                          <Check
                            className={`h-4 w-4 mr-2 ${
                              formState.languages.includes(
                                language.language_name
                              )
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {language.language_name}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-400">
                        No languages available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#333]"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
