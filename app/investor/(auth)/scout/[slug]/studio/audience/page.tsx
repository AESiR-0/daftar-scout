"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AgeRange } from "./components/age-range";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

// Constants
const communitiesData = [
  { label: "Auto - rickshaw drivers", value: "auto-rickshaw" },
  { label: "Black Lives Matter activists", value: "black-lives" },
  { label: "Coastal cleanup crews", value: "coastal" },
  {
    label: "Criminals seeking to change their lives positively",
    value: "criminals",
  },
  { label: "Delivery gig workers", value: "delivery" },
  { label: "Doctors in tech", value: "doctors" },
  { label: "Eco - friendly fashion designers", value: "eco-friendly" },
  { label: "Engineers", value: "engineers" },
  { label: "Failed startup founders", value: "failed" },
  { label: "Farmers", value: "farmers" },
  { label: "Government school students", value: "government" },
  { label: "Homeless", value: "homeless" },
  { label: "Influencers with 1 million followers", value: "influencers" },
  { label: "LGBTQ +", value: "lgbtq" },
  { label: "Management students", value: "management" },
  { label: "McKinsey consultants", value: "mckinsey" },
  { label: "Migrants", value: "migrants" },
  { label: "News and media", value: "news" },
  { label: "People of Andaman & Lakshadweep", value: "andaman" },
  { label: "People of Ladakh", value: "ladakh" },
  { label: "People with disabilities", value: "disabled" },
  { label: "People with special home remedies", value: "home-remedies" },
  { label: "Refugees", value: "refugees" },
  { label: "Residents of old age homes", value: "old-age" },
  { label: "Retired professionals", value: "retired" },
  { label: "Second - time founders", value: "second-time" },
  { label: "Sewage cleaners", value: "sewage" },
  { label: "Social impact founders", value: "social-impact" },
  { label: "Special Forces and Armed Forces", value: "special-forces" },
  { label: "Street food vendors", value: "street-food" },
  { label: "Ukrainian war refugees", value: "ukrainian" },
  { label: "Under 25 founders", value: "under-25" },
  { label: "Urban waste management workers", value: "waste-management" },
  { label: "War Soldiers", value: "war-soldiers" },
  { label: "Women", value: "women" },
];

const sectors = [
  { value: "accounting", label: "Accounting Technology" },
  { value: "agriculture", label: "Agriculture Technology" },
  { value: "ai", label: "AI (Artificial Intelligence)" },
  { value: "aging", label: "Aging and Elderly Care Tech" },
  { value: "amazon", label: "Amazon Delivery Services" },
  { value: "augmented", label: "Augmented Reality" },
  { value: "automated", label: "Automated Bookkeeping" },
  { value: "automation", label: "Automation" },
  { value: "beauty", label: "Beauty Tech" },
  { value: "biotechnology", label: "Biotechnology" },
  { value: "blockchain", label: "Blockchain" },
  { value: "b2b", label: "B2B Platforms" },
  { value: "b2c", label: "B2C Platforms" },
  { value: "catering", label: "Catering Technology" },
  { value: "cloud", label: "Cloud Computing" },
  { value: "content", label: "Content Creation" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "digital", label: "Digital Marketing" },
  { value: "education", label: "E-learning Platforms" },
  { value: "gaming", label: "Gaming" },
  { value: "healthcare", label: "Healthcare" },
  { value: "investment", label: "Investment Platforms" },
  { value: "legaltech", label: "LegalTech" },
  { value: "machine-learning", label: "Machine Learning (ML)" },
  { value: "mobile", label: "Mobile Apps" },
  { value: "real-estate", label: "Real Estate" },
  { value: "robotics", label: "Robotics" },
  { value: "saas", label: "SaaS (Software as a Service)" },
  { value: "social-impact", label: "Social Impact" },
  { value: "telemedicine", label: "Telemedicine" },
  { value: "transportation", label: "Transportation" },
];

const stages = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "Prototype to MVP" },
  { value: "product", label: "Product Market Fit" },
  { value: "early", label: "Early Traction" },
  { value: "growth", label: "Growth" },
];

const genders = [
  { value: "male", label: "Male Only Team" },
  { value: "female", label: "Female Only Team" },
  { value: "others", label: "Others" },
];

// Zod Schema
const AudienceSchema = z.object({
  targetAudLocation: z.string().optional().default(""),
  scoutCommunity: z.string().optional().default(""),
  targetedGender: z.string().optional().default(""),
  scoutStage: z.string().optional().default(""),
  scoutSector: z.string().optional().default(""),
  targetAudAgeStart: z.number().optional().default(18),
  targetAudAgeEnd: z.number().optional().default(65),
});

// Regex for city-state-country with flexible separators
const locationPattern = /^(.*?)(?:[\/,\-\s]+)(.*?)(?:[\/,\-\s]+)(.*?)$/;

// Debounce function
function debounce(fn: Function, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function AudiencePage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const [targetAudLocation, setTargetAudLocation] = useState("");
  const [location, setLocation] = useState({
    country: "",
    state: "",
    city: "",
  });
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const [scoutCommunity, setScoutCommunity] = useState<string>("auto-rickshaw");
  const [targetedGender, setTargetedGender] = useState<string>("");
  const [scoutStage, setScoutStage] = useState<string>("");
  const [scoutSector, setScoutSector] = useState<string>("");
  const [targetAudAgeStart, setTargetAudAgeStart] = useState<number>(18);
  const [targetAudAgeEnd, setTargetAudAgeEnd] = useState<number>(65);

  const [openFilters, setOpenFilters] = useState(false);

  // Temporary state for dialog
  const [tempScoutCommunity, setTempScoutCommunity] =
    useState<string>(scoutCommunity);
  const [tempTargetedGender, setTempTargetedGender] =
    useState<string>(targetedGender);
  const [tempScoutStage, setTempScoutStage] = useState<string>(scoutStage);
  const [tempScoutSector, setTempScoutSector] = useState<string>(scoutSector);
  const [tempAgeRange, setTempAgeRange] = useState<[number, number]>([
    targetAudAgeStart,
    targetAudAgeEnd,
  ]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `/api/endpoints/scouts/audience?scoutId=${scoutId}`
      );
      const data = await res.json();
      const parsed = AudienceSchema.parse(data);

      setTargetAudLocation(parsed.targetAudLocation || "");
      setScoutCommunity(parsed.scoutCommunity || "");
      setTargetedGender(parsed.targetedGender || "");
      setScoutStage(parsed.scoutStage || "");
      setScoutSector(parsed.scoutSector || "");
      setTargetAudAgeStart(parsed.targetAudAgeStart || 18);
      setTargetAudAgeEnd(parsed.targetAudAgeEnd || 65);

      // Initialize temp state
      setTempScoutCommunity(parsed.scoutCommunity || "");
      setTempTargetedGender(parsed.targetedGender || "");
      setTempScoutStage(parsed.scoutStage || "");
      setTempScoutSector(parsed.scoutSector || "");
      setTempAgeRange([
        parsed.targetAudAgeStart || 18,
        parsed.targetAudAgeEnd || 65,
      ]);

      // Parse location if present
      if (parsed.targetAudLocation) {
        const match = parsed.targetAudLocation.match(locationPattern);
        if (match) {
          const [, city, state, country] = match;
          setLocation({
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
          });

          // Fetch coordinates
          const query = `${city}, ${state}, ${country}`;
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
              )}`
            );
            const geoData = await geoResponse.json();
            if (geoData && geoData[0]) {
              setCoordinates([
                parseFloat(geoData[0].lat),
                parseFloat(geoData[0].lon),
              ]);
            }
          } catch (error) {
            console.error("Error fetching coordinates:", error);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleLocationInput = async (value: string) => {
    setTargetAudLocation(value);
    debounceLocation(value);
  };

  const debounceLocation = useCallback(
    debounce(async (value: string) => {
      const match = value.match(locationPattern);
      if (match) {
        const [, city, state, country] = match;

        setLocation({
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
        });

        try {
          const query = `${city}, ${state}, ${country}`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}`
          );
          const data = await response.json();

          if (data && data[0]) {
            setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        } catch (error) {
          console.error("Error fetching coordinates:", error);
        }
      }
    }, 500),
    []
  );

  const autoSave = useCallback(() => {
    const saveData = async () => {
      try {
        const formData = AudienceSchema.parse({
          targetAudLocation,
          scoutCommunity,
          targetedGender,
          scoutStage,
          scoutSector,
          targetAudAgeStart,
          targetAudAgeEnd,
        });
        const payload = { ...formData, scoutId };
        await fetch("/api/endpoints/scouts/audience", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Error autosaving:", error);
      }
    };

    const timer = setTimeout(saveData, 2000);
    return () => clearTimeout(timer);
  }, [
    targetAudLocation,
    scoutCommunity,
    targetedGender,
    scoutStage,
    scoutSector,
    targetAudAgeStart,
    targetAudAgeEnd,
  ]);

  useEffect(() => {
    autoSave();
  }, [
    targetAudLocation,
    scoutCommunity,
    targetedGender,
    scoutStage,
    scoutSector,
    targetAudAgeStart,
    targetAudAgeEnd,
  ]);

  const applyFilters = () => {
    setScoutCommunity(tempScoutCommunity);
    setTargetedGender(tempTargetedGender);
    setScoutStage(tempScoutStage);
    setScoutSector(tempScoutSector);
    setTargetAudAgeStart(tempAgeRange[0]);
    setTargetAudAgeEnd(tempAgeRange[1]);
    setOpenFilters(false);
  };

  const clearFilters = () => {
    setTempScoutCommunity("");
    setTempTargetedGender("");
    setTempScoutStage("");
    setTempScoutSector("");
    setTempAgeRange([18, 65]);
  };

  return (
    <div className="container px-10 mx-auto py-6">
      <div className="space-y-6">
        {/* Location Input */}
        <div className="space-y-4">
          <Label>Pin Location</Label>
          <Input
            placeholder="City/State/Country (e.g., Mumbai/Maharashtra/India)"
            value={targetAudLocation}
            onChange={(e) => handleLocationInput(e.target.value)}
          />
          <div className="w-full h-[400px] rounded-lg overflow-hidden border">
            <MapComponent coordinates={coordinates} />
          </div>
        </div>

        {/* Filters Button and Dialog */}
        <div>
          <Dialog open={openFilters} onOpenChange={setOpenFilters}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Audience Filters</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Audience Filters</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Combobox
                    options={communitiesData.map((community) => community.value)}
                    value={tempScoutCommunity}
                    onSelect={(value) => setTempScoutCommunity(value)}
                    placeholder="Select a community"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <AgeRange
                      minAge={tempAgeRange[0].toString()}
                      maxAge={tempAgeRange[1].toString()}
                      onMinChange={(value) =>
                        setTempAgeRange([Number(value), tempAgeRange[1]])
                      }
                      onMaxChange={(value) =>
                        setTempAgeRange([tempAgeRange[0], Number(value)])
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Combobox
                      options={genders.map((gender) => gender.value)}
                      value={tempTargetedGender}
                      onSelect={(value) => setTempTargetedGender(value)}
                      placeholder="Select a gender"
                    />
                  </div>
                </div>
                <div>
                  <Combobox
                    options={stages.map((stage) => stage.value)}
                    value={tempScoutStage}
                    onSelect={(value) => setTempScoutStage(value)}
                    placeholder="Select a stage"
                  />
                </div>
                <div>
                  <Combobox
                    options={sectors.map((sector) => sector.value)}
                    value={tempScoutSector}
                    onSelect={(value) => setTempScoutSector(value)}
                    placeholder="Select a sector"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 rounded-[0.35rem]" onClick={applyFilters}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}