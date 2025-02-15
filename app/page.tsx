import Image from "next/image";
import Earth from "@/public/static/landing/earth.png";
import indianStreetMan from "@/public/static/landing/indian street.png";
import steveJobs from "@/public/static/landing/steve jobs placeholder 2.png";
import { HeroSection } from "@/components/home/hero-section";
import { FeatureCard } from "@/components/home/feature-card";
import steveplace from "@/public/static/landing/steve jobs placeholder.png";
import Link from "next/link";

export default function HomePage() {

  return (
    <div className="max-h-[90vh] py-10 h-screen">
      <div className="flex justify-center items-center">
        <h1 className="text-4xl "><span className="text-blue-500">Daftar {" "}</span><span className="text-white">Operating System</span></h1>
      </div>
    </div>
  )
}
