"use client";

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Alert from '@mui/material/Alert';
import axiosInstance from '@/lib/axios';
import useUserStore from '@/store/applicantStore';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { Check } from 'lucide-react';

const PHONE_REGEX = /^0\d{9}$/;
const GHANA_CARD_REGEX = /^[A-Z]{3}-\d{9}-\d$/;
interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  amount: string;
}

export default function PaymentDialog({ open, onClose, amount }: PaymentDialogProps) {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileMoneyNumber: '',
    ghanaCardNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const setPaymentDetails = useUserStore((state) => state.setPaymentDetails);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!paymentData.firstName) newErrors.fullName = 'First name is required';
    if (!paymentData.lastName) newErrors.lastName = 'Last name is required';
    if (!paymentData.email) newErrors.email = 'Email is required';
    if (!paymentData.mobileMoneyNumber || !PHONE_REGEX.test(paymentData.mobileMoneyNumber)) newErrors.mobileMoneyNumber = 'Please enter a valid mobile money number';
    if (paymentData.ghanaCardNumber && !GHANA_CARD_REGEX.test(paymentData.ghanaCardNumber)) newErrors.ghanaCardNumber = 'Please enter a valid Ghana card number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Static success response - no API call
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/api/v1.0/public/make-payment",
        {
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          phoneNumber: paymentData.mobileMoneyNumber,
          email: paymentData.email,
          ghanaCardNumber: paymentData.ghanaCardNumber,
          redirectUrl: `${window.location.origin}/payment/check-status`,
        }
      );

      if (response.data && response.data.invoiceNumber) {
        setTimeout(() => {
          onClose();
        }, 3000);
        setPaymentDetails({
          invoiceNumber: response.data.invoiceNumber,
        });
        router.push(response.data.checkoutUrl);
      } else {
        throw new Error("Missing invoice number from response body");
      }
    } catch (err) {
      // Handle the API error response
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.success(errorMessage)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="bg-[#00a73f] text-white">
          Payment Information
          <p className="text-sm mt-1">Application Fee: GHS{amount}</p>
        </DialogTitle>
        <DialogContent dividers className="space-y-4 pt-4">
    
            <Alert variant="filled" severity="error" className="mb-4">
              Please enter your SURNAME and OTHER NAMES exactly as they appear on your official certificate. Once submitted, your SURNAME and OTHER NAMES cannot be changed. Ensure that your NAMES match your certificate before pressing the Pay button.
            </Alert>
          

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Applicant&apos;s Surname
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={paymentData.lastName}
                  onChange={handleChange}
                  placeholder="Enter applicant's last name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  Applicant&apos;s Other Names
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={paymentData.firstName}
                  onChange={handleChange}
                  placeholder="Enter applicant's given names"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                 Applicant&apos;s Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={paymentData.email}
                  onChange={handleChange}
                  placeholder="Enter applicant's email address"
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
                  value={paymentData.mobileMoneyNumber}
                  onChange={handleChange}
                  placeholder="Enter your mobile money number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                {errors.mobileMoneyNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.mobileMoneyNumber}</p>
                )}
              </div>
              {/* <div className="space-y-2 sm:col-span-2">
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
                  value={paymentData.ghanaCardNumber}
                  onChange={handleChange}
                  placeholder="e.g., GHA-123456789-0"
                />
                {errors.ghanaCardNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.ghanaCardNumber}</p>
                )}
              </div> */}
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={isLoading}
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Pay GHS{amount}
              </>
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}