"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PaymentDialogContent } from "@/components/PaymentModal";

export default function DashboardPage() {
  const admissionYear = "2025/2026";
  const admissionPrice = "GHS 500.00";

  const handleProceedPayment = (mobileMoneyNumber: string) => {
    console.log("Proceeding with payment for:", mobileMoneyNumber);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Admission Information
          </h2>
          <p className="text-gray-600">
            Welcome! Here is the information for the{" "}
            <span className="font-medium">{admissionYear}</span> admission
            period.
          </p>
          <p className="text-gray-600">
            The application fee is{" "}
            <span className="font-medium">{admissionPrice}</span>.
          </p>
        </div>

        <Dialog>
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Payment
            </h2>
            <p className="text-gray-600 mb-4">
              Click the button below to proceed with your application payment.
            </p>
            <DialogTrigger asChild>
              <Button className=" text-white">Make Payment</Button>
            </DialogTrigger>
          </div>

          <PaymentDialogContent onProceed={handleProceedPayment} />
        </Dialog>
      </div>
    </div>
  );
}
