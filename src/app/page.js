import HeroSection from "@/components/hero/HeroSection";
import AboutSection from "@/components/about/AboutSection";
import CapabilitiesSection from "@/components/capabilities/CapabilitiesSection";
import StoryReveal from "@/components/story-reveal/StoryReveal";
import WorksSection from "@/components/works/WorksSection";
import ProcessSection from "@/components/process/ProcessSection";
import PrinciplesSection from "@/components/principles/PrinciplesSection";
import StatsSection from "@/components/stats/StatsSection";
import ToolkitMarquee from "@/components/toolkit/ToolkitMarquee";
import Footer from "@/components/footer/Footer";

/*
  Narrative order:
  Hero → About → Capabilities → (Craft × Code reveal) → Selected Work
  → Principles (Swiss) → Process → Stats
  → Toolkit band → Contact / Footer
*/
export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <CapabilitiesSection />
        <StoryReveal />
        <WorksSection />
        <PrinciplesSection />
        <ProcessSection />
        <StatsSection />
        <ToolkitMarquee />
      </main>
      <Footer />
    </>
  );
}
