"use client";

import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className='relative'>
      <HeroSection>
        <Header />
      </HeroSection>
      <AboutSection />
      <Footer />
    </div>
  );
}
