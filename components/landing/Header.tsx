import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-[#0056b3] to-[#003366] text-white py-5 shadow-md">
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
        <div className="hidden md:block">
          <p>Need help? Contact: support@healthtraining.gov.gh</p>
        </div>
      </div>
    </header>
  );
}