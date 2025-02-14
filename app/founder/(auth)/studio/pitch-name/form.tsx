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

const stages = ["Idea", "Prototyping To MVP", "Product-Market Fit", "Early Traction", "Growth"];
const sectors = ["AI", "Healthcare", "Blockchain", "Fintech", "E-commerce"]; // Shortened list for brevity

export default function PitchNameForm({ pitch, mode }: { pitch: string; mode: string }) {
    const [pitchName, setPitchName] = useState(pitch);
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Location State
    const [countries, setCountries] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [states, setStates] = useState<string[]>([]);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);

    useEffect(() => {
        fetchCountries();
    }, []);

    // Fetch Countries
    const fetchCountries = async () => {
        try {
            const response = await fetch("https://restcountries.com/v3.1/all");
            const data = await response.json();
            const countryList = data.map((country: any) => country.name.common).sort();
            setCountries(countryList);
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    // Fetch States when a country is selected
    const fetchStates = async (country: string) => {
        try {
            const response = await fetch(`https://countriesnow.space/api/v0.1/countries/states`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country }),
            });
            const data = await response.json();
            const stateList = data.data.states.map((state: any) => state.name).sort();
            setStates(stateList);
        } catch (error) {
            console.error("Error fetching states:", error);
        }
    };

    // Fetch Cities when a state is selected
    const fetchCities = async (state: string) => {
        try {
            const response = await fetch(`https://countriesnow.space/api/v0.1/countries/state/cities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: selectedCountry, state }),
            });
            const data = await response.json();
            setCities(data.data.sort());
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("Submitted:", { pitchName, selectedCountry, selectedState, selectedCity, selectedSectors, selectedStage });
        setTimeout(() => setIsLoading(false), 2000); // Simulate save delay
    };

    return (
        <Card className="w-full border-none  bg-[#0e0e0e] mx-auto">
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-10 justify-between">
                        <div className="w-1/2 space-y-2">
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

                        <div className="w-1/2 space-y-2">
                            <Label>Pitching From</Label>
                            <Combobox
                                options={countries}
                                value={selectedCountry}
                                onSelect={(value) => {
                                    setSelectedCountry(value);
                                    fetchStates(value);
                                    setSelectedState(null);
                                    setCities([]);
                                }}
                                placeholder="Select Pitch Location"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Demo Link</Label>
                        <Input type="text" placeholder="Enter your demo link" />
                    </div>
                    <div>
                        <Label>Startup Stage</Label>
                        <Combobox
                            options={stages}
                            value={selectedStage}
                            onSelect={(value) => setSelectedStage(value)}
                            placeholder="Select Stage"
                        />
                    </div>
                    <div>
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
