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
import useUserStore from '@/store/applicantStore';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  amount: string;
}

export default function InvoiceDialog({ open, onClose, amount }: InvoiceDialogProps) {
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState({invoiceNumber: ''});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setPaymentDetails = useUserStore((state) => state.setPaymentDetails);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!invoiceData.invoiceNumber) newErrors.fullName = 'Invoice number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log(amount);

    // Static success response - no API call
    setPaymentDetails({
        invoiceNumber: invoiceData.invoiceNumber,
      });
      router.push(`${window.location.origin}/payment/check-status`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="bg-[#00a73f] text-white">
          Invoice Status Check
        </DialogTitle>
        <DialogContent dividers className="space-y-4 pt-4">
    
            <Alert variant="filled" severity="error" className="mb-4">
              Please enter the invoice number generated for the payment.
            </Alert>
          

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="invoiceNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Payment&apos;s Invoice Number
                </Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="Enter payment's invoice number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                {errors.invoiceNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.invoiceNumber}</p>
                )}
              </div>
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
          >
            <>
            <Check size={16} className="mr-2" />
                Check Status
            </>
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}