"use client";

import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Header from "@/components/landing/Header";
import FAQ from "@/components/landing/Faq";

export default function DashboardPage() {

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <FAQ />
        <Features />
      </main>
      <Footer />
      
    </div>
    
  );
}
