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
  Key,
  Lock,
  FileText,
  Users,
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
    if (activeTab === "feature") {
      fetchFeatureRequests();
    }
    if (activeTab === "support") {
      fetchSupportRequests();
    }
  }, [activeTab]);

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
        id: f.id.toString(),
        featureName: f.featureName,
        userId: f.userId.toString(),
        createdAt: f.createdAt || new Date().toISOString(),
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
        userId: s.userId.toString(),
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
    try {
      const response = await fetch("/api/endpoints/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName,
          description: featureRequest,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feature request");
      }

      const { data: newFeature } = await response.json();

      toast({
        title: "Feature request submitted",
        description: "Thank you for your feedback. We'll review your request shortly.",
      });

      const featureEntry: FeatureEntry = {
        id: newFeature.id.toString(),
        featureName: newFeature.featureName,
        userId: newFeature.userId.toString(),
        createdAt: newFeature.createdAt || new Date().toISOString(),
      };
      setFeatureHistory((prev) => [featureEntry, ...prev]);

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
    try {
      const response = await fetch("/api/endpoints/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supportName,
          description: supportRequest,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit support request");
      }

      const { data: newSupport } = await response.json();

      toast({
        title: "Support request submitted",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

      const supportEntry: SupportEntry = {
        id: newSupport.id.toString(),
        supportName: newSupport.supportName,
        userId: newSupport.userId.toString(),
        createdAt: newSupport.createdAt || new Date().toISOString(),
      };
      setSupportHistory((prev) => [supportEntry, ...prev]);

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
                    className="min-h-[100px] bg-muted/50 resize-none rounded-xl"
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
                      satisfied === true && "bg-blue-500 rounded-[0.35rem]"
                    )}
                    onClick={() => setSatisfied(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      satisfied === false && "bg-red-600 rounded-[0.35rem]"
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
                    className="min-h-[100px] bg-muted/50 resize-none rounded-xl"
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
                    className="min-h-[100px] bg-muted/50 resize-none rounded-xl"
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
          <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
            <ScrollArea className="space-y-6 min-h-[500px]">
              {privacySections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <h4 className="font-medium">{section.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </ScrollArea>
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
    title: "Our Privacy Pledge",
    icon: Key,
    content: `Hey Beta Users,

We totally get that privacy is super important to you, and we want you to know that we’re doing everything we can to keep your data safe. Here’s how we handle your information:

- Your data belongs to you. We won’t sell, share, or rent your data to anyone. It’s yours, and we’ll only use it to make your experience with Daftar OS better.
- We won’t snoop. We don’t look at your data unless it’s necessary to help you or fix a problem. Your ideas and work are yours, and we respect that.
- We only keep your data as long as needed. If you stop using Daftar OS, we’ll keep your data for up to 10 years, just in case you need it later. After that, we’ll delete or anonymize it to make sure it’s completely safe.
- We use your data to improve, but we don’t share anything personal. We might use some data to help us improve features, but it’s always anonymous. Your personal information won’t be shared or exposed.
- We keep it safe. We use strong encryption to protect your data while it’s being sent and stored. Your information is always secure.
- We’re always here if you have questions. If you want to know more about how we handle your data, just ask! We believe in being open with you.
- You’re in control. If you want to update, access, or delete your data, just let us know. We’ll make it happen.

Once our beta phase ends, we’ll have a more structured privacy policy, but for now, we just want to know that your privacy is important to us.

Thanks for being part of Daftar OS`,
  },
  {
    title: "Introduction",
    icon: FileText,
    content: `At Daftar, we take your privacy seriously. As part of our commitment to transparency and security, this Privacy Policy outlines how we collect, process, and protect your data. As we are still in beta, our practices and software are evolving. By using Daftar, you agree to the terms described below.

Daftar is in beta, which means we are continually improving the software to provide the best experience.

We use Google authentication solely to verify your identity and store only the necessary data for user sessions. We do not explore or access any additional details from your Google account. Your privacy and security are our priority, and we are committed to only using the authentication data needed for your login experience.

Additionally, we host our software on Vercel to provide a scalable and secure environment for our users. As part of our ongoing development, user interactions with the software may be logged for analysis and optimization purposes.

However, we ensure that this data is handled by Google's Privacy Policy and Vercel's Privacy Practices, adhering to industry standards for data protection.`,
  },
  {
    title: "Data We Collect",
    icon: Database,
    content: `Authentication Data:
When you sign in to Daftar using Google Sign-In, we only collect essential information necessary for authentication, including your email address and name. We do not store any sensitive data such as passwords. This data is processed in line with Google’s Privacy Policy, and your interactions with Google are governed by their terms.

IP Address & Session Data:
We collect IP address and session data to monitor usage and ensure a secure user experience. This data is stored temporarily and does not contain personal or sensitive details. Our software does not delve deeper into collecting personally identifiable information beyond what's necessary for authentication.

Usage Data:
We also gather data about how you interact with Daftar, such as pages viewed, features used, and timestamps. This information is anonymized and stored for service improvement and performance monitoring.`,
  },
  {
    title: "How We Use Your Data",
    icon: Settings,
    content: `Authentication & Access Control:
We use your Google authentication data solely to manage your login process and maintain session security. This process ensures that you can securely access Daftar without us storing sensitive login information.

Data Logging for Service Improvement:
We collect session data (such as your IP address) for diagnostics, troubleshooting, and performance optimization. This helps us ensure that Daftar functions properly during the beta phase and provides you with a stable experience.`,
  },
  {
    title: "Data Storage & Security",
    icon: Lock,
    content: `As part of our commitment to security, Daftar is hosted on Vercel, which provides a secure cloud infrastructure. Vercel ensures that data is stored in an encrypted environment using industry-standard encryption methods.

Data Encryption:
All data, including your session data, is encrypted in transit using TLS 1.2 or higher, and at rest using AES-256 encryption.

Access Control:
Strict access control policies are in place to ensure that only authorized personnel can access the system. We rely on role-based access control (RBAC) to manage this.

Regular Security Audits:
We conduct regular security audits and apply security patches to ensure that the software remains secure and protected against emerging threats.`,
  },
  {
    title: "Third-Party Services",
    icon: Share2,
    content: `Google:
Your authentication data is processed by Google through OAuth 2.0. Google’s privacy policies govern how your data is handled during authentication. We don’t store or process any further sensitive data through Google beyond what is required for the authentication process.

Vercel:
Daftar is hosted on Vercel, a trusted platform that provides cloud hosting services. While we utilize Vercel for hosting, Vercel's policies govern how your data is stored and processed. We ensure that Vercel follows industry standards for data protection and privacy.

Supabase:
We use Supabase as our backend infrastructure for storing user data and session information. Supabase provides a scalable and secure database and authentication service. Supabase processes your data in accordance with its own privacy policies, and we ensure that Supabase complies with industry-standard data protection measures. Supabase also uses encryption both in transit and at rest to protect your data.`,
  },
  {
    title: "Data Retention",
    icon: Database,
    content: `We retain your data only as long as necessary to provide the services you have requested. If you choose to delete your account, your data will be removed from our systems after a period of 30 days, unless retention is required for audit, compliance, or legal obligations.

During the beta phase, some data may be retained for debugging and platform improvement purposes. This includes session data (such as your IP address) and other non-personally identifiable information.

Logs will be retained for no more than 100 days for debugging and performance analysis.`,
  },
  {
    title: "Your Rights Over Your Data",
    icon: Users,
    content: `As a user, you have all the rights regarding your data. You maintain ownership of your data at all times. Daftar acts as a data processor and processes your data only for the purposes specified in this Privacy Policy.`,
  },
  {
    title: "Cookies & Tracking",
    icon: FileText,
    content: `We may use cookies and session tracking technologies for the purpose of improving your user experience. These technologies help us remember your preferences and enhance software usability.`,
  },
  {
    title: "Security Measures",
    icon: Shield,
    content: `We employ standard data protection practices, including encryption, access controls, and regular security audits to safeguard your data. In the event of a data security breach, we will notify you promptly within 72 working hours by applicable laws. However, we are not liable for any losses or damages arising from such incidents.`,
  },
  {
    title: "Changes to This Policy",
    icon: Pencil,
    content: `Since Daftar is currently in beta, this policy may be updated frequently as we improve the software. Any significant changes to this policy will be communicated to you via email or through the software.`,
  },
  {
    title: "Grievance Redressal",
    icon: MessageSquarePlus,
    content: `If you have any grievances or concerns about your data or this Privacy Policy, please contact us at the support tab in your profile. We will address your concerns within a reasonable time frame, in compliance with Indian data protection laws.

Contact Us: If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us through the support tab in your profile.

Tech Team Daftar OS`,
  },
];