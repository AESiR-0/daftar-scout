'use client'
import Image from 'next/image';
import Earth from '@/public/static/landing/earth.png'
import indianStreetMan from '@/public/static/landing/indian street.png'
import steveJobs from '@/public/static/landing/steve jobs placeholder 2.png'
import { HeroSection } from '@/components/home/hero-section'
import { FeatureCard } from '@/components/home/feature-card'
import steveplace from '@/public/static/landing/steve jobs placeholder.png'
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [activeCard, setActiveCard] = useState<'founder' | 'investor' | null>(null);
  const isNull = activeCard === null;

  const items = activeCard === 'founder'
    ? {
      video: steveplace.src,
      title: "Democratizing Startup Pitching",
      description: "We're building a new startup economy, where founders can pitch their ideas to 150 investors, in the language they speak."
    }
    : activeCard === 'investor'
      ? {
        video: steveplace.src,
        title: "Building a New Startup Economy",
        description: "Discover and invest in promising startups globally, with data-driven insights and localized pitches from diverse founders."
      }
      : {
        video: steveplace.src,
        title: "Sarvodaya",
        description: "Simplifying Startup Scouting and Investment Pitching"
      };

  return (
    <div className="min-h-screen bg-[#030712] overflow-hidden relative text-zinc-100">
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />

      {/* Grid Pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Main Content Container */}
      <div className="relative z-10">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Feature Cards */}
            <div className="space-y-8">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-zinc-500 to-transparent opacity-20" />

                <FeatureCard
                  image={indianStreetMan.src}
                  imageAlt="Founder working on laptop"
                  title="Democratizing Startup Pitching"
                  description="Pitch your startup idea to 150 investors, in the language you speak."
                  buttonText="Daftar for Founders"
                  isActive={activeCard === 'founder'}
                  onClick={() => setActiveCard(activeCard === 'founder' ? null : 'founder')}
                />
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-zinc-500 to-transparent opacity-20" />

                <FeatureCard
                  image={steveJobs.src}
                  imageAlt="Investor analyzing data"
                  title="Scout the next unicorn"
                  description="Scout, understand, and build startups with founders across the world."
                  buttonText="Daftar for Investors"
                  isActive={activeCard === 'investor'}
                  onClick={() => setActiveCard(activeCard === 'investor' ? null : 'investor')}
                />
              </div>
            </div>

            {/* Right Column - Featured Content */}
            <div className="relative">
              {/* Decorative corner elements */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-zinc-500 opacity-20" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-zinc-500 opacity-20" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-zinc-500 opacity-20" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-zinc-500 opacity-20" />

              <div className="rounded-2xl overflow-hidden backdrop-blur-sm bg-white/[0.02] border border-zinc-800/50 p-8">
                <div className="aspect-video relative overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-zinc-900/50" />
                  <Image
                    src={items.video}
                    alt="featured content"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="mt-8 space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                    {items.title}
                  </h1>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    {items.description}
                  </p>
                </div>

                {!isNull && (
                  <div className="mt-8 flex gap-4">
                    <Link
                      href={`${activeCard}/pricing`}
                      className="group px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all duration-300 relative overflow-hidden"
                    >
                      <span className="relative z-10">View Pricing</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                    <Link
                      href={`/login/${activeCard}`}
                      className="group px-6 py-3 rounded-lg relative overflow-hidden"
                    >
                      <span className="relative z-10 text-zinc-900 group-hover:text-white transition-colors duration-300">
                        Try Daftor for free
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 to-zinc-300 group-hover:from-zinc-300 group-hover:to-zinc-100 transition-colors duration-300" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Earth Background */}
        

        {/* Footer */}
        <div className="relative z-10 py-6 text-center text-zinc-500 backdrop-blur-sm bg-gradient-to-t from-black/40 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm">            Design and Build by Daftar Operating System Technology Version Beta 1.1            </p>
          </div>
        </div>
      </div>
    </div>
  );
}