"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AgeRange } from "./components/age-range";
import { Combobox } from "./components/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

const communitiesData = [
  { label: "Auto - rickshaw drivers", value: "auto-rickshaw" },
  { label: "Black Lives Matter activists", value: "black-lives" },
  { label: "Coastal cleanup crews", value: "coastal" },
  { label: "Criminals seeking to change their lives positively", value: "criminals" },
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
  { value: "trans", label: "Trans Only" },
  { value: "at-least-one", label: "At Least One" },
  { value: "at-least-one-male", label: "At least one Male" },
  { value: "at-least-one-female", label: "At least one Female" },
  { value: "at-least-one-transgender", label: "At least one Transgender" },
  { value: "open-for-all", label: "Open For All" },
];

// Add location pattern
const locationPattern = /^([^/]+)\/([^/]+)\/([^/]+)$/;

interface Location {
  country: string;
  state: string;
  city: string;
}

export default function AudiencePage() {
  const [locationInput, setLocationInput] = useState("");
  const [location, setLocation] = useState<Location>({
    country: "",
    state: "",
    city: ""
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>(["auto-rickshaw"]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const handleLocationInput = async (value: string) => {
    setLocationInput(value);
    
    // Parse location when input matches pattern (Country/State/City)
    const match = value.match(locationPattern);
    if (match) {
      const [_, country, state, city] = match;
      setLocation({
        country: country.trim(),
        state: state.trim(),
        city: city.trim()
      });

      try {
        const query = `${city}, ${state}, ${country}`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        if (data && data[0]) {
          setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    }
  };

  return (
    <div className="container px-10 mx-auto py-6">
      <div className="space-y-6">
        {/* Location Input */}
        <div className="space-y-4">
          <Label>Pin Location</Label>
          <Input
            placeholder="Country/State/City"
            value={locationInput}
            onChange={(e) => handleLocationInput(e.target.value)}
          />

          {/* Map */}
          <div className="w-full h-[400px] rounded-lg overflow-hidden border">
            <MapComponent coordinates={coordinates} />
          </div>
        </div>

        {/* Other inputs */}
        <div className="space-y-4">
          <Combobox
            label="Community"
            value={communitiesData.find(c => c.value === selectedCommunities[0])?.label || "Select Community"}
            options={communitiesData}
            selected={selectedCommunities}
            onChange={(value: string) => setSelectedCommunities(prev => [...prev, value])}
          />

          {/* Age and Gender row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <AgeRange
                minAge={ageRange[0].toString()}
                maxAge={ageRange[1].toString()}
                onMinChange={(value) => setAgeRange([Number(value), ageRange[1]])}
                onMaxChange={(value) => setAgeRange([ageRange[0], Number(value)])}
              />
            </div>
            <div className="flex-1">
              <Combobox
                label="Gender"
                value="Add"
                options={genders}
                selected={selectedGenders}
                onChange={(value: string) => setSelectedGenders(prev => [...prev, value])}
              />
            </div>
          </div>

          <Combobox
            label="Stage"
            value="Add"
            options={stages}
            selected={selectedStages}
            onChange={(value: string) => setSelectedStages(prev => [...prev, value])}
          />

          <Combobox
            label="Sector"
            value="Add"
            options={sectors}
            selected={selectedSectors}
            onChange={(value: string) => setSelectedSectors(prev => [...prev, value])}
          />
        </div>
      </div>
    </div>
  );
}
