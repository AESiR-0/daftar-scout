"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Lock } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsScoutLocked } from "@/contexts/isScoutLockedContext";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import { createPortal } from "react-dom";
import { ReactNode } from "react";

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
  { value: "Idea", label: "Idea Stage" },
  { value: "Prototype to MVP", label: "Prototype to MVP" },
  { value: "Product Market Fit", label: "Product Market Fit" },
  { value: "Early Traction", label: "Early Traction" },
  { value: "Growth", label: "Growth" },
];

const genders = [
  { value: "Male Only Team", label: "Male Only Team" },
  { value: "Female Only Team", label: "Female Only Team" },
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

// Define types for modal props
type AudienceFiltersModalProps = {
  open: boolean;
  onClose: () => void;
  initialValues: {
    scoutCommunity: string;
    targetedGender: string;
    scoutStage: string;
    scoutSector: string[];
    ageRange: [string, string];
  };
  onApply: (args: {
    scoutCommunity: string;
    targetedGender: string;
    scoutStage: string;
    scoutSector: string[];
    ageRange: [string, string];
  }) => void;
  isLocked: boolean;
  communities: { value: string; label: string }[];
  genders: { value: string; label: string }[];
  stages: { value: string; label: string }[];
  sectors: { value: string; label: string }[];
  Combobox: React.ComponentType<any>;
  AgeRange: React.ComponentType<any>;
};

function AudienceFiltersModal({
  open,
  onClose,
  initialValues,
  onApply,
  isLocked,
  communities,
  genders,
  stages,
  sectors,
  Combobox,
  AgeRange,
}: AudienceFiltersModalProps) {
  const [tempScoutCommunity, setTempScoutCommunity] = useState(initialValues.scoutCommunity);
  const [tempTargetedGender, setTempTargetedGender] = useState(initialValues.targetedGender);
  const [tempScoutStage, setTempScoutStage] = useState(initialValues.scoutStage);
  const [tempScoutSector, setTempScoutSector] = useState(initialValues.scoutSector);
  const [tempAgeRange, setTempAgeRange] = useState<[string, string]>(initialValues.ageRange);
  const [ageError, setAgeError] = useState<string>("");
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
    setTempAgeRange(["18", "65"]);
    setAgeError("");
  };
  const applyFilters = () => {
    const dedupedSectors = Array.from(new Set(tempScoutSector));
    onApply({
      scoutCommunity: tempScoutCommunity,
      targetedGender: tempTargetedGender,
      scoutStage: tempScoutStage,
      scoutSector: dedupedSectors,
      ageRange: tempAgeRange,
    });
    onClose();
  };

  const handleMinChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      const min = parseInt(value, 10);
      const max = parseInt(tempAgeRange[1], 10);
      if (value === "" || min < 18 || min > 150) {
        setAgeError("Minimum age must be between 18 and 150");
        return;
      }
      if (max && min > max) {
        setAgeError("Minimum age cannot be greater than maximum age");
        return;
      }
      setAgeError("");
      setTempAgeRange([value, tempAgeRange[1]]);
    }
  };
  const handleMaxChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      const max = parseInt(value, 10);
      const min = parseInt(tempAgeRange[0], 10);
      if (value === "" || max < 18 || max > 150) {
        setAgeError("Maximum age must be between 18 and 150");
        return;
      }
      if (min && max < min) {
        setAgeError("Maximum age cannot be less than minimum age");
        return;
      }
      setAgeError("");
      setTempAgeRange([tempAgeRange[0], value]);
    }
  };

  if (!open || typeof window === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      aria-modal="true"
      role="dialog"
      aria-label="Audience Filters Modal"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-[#1a1a1a] text-white border-none rounded-[0.35rem] p-6 relative"
        onClick={e => e.stopPropagation()}
        role="document"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Audience Filters</h2>
          <button
            className="text-white hover:text-gray-300 text-2xl leading-none"
            onClick={onClose}
            aria-label="Close Audience Filters Modal"
          >
            &times;
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          If you a community, sector, or stage that you are specifically scouting for is not available in our list, just message us through support in your profile. We’ll update it within 12 hours.( notification will be sent to you )
        </p>
        <form action="" onSubmit={e => e.preventDefault()}>
          <div className="space-y-6 py-4">
            <div>
              <Combobox
                options={communities}
                value={tempScoutCommunity}
                onSelect={setTempScoutCommunity}
                placeholder="Select a Community"
                disabled={isLocked}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <AgeRange
                  minAge={tempAgeRange[0]}
                  maxAge={tempAgeRange[1]}
                  onMinChange={(value: string) => handleMinChange(value)}
                  onMaxChange={(value: string) => handleMaxChange(value)}
                  disabled={isLocked}
                />
                {ageError && <div className="text-red-500 text-xs mt-1">{ageError}</div>}
              </div>
              <div className="flex-1">
                <Combobox
                  options={genders}
                  value={tempTargetedGender}
                  onSelect={setTempTargetedGender}
                  placeholder="Select Gender"
                  disabled={isLocked}
                />
              </div>
            </div>
            <div>
              <Combobox
                options={stages}
                value={tempScoutStage}
                onSelect={setTempScoutStage}
                placeholder="Select a Startup Stage"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <Combobox
                options={sectors}
                value={tempScoutSector}
                onSelect={handleSectorSelect}
                placeholder="Add Sectors (Multiple Select)"
                multiple
                disabled={isLocked}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {tempScoutSector.map((sector, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs ${!isLocked ? 'cursor-pointer hover:bg-muted' : ''} bg-[#2a2a2a] text-white rounded-[0.35rem]`}
                    onClick={() => !isLocked && handleSectorSelect(sector)}
                  >
                    {sector} {!isLocked && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            className="rounded-[0.35rem]"
            onClick={clearFilters}
            disabled={isLocked}
          >
            Clear Filters
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 rounded-[0.35rem]"
            onClick={applyFilters}
            disabled={isLocked}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AudiencePage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsScoutLocked();
  const { toast } = useToast();
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

  // Combobox component
  const Combobox = ({
    options,
    value,
    onSelect,
    placeholder,
    multiple = false,
    disabled = false,
  }: {
    options: { value: string; label: string }[];
    value: string | string[];
    onSelect: (value: string) => void;
    placeholder: string;
    multiple?: boolean;
    disabled?: boolean;
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
          disabled={disabled}
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
    disabled = false,
  }: {
    minAge: string;
    maxAge: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
    disabled?: boolean;
  }) => {
    return (
      <div className="flex gap-2">
        <input
          type="number"
          value={minAge}
          onChange={e => onMinChange(e.target.value)}
          placeholder="Min"
          className="bg-[#1a1a1a] text-white rounded-[0.35rem] w-full h-9 px-3 border border-input"
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <input
          type="number"
          value={maxAge}
          onChange={e => onMaxChange(e.target.value)}
          placeholder="Max"
          className="bg-[#1a1a1a] text-white rounded-[0.35rem] w-full h-9 px-3 border border-input"
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
    );
  };

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
    }
  };

  useEffect(() => {
    fetchSectorsData();
    fetchInitialData();
  }, [scoutId]);

  useEffect(() => {
    if (isLocked) {
      toast({
        title: "Scout is Locked",
        description: "This scout is not in planning stage anymore and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked, toast]);

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
      toast({
        title: "Success",
        description: "Audience filters saved successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save audience filters.",
        variant: "destructive",
      });
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

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="container px-10 mx-auto py-6">
      {isLocked && (
        <div className="flex items-center gap-2 text-destructive mb-4">
          <Lock className="h-5 w-5" />
          <p className="text-sm font-medium">The scout is locked. You can not make any changes to it.</p>
        </div>
      )}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Pin Location</Label>
          <Input
            placeholder="City, State, or Country (e.g., Mumbai, Maharashtra, India)"
            value={targetAudLocation}
            onChange={(e) => handleLocationInput(e.target.value)}
            onBlur={handleLocationBlur}
            className="text-white rounded-[0.35rem]"
            disabled={isLocked}
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
          <Button
            variant="outline"
            className="rounded-[0.35rem]"
            onClick={() => setOpenFilters(true)}
          >
            Edit Audience Filters
          </Button>
          {openFilters && (
            <AudienceFiltersModal
              open={openFilters}
              onClose={() => setOpenFilters(false)}
              initialValues={{
                scoutCommunity,
                targetedGender,
                scoutStage,
                scoutSector,
                ageRange: [targetAudAgeStart.toString(), targetAudAgeEnd.toString()],
              }}
              onApply={({ scoutCommunity, targetedGender, scoutStage, scoutSector, ageRange }) => {
                const minAgeInt = parseInt(ageRange[0], 10) || 0;
                const maxAgeInt = parseInt(ageRange[1], 10) || 0;
                setScoutCommunity(scoutCommunity);
                setTargetedGender(targetedGender);
                setScoutStage(scoutStage);
                setScoutSector(scoutSector);
                setTargetAudAgeStart(minAgeInt);
                setTargetAudAgeEnd(maxAgeInt);
                try {
                  const formData = AudienceSchema.parse({
                    targetAudLocation,
                    scoutCommunity,
                    targetedGender,
                    scoutStage,
                    scoutSector,
                    targetAudAgeStart: minAgeInt,
                    targetAudAgeEnd: maxAgeInt,
                  });
                  saveData(formData);
                } catch (error) {
                  console.error("Validation error on apply filters:", error);
                }
              }}
              isLocked={isLocked}
              communities={communities}
              genders={genders}
              stages={stages}
              sectors={sectors}
              Combobox={Combobox}
              AgeRange={AgeRange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
