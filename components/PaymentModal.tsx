"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import axiosInstance from "@/lib/axios";
import useUserStore from "@/store/applicantStore";
import { useRouter } from "next/navigation";

const GHANA_CARD_REGEX = /^[A-Z]{3}-\d{9}-\d$/;

interface PaymentModalProps {}

export const PaymentDialogContent: React.FC<PaymentModalProps> = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [ghanaCardError, setGhanaCardError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const setPaymentDetails = useUserStore((state) => state.setPaymentDetails);

  const handleProceed = async () => {
    if (!GHANA_CARD_REGEX.test(ghanaCardNumber)) {
      setGhanaCardError("Invalid Ghana Card format.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/v1.0/public/make-payment",
        {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: mobileMoneyNumber,
          email: email,
          ghanaCardNumber: ghanaCardNumber,
          redirectUrl: `${window.location.origin}/payment/check-status`,
        }
      );

      if (response.data && response.data.invoiceNumber) {
        setPaymentDetails({
          invoiceNumber: response.data.invoiceNumber,
        });
        router.push(response.data.checkoutUrl);
      } else {
        throw new Error("Missing invoice number from response body");
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateGhanaCard = (value: string) => {
    if (!value) {
      setGhanaCardError("Ghana Card number is required.");
      return false;
    } else if (!GHANA_CARD_REGEX.test(value)) {
      setGhanaCardError("Invalid format. Use GHA-123456789-0");
      return false;
    } else {
      setGhanaCardError(null);
      return true;
    }
  };

  const handleGhanaCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setGhanaCardNumber(value);
    validateGhanaCard(value);
  };

  const canProceed =
    firstName &&
    lastName &&
    email &&
    mobileMoneyNumber &&
    ghanaCardNumber &&
    !ghanaCardError;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-2xl sm:text-3xl font-semibold">
          Payment
        </DialogTitle>
        <DialogDescription className="text-sm sm:text-base text-gray-600 pt-2">
          Please review the payment summary below and confirm your payment
          information.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="mobileMoneyNumber"
              className="text-sm font-medium text-gray-700 flex items-center"
            >
              Mobile Money Number
            </Label>
            <Input
              id="mobileMoneyNumber"
              name="mobileMoneyNumber"
              type="tel"
              required
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="Enter your mobile money number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="ghanaCardNumber"
              className="text-sm font-medium text-gray-700 flex items-center"
            >
              Ghana Card Number
            </Label>
            <Input
              id="ghanaCardNumber"
              name="ghanaCardNumber"
              type="text"
              required
              value={ghanaCardNumber}
              onChange={handleGhanaCardChange}
              placeholder="e.g., GHA-123456789-0"
              aria-invalid={!!ghanaCardError}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                ghanaCardError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {ghanaCardError && (
              <p className="text-xs text-red-600 mt-1">{ghanaCardError}</p>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline" disabled={isLoading}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          onClick={handleProceed}
          className="text-white"
          disabled={!canProceed || isLoading}
        >
          {isLoading ? (
            <>Processing...</>
          ) : (
            <>
              <Check size={16} className="mr-2" />
              Proceed
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
