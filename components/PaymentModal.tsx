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

interface PaymentModalProps {
  onProceed?: (mobileMoneyNumber: string) => void;
}

export const PaymentDialogContent: React.FC<PaymentModalProps> = ({
  onProceed,
}) => {
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");

  const handleProceed = () => {
    if (onProceed) {
      onProceed(mobileMoneyNumber);
    } else {
      console.log("Proceeding with payment for:", mobileMoneyNumber);
    }
  };

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

      <div className="space-y-6 py-4">
        <div className="bg-green-50 p-4 rounded-lg text-center space-y-2 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Payment Summary
          </h3>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Application Type:</span>
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Payment Reference:</span> ABC123
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Amount to Pay:</span> GHS 500
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="mobileMoneyNumber"
            className="text-sm font-medium text-gray-700 flex items-center"
          >
            Mobile Money Number <span className="text-red-500 ml-1">*</span>
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
      </div>

      <DialogFooter className="sm:justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleProceed}
          className=" text-white"
          disabled={!mobileMoneyNumber}
        >
          <Check size={16} className="mr-2" />
          Proceed
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
