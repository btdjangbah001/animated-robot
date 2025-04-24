"use client";

import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Header from "@/components/landing/Header";

export default function DashboardPage() {

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <Footer />
      
    </div>
    
  );
}
