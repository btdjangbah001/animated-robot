"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import PaymentDialog from './PaymentDialog';
import InvoiceDialog from './InvoiceDialog';

export default function Hero() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [settings, setSettings] = useState({
    startingDate: 0, closingDate: 0
  });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const applicationFee = "150";

  // Memoize the fetch function
  const fetchSettings = useCallback(async () => {
    const response = await axiosInstance.get('/api/v1.0/public/settings');
    const data = await response.data;
    setSettings(data);
  }, []);

  // Calculate distance only when settings.startingDate changes
  const distance = useMemo(() => {
    const now = new Date().getTime();
    return settings.startingDate - now;
  }, [settings.startingDate]);

  // Calculate distance only when settings.startingDate changes
  const closeTime = useMemo(() => {
    const now = new Date().getTime();
    console.log(now, settings.closingDate, settings.closingDate - now);
    return settings.closingDate - now;
  }, [settings.closingDate]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]); // Only run once when component mounts

  useEffect(() => {
    if (settings.startingDate === 0) return; // Don't start timer until we have a date

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const currentDistance = settings.startingDate - now;

      if (currentDistance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(currentDistance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((currentDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((currentDistance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((currentDistance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.startingDate]); // Only restart timer when startingDate changes

  return (
    <>
      <section
        className="relative py-16 text-center text-white bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
        }}
      >
        {/* Extension Banner */}
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-black py-2 px-4 text-center uppercase font-bold z-20">
          Log in to check your application status
        </div>
        <div className="absolute inset-0 bg-[rgba(0,86,17,0.95)]"></div>
        <div className="container relative z-10 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Welcome to the Ministry of Health Admission Portal</h2>
          <p className="text-lg mb-8 opacity-95">
            Begin your journey in healthcare education with our streamlined admission process.
            Join thousands of successful applicants who have launched their medical careers through our programs.
          </p>

          <div className="price-tag">
            Application Fee: GHS{applicationFee}
          </div>

          {distance > 0 ? <div className="mt-8">
            <div className="coming-soon-countdown">
              <h3 className="text-xl font-semibold mb-4">Portal Opening Soon</h3>
              <div className="flex justify-center gap-4">
                <div className="countdown-box">
                  <span className="countdown-value">{timeLeft.days}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-box">
                  <span className="countdown-value">{timeLeft.hours}</span>
                  <span className="countdown-label">Hours</span>
                </div>
                <div className="countdown-box">
                  <span className="countdown-value">{timeLeft.minutes}</span>
                  <span className="countdown-label">Minutes</span>
                </div>
                <div className="countdown-box">
                  <span className="countdown-value">{timeLeft.seconds}</span>
                  <span className="countdown-label">Seconds</span>
                </div>
              </div>
            </div>
          </div> : <div className="flex flex-col md:flex-row justify-center gap-5 mt-8">
            {closeTime > 0 && <button
              onClick={() => setPaymentOpen(true)}
              className="btn btn-primary cursor-pointer"
            >
              Make Payment & Register
            </button>}
            <Link
              href="/portal/login"
              className="btn btn-secondary"
            >
              Already Paid? Login Here
            </Link>
            {/* <button
              onClick={() => setInvoiceOpen(true)}
              className="btn btn-outline-light cursor-pointer"
            >
              Check Invoice Status
            </button> */}
          </div>}
        </div>
      </section>

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={applicationFee}
      />

      <InvoiceDialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        amount={applicationFee}
      />
    </>
  );
}