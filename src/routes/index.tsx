import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { Features } from "@/components/Features";
import { RegulationSelector } from "@/components/RegulationSelector";
import { HowItWorks } from "@/components/HowItWorks";
import { AIBotPreview } from "@/components/AIBotPreview";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <RegulationSelector />
        <HowItWorks />
        <AIBotPreview />
      </main>
      <Footer />
    </div>
  );
}
