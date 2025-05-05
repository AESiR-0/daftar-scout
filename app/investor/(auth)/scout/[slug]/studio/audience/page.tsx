"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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
import "leaflet/dist/leaflet.css";

// Custom Leaflet marker icon using online URLs
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Constants
const communities = [
  { value: "Auto-rickshaw drivers", label: "Auto-rickshaw drivers" },
  {
    value: "Black Lives Matter activists",
    label: "Black Lives Matter activists",
  },
  { value: "Coastal cleanup crews", label: "Coastal cleanup crews" },
  {
    value: "Criminals seeking to change their lives positively",
    label: "Criminals seeking to change their lives positively",
  },
  { value: "Delivery gig workers", label: "Delivery gig workers" },
  { value: "Doctors in tech", label: "Doctors in tech" },
  {
    value: "Eco-friendly fashion designers",
    label: "Eco-friendly fashion designers",
  },
  { value: "Engineers", label: "Engineers" },
  { value: "Failed startup founders", label: "Failed startup founders" },
  { value: "Farmers", label: "Farmers" },
  { value: "Government school students", label: "Government school students" },
  { value: "Homeless", label: "Homeless" },
  {
    value: "Influencers with 1 million followers",
    label: "Influencers with 1 million followers",
  },
  { value: "LGBTQ+", label: "LGBTQ+" },
  { value: "Management students", label: "Management students" },
  { value: "McKinsey consultants", label: "McKinsey consultants" },
  { value: "Migrants", label: "Migrants" },
  { value: "News and media", label: "News and media" },
  {
    value: "People of Andaman & Lakshadweep",
    label: "People of Andaman & Lakshadweep",
  },
  { value: "People of Ladakh", label: "People of Ladakh" },
  { value: "People with disabilities", label: "People with disabilities" },
  {
    value: "People with special home remedies",
    label: "People with special home remedies",
  },
  { value: "Refugees", label: "Refugees" },
  { value: "Residents of old age homes", label: "Residents of old age homes" },
  { value: "Retired professionals", label: "Retired professionals" },
  { value: "Second-time founders", label: "Second-time founders" },
  { value: "Sewage cleaners", label: "Sewage cleaners" },
  { value: "Social impact founders", label: "Social impact founders" },
  {
    value: "Special Forces and Armed Forces",
    label: "Special Forces and Armed Forces",
  },
  { value: "Street food vendors", label: "Street food vendors" },
  { value: "Ukrainian war refugees", label: "Ukrainian war refugees" },
  { value: "Under 25 founders", label: "Under 25 founders" },
  {
    value: "Urban waste management workers",
    label: "Urban waste management workers",
  },
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
  targetAudLocation: z.string().nullable().default(""),
  scoutCommunity: z.string().nullable().default(""),
  targetedGender: z.string().nullable().default(""),
  scoutStage: z.string().nullable().default(""),
  scoutSector: z.array(z.string()).nullable().default([]),
  targetAudAgeStart: z.number().nullable().default(18),
  targetAudAgeEnd: z.number().nullable().default(65),
});

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
  const [targetAudLocation, setTargetAudLocation] = useState<string>("");
  const [location, setLocation] = useState<{
    country: string;
    state: string;
    city: string;
  }>({ country: "", state: "", city: "" });
  const [coordinates, setCoordinates] = useState<LatLngTuple | null>(null);
  const [scoutCommunity, setScoutCommunity] = useState<string>("");
  const [targetedGender, setTargetedGender] = useState<string>("");
  const [scoutStage, setScoutStage] = useState<string>("");
  const [scoutSector, setScoutSector] = useState<string[]>([]);
  const [targetAudAgeStart, setTargetAudAgeStart] = useState<number>(18);
  const [targetAudAgeEnd, setTargetAudAgeEnd] = useState<number>(65);
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const [sectors, setSectors] = useState<{ value: string; label: string }[]>(
    []
  );
  const [tempScoutCommunity, setTempScoutCommunity] = useState<string>("");
  const [tempTargetedGender, setTempTargetedGender] = useState<string>("");
  const [tempScoutStage, setTempScoutStage] = useState<string>("");
  const [tempScoutSector, setTempScoutSector] = useState<string[]>([]);
  const [tempAgeRange, setTempAgeRange] = useState<[number, number]>([18, 65]);

  // Combobox component
  const Combobox = ({
    options,
    value,
    onSelect,
    placeholder,
    multiple = false,
  }: {
    options: { value: string; label: string }[];
    value: string | string[];
    onSelect: (value: string) => void;
    placeholder: string;
    multiple?: boolean;
  }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );

    const displayValue = multiple
      ? ""
      : options.find((opt) => opt.value === value)?.label || "";

    return (
      <div className="relative">
        <Input
          value={search || displayValue}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          className="bg-[#1a1a1a] text-white rounded-[0.35rem]"
        />
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-[#1a1a1a] border border-gray-700 rounded-[0.35rem] max-h-60 overflow-auto">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    if (!multiple) {
                      setSearch("");
                      setOpen(false);
                    }
                  }}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400">No options found</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // AgeRange component
  const AgeRange = ({
    minAge,
    maxAge,
    onMinChange,
    onMaxChange,
  }: {
    minAge: string;
    maxAge: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
  }) => (
    <div className="flex gap-2">
      <Input
        type="number"
        value={minAge}
        onChange={(e) => onMinChange(e.target.value)}
        placeholder="Min"
        className="bg-[#1a1a1a] text-white rounded-[0.35rem]"
      />
      <Input
        type="number"
        value={maxAge}
        onChange={(e) => onMaxChange(e.target.value)}
        placeholder="Max"
        className="bg-[#1a1a1a] text-white rounded-[0.35rem]"
      />
    </div>
  );

  // Fetch sectors data
  const fetchSectorsData = async () => {
    try {
      const res = await fetch("/api/endpoints/focus-sectors");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const formattedSectors = data.map((sector: any) => ({
        value: sector.sectorName,
        label: sector.sectorName,
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
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const { data } = await res.json();
      const parsed = AudienceSchema.parse(data ?? {});
      setTargetAudLocation(parsed.targetAudLocation ?? "");
      setScoutCommunity(parsed.scoutCommunity ?? "");
      setTargetedGender(parsed.targetedGender ?? "");
      setScoutStage(parsed.scoutStage ?? "");
      setScoutSector(parsed.scoutSector ?? []);
      setTargetAudAgeStart(parsed.targetAudAgeStart ?? 18);
      setTargetAudAgeEnd(parsed.targetAudAgeEnd ?? 65);
      setTempScoutCommunity(parsed.scoutCommunity ?? "");
      setTempTargetedGender(parsed.targetedGender ?? "");
      setTempScoutStage(parsed.scoutStage ?? "");
      setTempScoutSector(parsed.scoutSector ?? []);
      setTempAgeRange([
        parsed.targetAudAgeStart ?? 18,
        parsed.targetAudAgeEnd ?? 65,
      ]);

      if (parsed.targetAudLocation) {
        setTargetAudLocation(parsed.targetAudLocation);
        debounceLocation(parsed.targetAudLocation);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      const defaults = AudienceSchema.parse({});
      setTargetAudLocation(defaults.targetAudLocation ?? "");
      setScoutCommunity(defaults.scoutCommunity ?? "");
      setTargetedGender(defaults.targetedGender ?? "");
      setScoutStage(defaults.scoutStage ?? "");
      setScoutSector(defaults.scoutSector ?? []);
      setTargetAudAgeStart(defaults.targetAudAgeStart ?? 18);
      setTargetAudAgeEnd(defaults.targetAudAgeEnd ?? 65);
      setTempScoutCommunity(defaults.scoutCommunity ?? "");
      setTempTargetedGender(defaults.targetedGender ?? "");
      setTempScoutStage(defaults.scoutStage ?? "");
      setTempScoutSector(defaults.scoutSector ?? []);
      setTempAgeRange([
        defaults.targetAudAgeStart ?? 18,
        defaults.targetAudAgeEnd ?? 65,
      ]);
    }
  };

  useEffect(() => {
    fetchSectorsData();
    fetchInitialData();
  }, [scoutId]);

  // Handle location input and coordinates
  const handleLocationInput = (value: string) => {
    setTargetAudLocation(value);
    debounceLocation(value);
  };

  const debounceLocation = useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) {
        setLocation({ city: "", state: "", country: "" });
        setCoordinates(null);
        return;
      }

      try {
        const query = encodeURIComponent(value.trim());
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=1`
        );
        const data = await response.json();

        if (data && data[0]) {
          const { lat, lon, address } = data[0];
          const coords: LatLngTuple = [parseFloat(lat), parseFloat(lon)];
          setCoordinates(coords);
          setLocation({
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            country: address.country || "",
          });
        } else {
          setCoordinates(null);
          setLocation({ city: "", state: "", country: "" });
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setCoordinates(null);
        setLocation({ city: "", state: "", country: "" });
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
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
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
        <div className="space-y-4">
          <Label>Pin Location</Label>
          <Input
            placeholder="City, State, or Country (e.g., Mumbai, Maharashtra, India)"
            value={targetAudLocation}
            onChange={(e) => handleLocationInput(e.target.value)}
            onBlur={handleLocationBlur}
            className="text-white rounded-[0.35rem]"
          />
          <div className="w-full h-[400px] rounded-lg overflow-hidden border">
            {typeof window !== "undefined" ? (
              <MapContainer
                center={coordinates || [20, 0]}
                zoom={coordinates ? 12 : 2}
                style={{ height: "100%", width: "100%", zIndex: 2 }}
                key={coordinates ? coordinates.join(",") : "default"}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {coordinates && (
                  <Marker position={coordinates} icon={customIcon} />
                )}
              </MapContainer>
            ) : (
              <div className="w-full h-[400px] bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading.. </p>
              </div>
            )}
          </div>
        </div>

        {/* Filters Button and Dialog */}
        <div className="z-10">
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
              <div className="space-y-6 py-4">
                <div>
                  {/* <Label>Community</Label> */}
                  <Combobox
                    options={communities}
                    value={tempScoutCommunity}
                    onSelect={(value) => setTempScoutCommunity(value)}
                    placeholder="Select a Community"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    {/* <Label>Age Range</Label> */}
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
                    {/* <Label>Gender</Label> */}
                    <Combobox
                      options={genders}
                      value={tempTargetedGender}
                      onSelect={(value) => setTempTargetedGender(value)}
                      placeholder="Select Gender"
                    />
                  </div>
                </div>
                <div>
                  {/* <Label>Stage</Label> */}
                  <Combobox
                    options={stages}
                    value={tempScoutStage}
                    onSelect={(value) => setTempScoutStage(value)}
                    placeholder="Select a Startup Stage"
                  />
                </div>
                <div className="space-y-2">
                  {/* <Label>Focus Sectors (Multiple Select)</Label> */}
                  <Combobox
                    options={sectors}
                    value={tempScoutSector}
                    onSelect={handleSectorSelect}
                    placeholder="Add Sectors (Multiple Select)"
                    multiple
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
