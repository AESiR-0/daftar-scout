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

const stages = ["Idea", "Prototyping To MVP", "Product-Market Fit", "Early Traction", "Growth"];
const sectors = ["AI", "Healthcare", "Blockchain", "Fintech", "E-commerce"]; // Shortened list for brevity

// Dynamically import map component to avoid SSR issues
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

export default function PitchNameForm({ pitch, mode }: { pitch: string; mode: string }) {
    const [pitchName, setPitchName] = useState(pitch);
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Location State
    const [location, setLocation] = useState<Location>({
        country: "",
        state: "",
        city: ""
    });
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

    // useEffect(() => {
    //     fetchCountries();
    // }, []);

    // Fetch Countries
    // const fetchCountries = async () => {
    //     try {
    //         const response = await fetch("https://restcountries.com/v3.1/all");
    //         const data = await response.json();
    //         const countryList = data.map((country: any) => country.name.common).sort();
    //         setCountries(countryList);
    //     } catch (error) {
    //         console.error("Error fetching countries:", error);
    //     }
    // };

    // Fetch States when a country is selected
    // const fetchStates = async (country: string) => {
    //     try {
    //         const response = await fetch(`https://countriesnow.space/api/v0.1/countries/states`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ country }),
    //         });
    //         const data = await response.json();
    //         const stateList = data.data.states.map((state: any) => state.name).sort();
    //         setStates(stateList);
    //     } catch (error) {
    //         console.error("Error fetching states:", error);
    //     }
    // };

    // Fetch Cities when a state is selected
    // const fetchCities = async (state: string) => {
    //     try {
    //         const response = await fetch(`https://countriesnow.space/api/v0.1/countries/state/cities`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ country: selectedCountry, state }),
    //         });
    //         const data = await response.json();
    //         setCities(data.data.sort());
    //     } catch (error) {
    //         console.error("Error fetching cities:", error);
    //     }
    // };

    // const handleLocationChange = async (field: keyof Location, value: string) => {
    //     setLocation(prev => ({
    //         ...prev,
    //         [field]: value
    //     }));

    //     // Only search for coordinates when all fields are filled
    //     if (field === 'city' && location.country && location.state) {
    //         try {
    //             const query = `${value}, ${location.state}, ${location.country}`;
    //             const response = await fetch(
    //                 `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    //             );
    //             const data = await response.json();
                
    //             if (data && data[0]) {
    //                 setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching coordinates:', error);
    //         }
    //     }
    // };

    const handleLocationChange = async (field: keyof Location, value: string) => {
        setLocation(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("Submitted:", { pitchName, location, selectedSectors, selectedStage });
        setTimeout(() => setIsLoading(false), 2000); // Simulate save delay
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

                    {/* Location Inputs */}
                    <div className="space-y-4">
                        <Label>Pitching From</Label>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter country"
                                value={location.country}
                                onChange={(e) => handleLocationChange('country', e.target.value)}
                            />
                            <Input
                                placeholder="Enter state"
                                value={location.state}
                                onChange={(e) => handleLocationChange('state', e.target.value)}
                            />
                            <Input
                                placeholder="Enter city"
                                value={location.city}
                                onChange={(e) => handleLocationChange('city', e.target.value)}
                            />
                        </div>

                        {/* Map */}
                        <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                            <MapComponent coordinates={coordinates} />
                        </div>
                    </div>

                    {/* Demo Link and Startup Stage in same line */}
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label>Demo Link</Label>
                            <Input type="text" placeholder="Enter your demo link" />
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
                </form>
            </CardContent>
        </Card>
    );
}
