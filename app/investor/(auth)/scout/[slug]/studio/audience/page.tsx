"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AgeRange } from "./components/age-range";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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
const communities = [
  { value: "Auto-rickshaw drivers", label: "Auto-rickshaw drivers" },
  { value: "Black Lives Matter activists", label: "Black Lives Matter activists" },
  { value: "Coastal cleanup crews", label: "Coastal cleanup crews" },
  { value: "Criminals seeking to change their lives positively", label: "Criminals seeking to change their lives positively" },
  { value: "Delivery gig workers", label: "Delivery gig workers" },
  { value: "Doctors in tech", label: "Doctors in tech" },
  { value: "Eco-friendly fashion designers", label: "Eco-friendly fashion designers" },
  { value: "Engineers", label: "Engineers" },
  { value: "Failed startup founders", label: "Failed startup founders" },
  { value: "Farmers", label: "Farmers" },
  { value: "Government school students", label: "Government school students" },
  { value: "Homeless", label: "Homeless" },
  { value: "Influencers with 1 million followers", label: "Influencers with 1 million followers" },
  { value: "LGBTQ+", label: "LGBTQ+" },
  { value: "Management students", label: "Management students" },
  { value: "McKinsey consultants", label: "McKinsey consultants" },
  { value: "Migrants", label: "Migrants" },
  { value: "News and media", label: "News and media" },
  { value: "People of Andaman & Lakshadweep", label: "People of Andaman & Lakshadweep" },
  { value: "People of Ladakh", label: "People of Ladakh" },
  { value: "People with disabilities", label: "People with disabilities" },
  { value: "People with special home remedies", label: "People with special home remedies" },
  { value: "Refugees", label: "Refugees" },
  { value: "Residents of old age homes", label: "Residents of old age homes" },
  { value: "Retired professionals", label: "Retired professionals" },
  { value: "Second-time founders", label: "Second-time founders" },
  { value: "Sewage cleaners", label: "Sewage cleaners" },
  { value: "Social impact founders", label: "Social impact founders" },
  { value: "Special Forces and Armed Forces", label: "Special Forces and Armed Forces" },
  { value: "Street food vendors", label: "Street food vendors" },
  { value: "Ukrainian war refugees", label: "Ukrainian war refugees" },
  { value: "Under 25 founders", label: "Under 25 founders" },
  { value: "Urban waste management workers", label: "Urban waste management workers" },
  { value: "War Soldiers", label: "War Soldiers" },
  { value: "Women", label: "Women" },
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
  { value: "Transgender", label: "Transgender" },
  { value: "Atleast one Male", label: "Atleast one Male" },
  { value: "Atleast one Female", label: "Atleast one Female" },
  { value: "Open to All", label: "Open to All" },
];

// Zod Schema
const AudienceSchema = z.object({
  targetAudLocation: z.string().optional().default(""),
  scoutCommunity: z.string().optional().default(""),
  targetedGender: z.string().optional().default(""),
  scoutStage: z.string().optional().default(""),
  scoutSector: z.array(z.string()).optional().default([]),
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

  const [scoutCommunity, setScoutCommunity] = useState<string>("");
  const [targetedGender, setTargetedGender] = useState<string>("");
  const [scoutStage, setScoutStage] = useState<string>("");
  const [scoutSector, setScoutSector] = useState<string[]>([]);
  const [targetAudAgeStart, setTargetAudAgeStart] = useState<number>(18);
  const [targetAudAgeEnd, setTargetAudAgeEnd] = useState<number>(65);

  const [openFilters, setOpenFilters] = useState(false);
  const [sectors, setSectors] = useState<{ value: string; label: string }[]>([]);

  // Temporary state for dialog
  const [tempScoutCommunity, setTempScoutCommunity] =
    useState<string>(scoutCommunity);
  const [tempTargetedGender, setTempTargetedGender] =
    useState<string>(targetedGender);
  const [tempScoutStage, setTempScoutStage] = useState<string>(scoutStage);
  const [tempScoutSector, setTempScoutSector] = useState<string[]>(scoutSector);
  const [tempAgeRange, setTempAgeRange] = useState<[number, number]>([
    targetAudAgeStart,
    targetAudAgeEnd,
  ]);

  // Fetch sectors data
  const fetchSectorsData = async () => {
    try {
      const res = await fetch("/api/endpoints/focus-sectors");
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const { data } = await res.json();
      const formattedSectors = data.map((sector: string) => ({
        value: sector,
        label: sector,
      }));
      setSectors(formattedSectors);
    } catch (error) {
      console.error("Error fetching sectors data:", error);
    }
  };

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `/api/endpoints/scouts/audience?scoutId=${scoutId}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      const parsed = AudienceSchema.parse(data.data);
      setTargetAudLocation(parsed.targetAudLocation || "");
      setScoutCommunity(parsed.scoutCommunity || "");
      setTargetedGender(parsed.targetedGender || "");
      setScoutStage(parsed.scoutStage || "");
      setScoutSector(parsed.scoutSector || []);
      setTargetAudAgeStart(parsed.targetAudAgeStart || 18);
      setTargetAudAgeEnd(parsed.targetAudAgeEnd || 65);

      // Initialize temp state
      setTempScoutCommunity(parsed.scoutCommunity || "");
      setTempTargetedGender(parsed.targetedGender || "");
      setTempScoutStage(parsed.scoutStage || "");
      setTempScoutSector(parsed.scoutSector || []);
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
    fetchSectorsData();
    fetchInitialData();
  }, [scoutId]);

  // Handle location input and coordinates
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

  // Save data to API
  const saveData = async (formData: z.infer<typeof AudienceSchema>) => {
    try {
      const payload = { ...formData, scoutId };
      const response = await fetch("/api/endpoints/scouts/audience", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Handle blur for location input
  const handleLocationBlur = () => {
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
      saveData(formData);
    } catch (error) {
      console.error("Validation error on location blur:", error);
    }
  };

  // Handle apply filters in dialog
  const applyFilters = () => {
    setScoutCommunity(tempScoutCommunity);
    setTargetedGender(tempTargetedGender);
    setScoutStage(tempScoutStage);
    setScoutSector(tempScoutSector);
    setTargetAudAgeStart(tempAgeRange[0]);
    setTargetAudAgeEnd(tempAgeRange[1]);

    try {
      const formData = AudienceSchema.parse({
        targetAudLocation,
        scoutCommunity: tempScoutCommunity,
        targetedGender: tempTargetedGender,
        scoutStage: tempScoutStage,
        scoutSector: tempScoutSector,
        targetAudAgeStart: tempAgeRange[0],
        targetAudAgeEnd: tempAgeRange[1],
      });
      saveData(formData);
    } catch (error) {
      console.error("Validation error on apply filters:", error);
    }

    setOpenFilters(false);
  };

  // Handle multi-select for sectors
  const handleSectorSelect = (value: string) => {
    setTempScoutSector((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setTempScoutCommunity("");
    setTempTargetedGender("");
    setTempScoutStage("");
    setTempScoutSector([]);
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
            onBlur={handleLocationBlur}
            className="bg-[#1a1a1a] text-white rounded-[0.35rem]"
          />
          <div className="w-full h-[400px] rounded-lg overflow-hidden border">
            <MapComponent coordinates={coordinates} />
          </div>
        </div>

        {/* Filters Button and Dialog */}
        <div>
          <Dialog open={openFilters} onOpenChange={setOpenFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-[0.35rem]">
                Edit Audience Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-[#1a1a1a] text-white border-none rounded-[0.35rem]">
              <DialogHeader>
                <DialogTitle>Audience Filters</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Community</Label>
                  <Combobox
                    options={communities.map((community) => community.value)}
                    value={tempScoutCommunity}
                    onSelect={(value) => setTempScoutCommunity(value)}
                    placeholder="Select a Community"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Age Range</Label>
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
                    <Label>Gender</Label>
                    <Combobox
                      options={genders.map((gender) => gender.value)}
                      value={tempTargetedGender}
                      onSelect={(value) => setTempTargetedGender(value)}
                      placeholder="Select a Gender"
                    />
                  </div>
                </div>
                <div>
                  <Label>Stage</Label>
                  <Combobox
                    options={stages.map((stage) => stage.value)}
                    value={tempScoutStage}
                    onSelect={(value) => setTempScoutStage(value)}
                    placeholder="Select a Stage"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Sectors (Multiple Select)</Label>
                  <Combobox
                    options={sectors.map((sector) => sector.value)}
                    onSelect={handleSectorSelect}
                    placeholder="Add sectors"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tempScoutSector.map((sector, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-muted bg-[#2a2a2a] text-white rounded-[0.35rem]"
                        onClick={() => handleSectorSelect(sector)}
                      >
                        {sector} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-[0.35rem]"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 rounded-[0.35rem]"
                  onClick={applyFilters}
                >
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}