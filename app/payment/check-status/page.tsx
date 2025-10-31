"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/applicantStore";
import axiosInstance from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { ApplicantOutput } from "@/types/applicant";
import PaymentSuccess from "@/components/payments/PaymentSuccess";
import PaymentFailed from "@/components/payments/PaymentFailed";
import PaymentPending from "@/components/payments/PaymentPending";
import PaymentNoRecord from "@/components/payments/PaymentNoRecord";

export default function CheckStatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [applicant, setApplicant] = useState<ApplicantOutput | null>(null);
  const router = useRouter();
  const invoiceNumber = useUserStore((state) => state.invoiceNumber);

  const checkPaymentStatus = useCallback(async () => {
    if (!invoiceNumber) {
      setStatus("NO_RECORD");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post<ApplicantOutput>(
        `/api/v1.0/public/check-status?invoiceNumber=${invoiceNumber}`
      );

      const paymentStatus = response.data.transactionStatus;
      setStatus(paymentStatus?.toString() || "NO_RECORD");
      setApplicant(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching payment status:", err);
      setStatus("NO_RECORD");
      setApplicant(null);
      setIsLoading(false);
    }
  }, [invoiceNumber]);

  useEffect(() => {
    checkPaymentStatus();
    return () => { };
  }, [checkPaymentStatus, router]);

  const handleOkClick = () => {
    router.push("/portal/login");
  };

  const handleTryAgainClick = () => {
    checkPaymentStatus();
  };

  const statusTemplate = (status: string) => {
    if (status === "PAID") {
      return <PaymentSuccess pin={applicant?.pin ?? ''} serialNumber={applicant?.serialNumber ?? ''} invoiceNumber={invoiceNumber ?? ''} onContinue={handleOkClick} />;
    }
    if (status === "FAILED") {
      return <PaymentFailed errorMessage={'Payment could not be processed'} onRetry={handleTryAgainClick} />;
    }
    if (status === "NO_RECORD") {
      return <PaymentNoRecord onRetry={handleTryAgainClick} />;
    }
    if (status === "PENDING") {
      return <PaymentPending invoice={invoiceNumber ?? ''} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      {isLoading && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#222142]" />
          <p className="text-lg font-medium text-gray-700">
            {"Loading..."}
          </p>
        </div>
      )}
      {!isLoading && (
        <div>
          {statusTemplate(status)}
        </div>
      )}
    </div>
  );
}
