import Image from 'next/image';
import DocxPreviewDialog from './PreviewDialog';
import { useState } from 'react';
import { Button } from '@mui/material';
import { Phone } from '@mui/icons-material';

export default function Header() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <header className="bg-gradient-to-r from-[#46b3a8] to-[#00a73f] text-white py-3 md:py-5 shadow-md">
        <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <div className='flex items-center w-full md:w-auto justify-between'>
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
          </div>
          
          <Button
            variant="contained"
            color="success"
            onClick={() => setOpen(true)}
            sx={{ ml: 2 }}
          >
            View Eligibility
          </Button>

          <div className="g-white/10 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-lg border border-white/20 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Phone className="text-white opacity-80" fontSize="small" />
              <div>
                <p className="text-xs font-light opacity-80">Need help?</p>
                <div className="flex flex-wrap gap-x-2 gap-y-0 text-xs md:text-sm font-medium">
                  <a href="tel:0557002631" className="hover:underline hover:text-white/90 transition-colors">0557002631</a>
                  <a href="tel:0557005665" className="hover:underline hover:text-white/90 transition-colors">0557005665</a>
                  <a href="tel:0557223960" className="hover:underline hover:text-white/90 transition-colors">0557223960</a>
                  <a href="tel:0557385895" className="hover:underline hover:text-white/90 transition-colors">0557385895</a>
                  <a href="tel:0557208487" className="hover:underline hover:text-white/90 transition-colors">0557208487</a>
                </div>
              </div>
            </div>
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