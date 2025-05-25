"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lock } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useIsLocked } from "@/contexts/isLockedContext";

// Custom Leaflet marker icon using online URLs
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

const stages = [
  "Idea",
  "Prototyping To MVP",
  "Product-Market Fit",
  "Early Traction",
  "Growth",
];
const sectors = [
  "Accounting Technology",
  "Agriculture Technology",
  "AI (Artificial Intelligence)",
  "Aging and Elderly Care Tech",
  "Amazon Delivery Services",
  "Augmented Reality",
  "Automated Bookkeeping",
  "Automation",
  "Beauty Tech",
  "Biotechnology",
  "Blockchain",
  "B2B Platforms",
  "B2C Platforms",
  "Catering Technology",
  "Cloud Computing",
  "Cloud Storage",
  "Community Engagement",
  "Community Supported Agriculture (CSA)",
  "Compliance Technology",
  "Content Aggregators",
  "Content Creation",
  "Corporate Training",
  "Crowdsourced Content Platforms",
  "Crowdfunding",
  "Cyber Insurance",
  "Cybersecurity",
  "Cyber-Physical Systems",
  "Data Analytics",
  "Data Visualization",
  "Digital Entertainment",
  "Digital Identity Verification",
  "Digital Libraries",
  "Digital Marketing",
  "Digital Wallets",
  "Disaster Management Technology",
  "E-learning Platforms",
  "Edge Computing",
  "Esports",
  "Event Management Platforms",
  "Fashion Tech",
  "Fitness Apps",
  "Fitness Tech",
  "Food Delivery",
  "Food Waste Solutions",
  "Gaming",
  "Green Building Technology",
  "Health Monitoring",
  "Health Insurance Platforms",
  "Healthtech",
  "Healthcare",
  "Home Automation Systems",
  "Home Decor",
  "Home Improvement",
  "Home Healthcare",
  "HR Tech",
  "Hydroponics",
  "Insurtech",
  "Investment Platforms",
  "LegalTech",
  "Loyalty Scouts",
  "Machine Learning (ML)",
  "Marketplace Lending",
  "Meal Kit Services",
  "Mental Health Platforms",
  "Mobile Apps",
  "Mobile Communication",
  "Nutritional Apps",
  "Online Fashion Retail",
  "Online Gaming",
  "Online Learning",
  "Online Market Research",
  "Online Retail Platforms",
  "Online Therapy Services",
  "Podcasting Platforms",
  "Personal Care Products",
  "Personal Finance",
  "Personal Savings Apps",
  "Plant-Based Foods",
  "Predictive Analytics",
  "Proptech",
  "Real Estate",
  "Recycling Technology",
  "Remote Work Solutions",
  "Reputation Management",
  "Robotics",
  "SaaS (Software as a Service)",
  "Silicon Chips",
  "Smart Asset Tracking",
  "Smart Contracts",
  "Smart Fitness Devices",
  "Smart Grids",
  "Smart Home Devices",
  "Social Impact",
  "Social Media",
  "Streaming Services",
  "Sustainability Solutions",
  "Sustainable Food",
  "Sustainable Packaging Solutions",
  "Telecommunications",
  "Telemedicine",
  "Transportation",
  "Transportation Network Companies",
];
const locationPattern = /^(.*?)[\/,\-\s]+(.*?)[\/,\-\s]+(.*?)$/;

interface Location {
  country: string;
  state: string;
  city: string;
}

function debounce(fn: Function, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function PitchNameForm() {
  const { toast } = useToast();
  const pathname = usePathname();
  const scoutId = pathname.split("/")[2];
  const pitchId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsLocked();
  const [pitchName, setPitchName] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [demoLink, setDemoLink] = useState<string>("");
  const [locationInput, setLocationInput] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [location, setLocation] = useState<{
    country: string;
    state: string;
    city: string;
  }>({
    country: "",
    state: "",
    city: "",
  });

  useEffect(() => {
    if (isLocked) {
      toast({
        title: "Pitch is Locked",
        description: "This pitch is currently locked and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked, toast]);

  const fetchPitchDetails = async () => {
    try {
      const response = await fetch(
        `/api/endpoints/pitch/founder/details?pitchId=${pitchId}`
      );
      if (response.status !== 200) throw new Error("Failed to fetch pitch");
      const data = await response.json();

      setPitchName(data.pitchName || "");
      setDemoLink(data.demoLink || "");
      setSelectedStage(data.stage || null);
      setSelectedSectors(data.focusSectors || []);

      if (data.location) {
        setLocationInput(data.location);
        const [country, state, city] = data.location.split("/").reverse();
        setLocation({ country, state, city });

        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${city}, ${state}, ${country}`
          )}`
        );
        const geoData = await geoRes.json();
        if (geoData?.[0]) {
          setCoordinates([
            parseFloat(geoData[0].lat),
            parseFloat(geoData[0].lon),
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load pitch details",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPitchDetails();
  }, []);

  const handleLocationInput = (value: string) => {
    if (isLocked) {
      toast({
        title: "Pitch is Locked",
        description: "Cannot modify location while the pitch is locked.",
        variant: "destructive",
      });
      return;
    }
    setLocationInput(value);
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
          const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
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

  const autoSave = useCallback(async () => {
    if (isLocked) return;

    const pitchData = {
      pitchName,
      location: locationInput || null,
      demoLink: demoLink || null,
      stage: selectedStage || null,
      focusSectors: selectedSectors,
      pitchId,
      scoutId,
    };
    console.log("Auto-saving pitch data:", pitchData);

    try {
      const response = await fetch("/api/endpoints/pitch/founder/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pitchData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }
    } catch (err: any) {
      console.error("Auto-save failed:", err.message);
    }
  }, [
    pitchName,
    locationInput,
    demoLink,
    selectedStage,
    selectedSectors,
    pitchId,
    isLocked,
  ]);

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <Card className="w-full border-none bg-[#0e0e0e] mx-auto">
      <CardContent>
        {isLocked && (
          <div className="flex items-center gap-2 text-destructive mb-4">
            <Lock className="h-5 w-5" />
            <p className="text-sm font-medium">This pitch is locked and cannot be modified</p>
          </div>
        )}
        <form className="space-y-6">
          <div className="space-y-2">
            <Label>Pitch Name</Label>
            <Input
              type="text"
              value={pitchName}
              maxLength={100}
              onChange={(e) => !isLocked && setPitchName(e.target.value)}
              onBlur={autoSave}
              placeholder="Enter your pitch name (max 100 characters)"
              className={`rounded w-full ${isLocked ? 'opacity-100' : ''}`}
              disabled={isLocked}
            />
          </div>

          <div className="space-y-4">
            <Label>Pin Your Location</Label>
            <Input
              placeholder="City/State/Country (e.g., San Francisco/California/USA)"
              value={locationInput}
              onChange={(e) => handleLocationInput(e.target.value)}
              onBlur={autoSave}
              className={isLocked ? 'opacity-100' : ''}
              disabled={isLocked}
            />
            <div className="w-full h-[400px] rounded-lg overflow-hidden border">
              <MapComponent coordinates={coordinates} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Demo Link</Label>
              <Input
                type="text"
                value={demoLink}
                onChange={(e) => !isLocked && setDemoLink(e.target.value)}
                onBlur={autoSave}
                placeholder="Enter your demo link"
                disabled={isLocked}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Startup Stage</Label>
              <Combobox
                options={stages}
                value={selectedStage}
                onSelect={(value) => {  
                  if (!isLocked) {
                    setSelectedStage(value);
                    autoSave();
                  }
                }}
                placeholder="Select Stage"
                disabled={isLocked}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Focus Sectors</Label>
            <Combobox
              options={sectors}
              onSelect={(value) => {
                if (isLocked) {
                  toast({
                    title: "Pitch is Locked",
                    description: "Cannot modify sectors while the pitch is locked.",
                    variant: "destructive",
                  });
                  return;
                }
                if (!selectedSectors.includes(value)) {
                  setSelectedSectors([...selectedSectors, value]);
                  autoSave();
                }
              }}
              placeholder="Add sectors"
              disabled={isLocked}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSectors.map((sector, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-xs ${!isLocked ? 'cursor-pointer hover:bg-muted' : 'opacity-100'}`}
                  onClick={() => {
                    if (!isLocked) {
                      setSelectedSectors((prev) =>
                        prev.filter((s) => s !== sector)
                      );
                      autoSave();
                    }
                  }}
                >
                  {sector} {!isLocked && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
