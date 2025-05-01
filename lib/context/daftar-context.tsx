"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Daftar {
  id: string;
  name: string;
  description: string;
  profileUrl: string;
}

interface DaftarContextType {
  selectedDaftar: string;
  setSelectedDaftar: (id: string) => void;
  daftars: Daftar[];
  currentDaftarData: Daftar | null;
  isLoading: boolean;
}

const DaftarContext = createContext<DaftarContextType | undefined>(undefined);

export function DaftarProvider({ children }: { children: ReactNode }) {
  const [daftars, setDaftars] = useState<Daftar[]>([]);
  const [selectedDaftar, setSelectedDaftar] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const fetchDaftars = async () => {
    try {
      const res = await fetch("/api/endpoints/daftar");
      const data = await res.json();
      setDaftars(data);
      if (data.length === 0) {
        setShowDialog(true);
      } else {
        const cookieId =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("selectedDaftarId="))
            ?.split("=")[1] ?? "";
        const defaultId = cookieId ? cookieId : data[0].id;
        setSelectedDaftar(defaultId);
        document.cookie = `selectedDaftarId=${defaultId}; path=/`;
      }
    } catch (error) {
      console.error("Failed to fetch daftars", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDaftars();
  }, []);

  const currentDaftarData =
    daftars.find((d) => d.id === selectedDaftar) || null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0e0e0e]">
        <div className="max-w-3xl w-full space-y-8">
          <Skeleton className="h-8 w-48 bg-[#2a2a2a] rounded-[0.35rem]" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full bg-[#2a2a2a] rounded-[0.35rem]" />
            <Skeleton className="h-16 w-full bg-[#2a2a2a] rounded-[0.35rem]" />
            <Skeleton className="h-16 w-full bg-[#2a2a2a] rounded-[0.35rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (showDialog) {
    return (
      <CreateDaftarDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={async (newDaftarId: string) => {
          setShowDialog(false);
          await fetchDaftars();
          setSelectedDaftar(newDaftarId);
          document.cookie = `selectedDaftarId=${newDaftarId}; path=/`;
        }}
      />
    );
  }

  return (
    <DaftarContext.Provider
      value={{
        selectedDaftar,
        setSelectedDaftar,
        daftars,
        currentDaftarData,
        isLoading: false,
      }}
    >
      {children}
    </DaftarContext.Provider>
  );
}

export function useDaftar() {
  const context = useContext(DaftarContext);
  if (!context)
    throw new Error("useDaftar must be used within a DaftarProvider");
  return context;
}