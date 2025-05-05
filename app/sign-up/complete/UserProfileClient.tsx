"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Country {
  name: string;
  code: string;
  dial_code: string;
}

const roleSchema = z.object({
  role: z.enum(["founder", "investor"]),
});

const createPersonalInfoSchema = (countryCode: string) =>
  z.object({
    name: z.string().min(1, "First name cannot be empty"),
    lastName: z.string().min(1, "Last name cannot be empty"),
    gender: z.enum(["Male", "Female", "Trans", "Other"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
    number: z
      .string()
      .min(1, "Phone number cannot be empty")
      .regex(/^\d+$/, "Phone number should contain only numbers")
      .refine(
        (val) => {
          if (countryCode === "+91") {
            return val.length === 10;
          }
          return true;
        },
        {
          message: "Indian phone numbers must be 10 digits",
        }
      ),
    dob: z.string().min(1, "Date of birth cannot be empty"),
    countryCode: z.string().min(1, "Country code cannot be empty"),
  });

const languagesSchema = z.object({
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
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);
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
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formState, string>>
  >({});
  const { toast } = useToast();
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd"
        );
        if (!response.ok) throw new Error("Failed to fetch countries");

        const data = await response.json();
        const formattedCountries = data
          .filter(
            (country: any) => country.idd.root && country.idd.suffixes?.[0]
          )
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            dial_code: `${country.idd.root}${country.idd.suffixes[0]}`,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([
          { name: "United States", code: "US", dial_code: "+1" },
          { name: "United Kingdom", code: "GB", dial_code: "+44" },
          { name: "India", code: "IN", dial_code: "+91" },
          { name: "Canada", code: "CA", dial_code: "+1" },
          { name: "Australia", code: "AU", dial_code: "+61" },
          { name: "Germany", code: "DE", dial_code: "+49" },
          { name: "France", code: "FR", dial_code: "+33" },
          { name: "Japan", code: "JP", dial_code: "+81" },
          { name: "China", code: "CN", dial_code: "+86" },
          { name: "Brazil", code: "BR", dial_code: "+55" },
        ]);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (languageData && languageData.length > 0) {
      setIsLanguageLoading(false);
    }
  }, [languageData]);

  const handleChange = (field: string, value: string) => {
    if (field === "number" && value && !/^\d*$/.test(value)) {
      return;
    }

    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (field === "role") {
      setFormState((prev) => ({ ...prev, languages: [] }));
    }
  };

  const handleLanguageToggle = (language: string) => {
    setFormState((prev) => {
      const isLanguageSelected = prev.languages.includes(language);
      let selectedLanguages: string[];

      if (isLanguageSelected) {
        selectedLanguages = prev.languages.filter((lang) => lang !== language);
      } else {
        if (prev.role === "founder" && prev.languages.length >= 3) {
          toast({
            title: "Language Limit",
            description: "Founders can select up to 3 languages only",
            variant: "destructive",
          });
          return prev;
        }
        selectedLanguages = [...prev.languages, language];
      }

      return { ...prev, languages: selectedLanguages };
    });
    setErrors((prev) => ({ ...prev, languages: undefined }));
  };

  const validateCurrentStep = () => {
    let result;
    switch (currentStep) {
      case 1:
        result = roleSchema.safeParse({ role: formState.role });
        break;
      case 2:
        result = createPersonalInfoSchema(formState.countryCode).safeParse({
          name: formState.name,
          lastName: formState.lastName,
          gender: formState.gender,
          number: formState.number,
          dob: formState.dob,
          countryCode: formState.countryCode,
        });
        break;
      case 3:
        result = languagesSchema.safeParse({ languages: formState.languages });
        break;
    }

    if (!result?.success) {
      const flattenedErrors = result?.error.flatten().fieldErrors;
      const formattedErrors: Partial<Record<keyof typeof formState, string>> =
        {};

      Object.entries(flattenedErrors || {}).forEach(([key, value]) => {
        formattedErrors[key as keyof typeof formState] = value?.[0];
      });

      setErrors(formattedErrors);
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    const res = await fetch(`/api/endpoints/users/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: formState, email: userMail }),
    });
    if (res.status == 200) {
      toast({ title: "Success", description: "Profile updated successfully!" });
      router.push(`/${formState.role}`);
    } else {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
      router.refresh();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col items-center gap-8">
            <h3 className="text-2xl font-medium">Select Your Role</h3>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                variant={formState.role === "founder" ? "default" : "outline"}
                onClick={() => handleChange("role", "founder")}
                className={`col-span-2 rounded-[0.35rem] ${
                  formState.role === "founder" ? "bg-secondary" : ""
                }`}
              >
                <span className="text-lg">I'm a Founder</span>
              </Button>
              <Button
                variant={formState.role === "investor" ? "default" : "outline"}
                onClick={() => handleChange("role", "investor")}
                className={`col-span-2 rounded-[0.35rem] ${
                  formState.role === "investor" ? "bg-secondary" : ""
                }`}
              >
                <span className="text-lg">I'm an Investor</span>
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-[1fr_1fr] gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white h-12"
              />
              {errors.name && (
                <p className="text-red-500 text-xs max-w-full">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formState.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white h-12"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs max-w-full">
                  {errors.lastName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formState.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white h-12"
              />
              {errors.dob && (
                <p className="text-red-500 text-xs max-w-full">{errors.dob}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formState.gender}
                onValueChange={(value) => handleChange("gender", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="bg-[#2a2a2a] border-[#3a3a3a] text-white h-12">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a] text-white">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Trans">Trans</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-red-500 text-xs max-w-full">
                  {errors.gender}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">Country Code</Label>
              <Popover
                open={countryDropdownOpen}
                onOpenChange={setCountryDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryDropdownOpen}
                    className="w-full min-w-[120px] justify-between bg-[#2a2a2a] border-[#3a3a3a] text-white h-12 text-left"
                    disabled={isSubmitting}
                  >
                    {formState.countryCode || "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0 bg-[#2a2a2a] border-[#3a3a3a] text-white"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search country..."
                      className="h-9"
                    />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {countries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.name}
                          onSelect={() => {
                            handleChange("countryCode", country.dial_code);
                            setCountryDropdownOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formState.countryCode === country.dial_code
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          <span className="mr-2">{country.dial_code}</span>
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.countryCode && (
                <p className="text-red-500 text-xs max-w-full">
                  {errors.countryCode}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input
                id="number"
                value={formState.number}
                onChange={(e) => handleChange("number", e.target.value)}
                disabled={isSubmitting}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white h-12"
              />
              {errors.number && (
                <p className="text-red-500 text-xs max-w-full">
                  {errors.number}
                </p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={dropdownOpen}
                  className="w-full min-w-[120px] justify-between bg-[#2a2a2a] border-[#3a3a3a] text-white h-12 text-left"
                  disabled={isSubmitting}
                >
                  {formState.languages.length
                    ? formState.languages.join(", ")
                    : isLanguageLoading
                    ? "Loading"
                    : formState.role === "founder"
                    ? "Select Preferred Languages to Connect with Investors"
                    : formState.role === "investor"
                    ? "Select Preferred Languages to Connect with Founders"
                    : "Select Preferred Languages"}
                  {isLanguageLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 shrink-0 opacity-50 animate-spin" />
                  ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[300px] p-0 bg-[#2a2a2a] border-[#3a3a3a] text-white"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Search languages..."
                    className="h-9"
                  />
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {isLanguageLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      languageData?.map((language) => (
                        <CommandItem
                          key={language.id}
                          value={language.language_name}
                          onSelect={() =>
                            handleLanguageToggle(language.language_name)
                          }
                          className="cursor-pointer"
                          disabled={
                            formState.role === "founder" &&
                            formState.languages.length >= 3 &&
                            !formState.languages.includes(
                              language.language_name
                            )
                          }
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formState.languages.includes(
                                language.language_name
                              )
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {language.language_name}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.languages && (
              <p className="text-red-500 text-xs max-w-full">
                {errors.languages}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] p-4 flex items-center justify-center">
      <Card className="border-none w-[32rem] bg-[#1a1a1a] text-white">
        <CardContent className="py-8 px-8">
          {renderStep()}
          <div className="flex justify-between mt-12 w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="rounded-[0.35rem]"
            >
              Back
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="rounded-[0.35rem]"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-[0.35rem]"
              >
                {isSubmitting ? "Saving..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
