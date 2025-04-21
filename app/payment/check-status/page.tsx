"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/applicantStore";
import axiosInstance from "@/lib/axios";
import { Loader2 } from "lucide-react";

const REDIRECT_DELAY = 4000;

export default function CheckStatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();
  const invoiceNumber = useUserStore((state) => state.invoiceNumber);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!invoiceNumber) {
        setStatusMessage(
          "Error: Invoice number not found. Unable to check status"
        );
        setIsLoading(false);
        setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY);
        return;
      }

      setIsLoading(true);
      setStatusMessage("Checking payment status...");

      try {
        const response = await axiosInstance.post(
          `/api/v1.0/invoices/check-status?invoiceNumber=${invoiceNumber}`
        );

        const paymentStatus = response.data?.status;

        if (paymentStatus === "PAID") {
          setStatusMessage("Payment Successful! Redirecting...");
          router.push("/dashboard");
          return;
        } else {
          const errorMessage = `Payment status: ${
            paymentStatus || "Unknown"
          }. Please try again or contact support. Redirecting...`;
          setStatusMessage(`Error: ${errorMessage}`);
          setIsLoading(false);
          setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY);
        }
      } catch (error: any) {
        const apiErrorMessage =
          error.response?.data?.message || error.message || "Unknown error";
        setStatusMessage(
          `Error checking payment status: ${apiErrorMessage}. Redirecting...`
        );
        setIsLoading(false);
        setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY);
      }
    };

    checkPaymentStatus();
    return () => {};
  }, [invoiceNumber, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      {isLoading && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          <p className="text-lg font-medium text-gray-700">
            {statusMessage || "Loading..."}
          </p>
        </div>
      )}
      {!isLoading && statusMessage && (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Payment Status
          </h1>
          <p
            className={`text-lg ${
              statusMessage.toLowerCase().startsWith("error:")
                ? "text-red-600"
                : "text-gray-700"
            }`}
          >
            {statusMessage}
          </p>
        </div>
      )}
    </div>
  );
}
