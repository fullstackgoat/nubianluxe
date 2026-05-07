import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsStrip from "@/components/StatsStrip";
import SignatureAccommodations from "@/components/SignatureAccommodations";
import WaysToBook from "@/components/WaysToBook";
import SchedulingPolicy from "@/components/SchedulingPolicy";
import AboutMe from "@/components/AboutMe";
import BraidingHairColorChart from "@/components/BraidingHairColorChart";
import PriceList from "@/components/PriceList";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StatsStrip />
      <section id="services">
        <SignatureAccommodations />
      </section>
      <section id="booking">
        <WaysToBook />
      </section>
      <section id="policy">
        <SchedulingPolicy />
      </section>
      <section id="about">
        <AboutMe />
      </section>
      <section id="colors">
        <BraidingHairColorChart />
      </section>
      <section id="prices">
        <PriceList />
      </section>
      <Footer />
    </main>
  );
}
