"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { usePitch } from "@/contexts/PitchContext"; // Import the context hook

const stages = ["Idea", "Prototyping To MVP", "Product-Market Fit", "Early Traction", "Growth"];
const sectors = ["AI", "Healthcare", "Blockchain", "Fintech", "E-commerce"];

const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

interface Location {
  country: string;
  state: string;
  city: string;
}

const locationPattern = /^([^/]+)\/([^/]+)\/([^/]+)$/;

export default function PitchNameForm({ pitch, mode }: { pitch?: string; mode: string }) {
  const { toast } = useToast();
  const { setPitchId } = usePitch(); // Use context to set pitchId
  const [pitchName, setPitchName] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [demoLink, setDemoLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPitchId, setGeneratedPitchId] = useState<string | null>(null);

  const [location, setLocation] = useState<Location>({
    country: "",
    state: "",
    city: "",
  });
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    if (mode === "edit" && pitch) {
      fetchPitchDetails();
    }
  }, [pitch, mode]);

  const fetchPitchDetails = async () => {
    try {
      const response = await fetch("/api/endpoints/pitch/founder/details", {
        method: "GET",
        headers: { "Content-Type": "application/json",
          ...(pitch && { "pitch_id": pitch })
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pitch details");
      const data = await response.json();

      setPitchName(data.pitchName || "");
      setLocation({
        country: data.location ? data.location.split("/")[0] : "",
        state: data.location ? data.location.split("/")[1] : "",
        city: data.location ? data.location.split("/")[2] : "",
      });
      setLocationInput(data.location || "");
      setDemoLink(data.demoLink || "");
      setSelectedStage(data.stage || null);
      setSelectedSectors(data.focusSectors || []);

      if (data.location) {
        const query = data.location.split("/").reverse().join(", ");
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const geoData = await geoResponse.json();
        if (geoData && geoData[0]) {
          setCoordinates([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
        }
      }
    } catch (error) {
      console.error("Error fetching pitch details:", error);
      toast({
        title: "Error",
        description: "Failed to load pitch details",
        variant: "destructive",
      });
    }
  };

  const handleLocationInput = async (value: string) => {
    setLocationInput(value);

    const match = value.match(locationPattern);
    if (match) {
      const [_, country, state, city] = match;
      setLocation({
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
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
        console.error("Error fetching coordinates:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const pitchData = {
      pitchName,
      location: locationInput || null,
      demoLink: demoLink || null,
      stage: selectedStage || null,
      focusSectors: selectedSectors,
    };

    try {
      const url =
        mode === "edit" && pitch
          ? `/api/endpoints/pitch/founder/details?pitchId=${pitch}` // Placeholder for edit mode
          : "/api/endpoints/pitch/founder/details";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pitchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save pitch");
      }

      const result = await response.json();
      const newPitchId = result.pitchId;
      setGeneratedPitchId(newPitchId);
      setPitchId(newPitchId); // Set in global context

      toast({
        title: "Success",
        description: `${result.message} (Pitch ID: ${newPitchId})`,
      });

      if (mode === "create") {
        setPitchName("");
        setLocationInput("");
        setDemoLink("");
        setSelectedStage(null);
        setSelectedSectors([]);
        setCoordinates(null);
      }
    } catch (error: any) {
      console.error("Error submitting pitch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save pitch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-none bg-[#0e0e0e] mx-auto">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Pitch Name</Label>
            <Input
              type="text"
              placeholder="Enter your pitch name (max 100 characters)"
              value={pitchName}
              maxLength={100}
              onChange={(e) => setPitchName(e.target.value)}
              className="rounded w-full"
            />
          </div>

          <div className="space-y-4">
            <Label>Pin Your Location</Label>
            <Input
              placeholder="Country/State/City or Place your URL"
              value={locationInput}
              onChange={(e) => handleLocationInput(e.target.value)}
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
                placeholder="Enter your demo link"
                value={demoLink}
                onChange={(e) => setDemoLink(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Startup Stage</Label>
              <Combobox
                options={stages}
                value={selectedStage}
                onSelect={(value) => setSelectedStage(value)}
                placeholder="Select Stage"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Focus Sectors</Label>
            <Combobox
              options={sectors}
              onSelect={(value) => {
                if (!selectedSectors.includes(value)) {
                  setSelectedSectors([...selectedSectors, value]);
                }
              }}
              placeholder="Add sectors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSectors.map((sector) => (
                <Badge
                  key={sector}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedSectors((prev) => prev.filter((s) => s !== sector))}
                >
                  {sector} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {generatedPitchId && mode === "create" && (
            <p className="text-sm text-muted-foreground">
              Generated Pitch ID: {generatedPitchId}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || !pitchName.trim()}
            className="w-full"
          >
            {isLoading ? "Saving..." : mode === "edit" ? "Update Pitch" : "Create Pitch"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}