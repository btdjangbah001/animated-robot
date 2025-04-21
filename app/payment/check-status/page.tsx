"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/applicantStore";
import axiosInstance from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckStatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const invoiceNumber = useUserStore((state) => state.invoiceNumber);

  const checkPaymentStatus = async () => {
    if (!invoiceNumber) {
      setStatusMessage(
        "Error: Invoice number not found. Unable to check status"
      );
      setIsLoading(false);
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setStatusMessage("Checking payment status...");

    try {
      const response = await axiosInstance.post(
        `/public/check-status?invoiceNumber=${invoiceNumber}`
      );

      const paymentStatus = response.data?.transactionStatus;

      if (paymentStatus === "PAID") {
        setStatusMessage(
          "Payment Successful! Your serial number and pin will be sent to your email."
        );
        setIsSuccess(true);
        setIsLoading(false);
      } else {
        const errorMessage = `Payment status: ${
          paymentStatus || "Unknown"
        }. Please try again or contact support.`;
        setStatusMessage(`Error: ${errorMessage}`);
        setIsSuccess(false);
        setIsLoading(false);
      }
    } catch (error: any) {
      const apiErrorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      setStatusMessage(`Error checking payment status: ${apiErrorMessage}.`);
      setIsSuccess(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
    return () => {};
  }, [invoiceNumber, router]);

  const handleOkClick = () => {
    router.push("/portal/login"); // TODO: @bernard on success, we should route them to some page. hopefully the login page
  };

  const handleTryAgainClick = () => {
    checkPaymentStatus();
  };

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
              isSuccess ? "text-green-700" : "text-red-600"
            }`}
          >
            {statusMessage}
          </p>
          {isSuccess && (
            <Button
              onClick={handleOkClick}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white"
            >
              OK
            </Button>
          )}
          {!isSuccess && (
            <Button
              onClick={handleTryAgainClick}
              variant="outline"
              className="mt-6"
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
