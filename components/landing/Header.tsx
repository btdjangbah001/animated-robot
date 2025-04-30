import Image from 'next/image';
import DocxPreviewDialog from './PreviewDialog';
import { useState } from 'react';
import { Button } from '@mui/material';

export default function Header() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
    <header className="bg-gradient-to-r from-[#46b3a8] to-[#00a73f] text-white py-5 shadow-md">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Ministry of Health Logo" 
            width={60} 
            height={60} 
            className="mr-4"
          />
          <div>
            <h1 className="text-2xl font-semibold">Ministry of Health</h1>
            <p className="text-sm opacity-90">Admission Portal {new Date().getFullYear()}</p>
          </div>
        </div>
        <Button
        variant="contained"
        color="success"
        onClick={() => {
          setOpen(true);
        }}
        sx={{ ml: 2 }}
      >
        View Eligibility
      </Button>
        <div className="hidden md:block">
          <p>Need help? Contact: support@healthtraining.gov.gh</p>
        </div>
      </div>
    </header>
    <DocxPreviewDialog
        open={open}
        onClose={() => setOpen(false)}
        file={'https://res.cloudinary.com/drntdazzu/raw/upload/v1745973039/tests/ADMISSION_REQUIREMENTS_cpuork.docx'}
        title="Eligibility Requirements for Admission"
      />
    </>
  );
}