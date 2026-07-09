import { Inter } from "next/font/google";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Logos } from "@/components/landing/logos";
import { Features } from "@/components/landing/features";
import { ProductPreview } from "@/components/landing/product-preview";
import { AiSection } from "@/components/landing/ai-section";
import { Comparison } from "@/components/landing/comparison";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function LandingPage() {
  return (
    <div
      className={`${inter.className} min-h-dvh bg-[#0B0F14] text-white antialiased`}
    >
      <LandingNav />

      <main>
        <Hero />

        <div className="space-y-28 pb-32 sm:space-y-36">
          <Stats />
          <Logos />
          <Features />
          <ProductPreview />
          <AiSection />
          <Comparison />
          <Pricing />
          <Testimonials />
          <Faq />
          <FinalCta />
        </div>
      </main>

      <Footer />
    </div>
  );
}
