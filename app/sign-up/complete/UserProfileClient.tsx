"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserProfileProps {
  initialData: {
    name: string | null;
    lastName: string | null;
    gender: string | null;
    number: string | null;
    dob: string | null;
    location: string | null;
    role: string | null; // Added role field
  };
  userMail: string;
}

export default function UserProfileClient({
  initialData,
  userMail,
}: UserProfileProps) {
  const [formData, setFormData] = useState(initialData);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const res = await fetch(`/api/endpoints/users/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData, email: userMail }),
    });

    if (res.ok) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile.");
    }
  }

  return (
    <div className="p-8 rounded-xl w-full  text-white px-40 border ">
      <h2 className="text-3xl font-bold mb-6 text-center">Edit Profile</h2>

      <div className="space-y-5 grid grid-cols-2 gap-4">
        {/* Input Fields */}
        {[
          { field: "name", label: "First Name" },
          { field: "lastName", label: "Last Name" },
          { field: "gender", label: "Gender" },
          { field: "number", label: "Phone Number" },
          { field: "dob", label: "Date of Birth" },
          { field: "location", label: "Location" },
        ].map(({ field, label }: { field: string; label: string }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-300">
              {label}
            </label>
            <Input
              type={field === "dob" ? "date" : "text"}
              value={formData[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className="mt-2 w-full bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 px-3 py-2 rounded-md"
            />
          </div>
        ))}

        {/* Role Selection Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Role
          </label>
          <div className="flex gap-4">
            <Button
              onClick={() => handleChange("role", "founder")}
              className={`w-full py-2 text-lg rounded-md transition ${
                formData.role === "founder"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Founder
            </Button>
            <Button
              onClick={() => handleChange("role", "investor")}
              className={`w-full py-2 text-lg rounded-md transition ${
                formData.role === "investor"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Investor
            </Button>
          </div>
        </div>

        {/* Save Changes Button */}
        <Button
          onClick={handleSubmit}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-lg font-semibold mt-4"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
