"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  Trash2,
  UserCircle,
  MessageSquarePlus,
  Shield,
  LogOut,
  Share2,
  Settings,
  Database,
  Pencil,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/format-date";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react"; // For userId

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  languages: string[];
  joinedDate: string;
}

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeatureEntry {
  id: string;
  featureName: string;
  userId: string;
  createdAt: string; // Assuming the table has a created_at field
}

type ProfileTab =
  | "account"
  | "support"
  | "feedback"
  | "feature"
  | "privacy"
  | "delete"
  | "logout";

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { toast } = useToast();
  const { data: session } = useSession(); // Get user session for userId
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [isEditing, setIsEditing] = useState(false);
  const [featureRequest, setFeatureRequest] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [featureHistory, setFeatureHistory] = useState<FeatureEntry[]>([]);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    gender: "Male",
    dateOfBirth: "1990-01-01",
    languages: ["English", "Hindi"],
    joinedDate: "Feb 14, 2024",
  });
  const [satisfied, setSatisfied] = useState<boolean | undefined>();
  const [feedbackText, setFeedbackText] = useState("");
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "account", label: "My Account" },
    { id: "support", label: "Support" },
    { id: "feedback", label: "Feedback" },
    { id: "feature", label: "Feature Request" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "delete", label: "Delete Account" },
    { id: "logout", label: "Logout" },
  ];

  useEffect(() => {
    if (activeTab === "feature" && session?.user?.id) {
      fetchFeatureRequests();
    }
  }, [activeTab, session]);

  const fetchFeatureRequests = async () => {
    setIsLoadingFeatures(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/features", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch feature requests");
      const data = await response.json();

      // Map API data to FeatureEntry interface
      const mappedFeatures: FeatureEntry[] = data.map((f: any) => ({
        id: f.id.toString(),
        featureName: f.featureName,
        userId: f.userId,
        createdAt: f.createdAt || new Date().toISOString(), // Assuming created_at exists
      }));

      setFeatureHistory(mappedFeatures);
    } catch (error) {
      console.error("Error fetching features:", error);
      toast({
        title: "Error",
        description: "Failed to load feature requests",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const handleLogout = () => {
    signOut();
    onOpenChange(false);
  };

  const handleSubmitFeature = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a feature request",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/endpoints/pitch/founder/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName: `${featureName}: ${featureRequest}`,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feature request");
      }

      toast({
        title: "Feature request submitted",
        description: "Thank you for your feedback. We'll review your request shortly.",
      });

      // Add to local history optimistically
      const newFeature: FeatureEntry = {
        id: Date.now().toString(), // Temporary ID until server provides one
        featureName: `${featureName}: ${featureRequest}`,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
      };
      setFeatureHistory((prev) => [newFeature, ...prev]);

      setFeatureName("");
      setFeatureRequest("");
    } catch (error: any) {
      console.error("Error submitting feature:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit feature request",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive",
    });
    onOpenChange(false);
  };

  const handleFeedbackSubmit = () => {
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
    });
    setSatisfied(undefined);
    setFeedbackText("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <Card className="border-none rounded-[0.35rem] h-[500px] overflow-y-auto bg-[#1a1a1a]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{`${profileData.firstName} ${profileData.lastName}`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {profileData.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-[0.35rem]"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={profileData.gender}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal rounded-[0.35rem] bg-[#1a1a1a]",
                              !profileData.dateOfBirth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {profileData.dateOfBirth ? (
                              formatDate(new Date(profileData.dateOfBirth))
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(profileData.dateOfBirth)}
                            onSelect={(date) => {
                              if (date) {
                                setProfileData((prev) => ({
                                  ...prev,
                                  dateOfBirth: date.toISOString().split("T")[0],
                                }));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Preferred Languages (up to 3)</Label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages.length < 3 && (
                          <Select
                            onValueChange={(value) => {
                              if (!profileData.languages.includes(value)) {
                                setProfileData((prev) => ({
                                  ...prev,
                                  languages: [...prev.languages, value],
                                }));
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Add language" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "English",
                                "Hindi",
                                "Spanish",
                                "French",
                                "German",
                              ]
                                .filter((lang) => !profileData.languages.includes(lang))
                                .map((lang) => (
                                  <SelectItem key={lang} value={lang}>
                                    {lang}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                        {profileData.languages.map((lang) => (
                          <Badge key={lang} className="bg-muted rounded-[0.35rem]">
                            {lang}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  languages: prev.languages.filter((l) => l !== lang),
                                }))
                              }
                            >
                              <X className="h-3 w-3 rounded-[0.35rem]" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="w-full rounded-[0.35rem]"
                  >
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {profileData.email}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {profileData.phone}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Gender:</span>{" "}
                    {profileData.gender}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date of Birth:</span>{" "}
                    {new Date(profileData.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Preferred Languages:</span>{" "}
                    {profileData.languages.join(", ")}
                  </p>
                  <div className="text-xs pt-4">
                    <span className="text-muted-foreground">
                      On Daftar Since <br /> {profileData.joinedDate}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );

      case "support":
        return (
          <Card className="border-none rounded-[0.35rem] h-[500px] overflow-y-auto bg-[#1a1a1a] p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're in the process of setting up our ticket system, but for now, feel free to reach out to us at{" "}
                <a
                  href="mailto:support@daftaros.com"
                  className="text-blue-500 hover:text-blue-400 underline"
                >
                  support@daftaros.com
                </a>
                . Our tech team will get back to you as soon as possible.
              </p>
            </div>
          </Card>
        );

      case "feedback":
        return (
          <div className="space-y-4">
            <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
              <div className="space-y-4">
                <p className="text-sm">Are you happy with us?</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(satisfied === true && "bg-muted rounded-[0.35rem]")}
                    onClick={() => setSatisfied(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(satisfied === false && "bg-muted rounded-[0.35rem]")}
                    onClick={() => setSatisfied(false)}
                  >
                    No
                  </Button>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="How can we make your experience better?"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>
                <Button
                  disabled={satisfied === undefined || !feedbackText.trim()}
                  className="rounded-[0.35rem]"
                  onClick={handleFeedbackSubmit}
                >
                  Submit
                </Button>
              </div>
            </Card>
          </div>
        );

      case "feature":
        return (
          <div className="space-y-4">
            {/* Input Card */}
            <Card className="border-noneKILL rounded-[0.35rem] bg-[#1a1a1a] p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Feature name"
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="What should we build next, and how will it help your journey?"
                    value={featureRequest}
                    onChange={(e) => setFeatureRequest(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSubmitFeature}
                  className="rounded-[0.35rem]"
                  disabled={!featureRequest.trim() || !featureName.trim()}
                >
                  Submit
                </Button>
              </div>
            </Card>

            {/* History Card */}
            <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
              <h4 className="text-[14px] font-medium mb-4">History</h4>
              {isLoadingFeatures ? (
                <p className="text-muted-foreground">Loading feature requests...</p>
              ) : featureHistory.length === 0 ? (
                <p className="text-muted-foreground">No feature requests yet</p>
              ) : (
                <div className="space-y-4">
                  {featureHistory.map((feature) => (
                    <div key={feature.id} className="py-3 rounded-[0.35rem] space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium">{feature.featureName}</h5>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(feature.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );

      case "privacy":
        return (
          <Card className="border-none rounded-[0.35rem] h-[500px] overflow-y-auto bg-[#1a1a1a] p-4">
            <div className="space-y-6">
              {privacySections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <h4 className="font-medium">{section.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                </div>
              ))}
            </div>
          </Card>
        );

      case "delete":
        return (
          <Card className="border-none rounded-[0.35rem] h-[500px] overflow-y-auto bg-[#1a1a1a] p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're sad to say goodbye. This action can't be undone, and all your data will be permanently lost.
              </p>
              <Button
                variant="outline"
                className="rounded-[0.35rem]"
                onClick={handleDeleteAccount}
              >
                Delete
              </Button>
            </div>
          </Card>
        );

      case "logout":
        return (
          <Card className="border-none rounded-[0.35rem] h-[500px] overflow-y-auto bg-[#1a1a1a] p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to logout?
              </p>
              <Button
                variant="outline"
                className="rounded-[0.35rem]"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </Card>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex gap-0">
        <div className="w-[200px] border-r bg-[#0e0e0e]">
          <div className="flex flex-col space-y-1 p-4">
            <DialogHeader className="mb-4">
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-muted/50",
                  activeTab === tab.id ? "bg-muted" : "transparent"
                )}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 bg-[#0e0e0e] pt-10">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">{renderContent()}</div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const privacySections = [
  {
    title: "Data Collection",
    icon: Database,
    content:
      "We collect information that you provide directly to us, including your name, email address, and any other information you choose to provide.",
  },
  {
    title: "Use of Information",
    icon: Settings,
    content:
      "We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect our platform.",
  },
  {
    title: "Data Sharing",
    icon: Share2,
    content:
      "We do not share your personal information with third parties except as described in this policy.",
  },
  {
    title: "Security",
    icon: Shield,
    content:
      "We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.",
  },
];