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
import { useSession } from "next-auth/react";
import { desc } from "drizzle-orm";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
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
  createdAt: string;
}

interface SupportEntry {
  id: string;
  supportName: string;
  userId: string;
  createdAt: string;
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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [featureRequest, setFeatureRequest] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [featureHistory, setFeatureHistory] = useState<FeatureEntry[]>([]);
  const [supportRequest, setSupportRequest] = useState("");
  const [supportName, setSupportName] = useState("");
  const [supportHistory, setSupportHistory] = useState<SupportEntry[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [satisfied, setSatisfied] = useState<boolean | undefined>();
  const [feedbackText, setFeedbackText] = useState("");
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "account", label: "My Account" },
    { id: "support", label: "Support" },
    { id: "feedback", label: "Feedback" },
    { id: "feature", label: "Feature Request" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "delete", label: "Delete Account" },
    { id: "logout", label: "Logout" },
  ];

  // Fetch profile data when dialog opens
  useEffect(() => {
    if (open && session?.user?.email) {
      fetchProfileData();
    }
  }, [open, session]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      const data = await response.json();
      setProfileData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        gender: data.gender || "",
        dateOfBirth: data.dateOfBirth || null,
        languages: data.languages || [],
        joinedDate: data.joinedDate || new Date().toDateString(),
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData || !session?.user?.id) {
      toast({
        title: "Error",
        description: "Unable to save profile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          gender: profileData.gender,
          dateOfBirth: profileData.dateOfBirth,
          languages: profileData.languages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "feature" && session?.user?.id) {
      fetchFeatureRequests();
    }
    if (activeTab === "support" && session?.user?.id) {
      fetchSupportRequests();
    }
  }, [activeTab, session]);

  const fetchFeatureRequests = async () => {
    setIsLoadingFeatures(true);
    try {
      const response = await fetch("/api/endpoints/feature-request", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch feature requests");
      const data = await response.json();

      const mappedFeatures: FeatureEntry[] = data.map((f: any) => ({
        featureName: f.featureName,
        featureRequest: f.description,
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

  const fetchSupportRequests = async () => {
    setIsLoadingSupport(true);
    try {
      const response = await fetch("/api/endpoints/support", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch support requests");
      const data = await response.json();

      const mappedSupport: SupportEntry[] = data.map((s: any) => ({
        id: s.id.toString(),
        supportName: s.supportName,
        userId: s.userId,
        createdAt: s.createdAt || new Date().toISOString(),
      }));

      setSupportHistory(mappedSupport);
    } catch (error) {
      console.error("Error fetching support:", error);
      toast({
        title: "Error",
        description: "Failed to load support requests",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSupport(false);
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
      const response = await fetch("/api/endpoints/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName: featureName,
          description: featureRequest,
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

      const newFeature: FeatureEntry = {
        id: Date.now().toString(),
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

  const handleSubmitSupport = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a support request",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/endpoints/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supportName: `${supportName}: ${supportRequest}`,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit support request");
      }

      toast({
        title: "Support request submitted",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

      const newSupport: SupportEntry = {
        id: Date.now().toString(),
        supportName: `${supportName}: ${supportRequest}`,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
      };
      setSupportHistory((prev) => [newSupport, ...prev]);

      setSupportName("");
      setSupportRequest("");
    } catch (error: any) {
      console.error("Error submitting support:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit support request",
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
        if (isLoading) {
          return (
            <Card className="border-none rounded-[0.35rem] h-[500px] bg-[#1a1a1a] p-4">
              <p className="text-muted-foreground">Loading profile...</p>
            </Card>
          );
        }
        if (!profileData) {
          return (
            <Card className="border-none rounded-[0.35rem] h-[500px] bg-[#1a1a1a] p-4">
              <p className="text-muted-foreground">Unable to load profile</p>
            </Card>
          );
        }
        return (
          <Card className="border-none rounded-[0.35rem] h-[500px] overflow-y-auto bg-[#1a1a1a]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>
                      {profileData.firstName[0]}
                      {profileData.lastName[0]}
                    </AvatarFallback>
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
                  disabled={isLoading}
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
                          setProfileData((prev) =>
                            prev ? { ...prev, firstName: e.target.value } : prev
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) =>
                            prev ? { ...prev, lastName: e.target.value } : prev
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) =>
                            prev ? { ...prev, phone: e.target.value } : prev
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={profileData.gender}
                        onValueChange={(value) =>
                          setProfileData((prev) =>
                            prev ? { ...prev, gender: value } : prev
                          )
                        }
                        disabled={isLoading}
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
                            disabled={isLoading}
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
                            selected={
                              profileData.dateOfBirth
                                ? new Date(profileData.dateOfBirth)
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setProfileData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        dateOfBirth: date.toISOString().split("T")[0],
                                      }
                                    : prev
                                );
                              }
                            }}
                            initialFocus
                            disabled={isLoading}
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
                                setProfileData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        languages: [...prev.languages, value],
                                      }
                                    : prev
                                );
                              }
                            }}
                            disabled={isLoading}
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
                          <Badge
                            key={lang}
                            className="bg-muted rounded-[0.35rem]"
                          >
                            {lang}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() =>
                                setProfileData((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        languages: prev.languages.filter(
                                          (l) => l !== lang
                                        ),
                                      }
                                    : prev
                                )
                              }
                              disabled={isLoading}
                            >
                              <X className="h-3 w-3 rounded-[0.35rem]" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    className="w-full rounded-[0.35rem]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
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
                    {profileData.gender || "Not specified"}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date of Birth:</span>{" "}
                    {profileData.dateOfBirth
                      ? new Date(profileData.dateOfBirth).toLocaleDateString()
                      : "Not specified"}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">
                      Preferred Languages:
                    </span>{" "}
                    {profileData.languages.length > 0
                      ? profileData.languages.join(", ")
                      : "None"}
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
          <div className="space-y-4">
            <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Support request title"
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe your issue or question"
                    value={supportRequest}
                    onChange={(e) => setSupportRequest(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSubmitSupport}
                  className="rounded-[0.35rem] bg-blue-500"
                  disabled={!supportRequest.trim() || !supportName.trim()}
                >
                  Submit
                </Button>
              </div>
            </Card>
            <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
              <h4 className="text-[14px] font-medium mb-4">History</h4>
              {isLoadingSupport ? (
                <p className="text-muted-foreground">Loading support requests...</p>
              ) : supportHistory.length === 0 ? (
                <p className="text-muted-foreground">No support requests yet</p>
              ) : (
                <div className="space-y-4">
                  {supportHistory.map((support) => (
                    <div
                      key={support.id}
                      className="py-3 rounded-[0.35rem] space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium">
                          {support.supportName}
                        </h5>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(support.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
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
                    className={cn(
                      satisfied === true && "bg-muted rounded-[0.35rem]"
                    )}
                    onClick={() => setSatisfied(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      satisfied === false && "bg-muted rounded-[0.35rem]"
                    )}
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
                  className="rounded-[0.35rem] bg-blue-500"
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
            <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
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
                  className="rounded-[0.35rem] bg-blue-500"
                  disabled={!featureRequest.trim() || !featureName.trim()}
                >
                  Submit
                </Button>
              </div>
            </Card>
            <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
              <h4 className="text-[14px] font-medium mb-4">History</h4>
              {isLoadingFeatures ? (
                <p className="text-muted-foreground">Loading feature requests...</p>
              ) : featureHistory.length === 0 ? (
                <p className="text-muted-foreground">No feature requests yet</p>
              ) : (
                <div className="space-y-4">
                  {featureHistory.map((feature) => (
                    <div
                      key={feature.id}
                      className="py-3 rounded-[0.35rem] space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium">
                          {feature.featureName}
                        </h5>
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
                  <p className="text-sm text-muted-foreground">
                    {section.content}
                  </p>
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
                We're sad to say goodbye. This action can't be undone, and all
                your data will be permanently lost.
              </p>
              <Button
                variant="destructive"
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
                variant="destructive"
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