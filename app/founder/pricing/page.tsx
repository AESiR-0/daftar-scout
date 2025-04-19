"use client";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-4xl">
        <div className="bg-muted/50 p-8 rounded-xl border shadow-md text-left max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground">
            Hey Founder,
            <br />
            <br />
            We really appreciate you being part of the beta. You've got full
            access to Daftar right now, completely free, and we're grateful for
            your time and the feedback you've shared with us.
            <br />
            <br />
            If we ever move to a paid version, we'll make sure you have at least
            15 days' notice. We want to give you enough time to think about how
            it fits into your plans.
            <br />
            <br />
            We're focused on making Daftar genuinely useful, and every update
            reflects what we've learned from you.
            <br />
            <br />
            Team Daftar OS
          </p>
        </div>
        {/* Contact */}
        {/* <p className="text-sm text-muted-foreground mt-8">
          Have questions? Email us at{" "}
          <a href="mailto:contact@daftar.com" className="font-medium hover:underline transition">
            contact@daftar.com
          </a>
        </p> */}
      </div>
    </div>
  );
}
