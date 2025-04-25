"use client";

import { useState } from 'react';
import Link from 'next/link';
import PaymentDialog from './PaymentDialog';

export default function Hero() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const applicationFee = "150";

  return (
    <>
      <section 
        className="relative py-16 text-center text-white bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-[rgba(0,86,17,0.95)]"></div>
        <div className="container relative z-10 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Welcome to the Ministry of Health Admission Portal</h2>
          <p className="text-lg mb-8 opacity-95">
            Begin your journey in healthcare education with our streamlined admission process. 
            Join thousands of successful applicants who have launched their medical careers through our programs.
          </p>
          
          <div className="price-tag">
            Application Fee for {new Date().getFullYear()}: GHS{applicationFee}
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-5 mt-8">
            <button 
              onClick={() => setPaymentOpen(true)}
              className="btn btn-primary cursor-pointer"
            >
              Make Payment & Register
            </button>
            <Link 
              href="/portal/login" 
              className="btn btn-secondary"
            >
              Already Paid? Login Here
            </Link>
          </div>
        </div>
      </section>

      <PaymentDialog 
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={applicationFee}
      />
    </>
  );
}