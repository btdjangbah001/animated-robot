import React from 'react';
import Image from 'next/image';
interface PaymentSuccessProps {
  pin: string;
  serialNumber: string;
  invoiceNumber: string; // prop for invoice number
  onContinue?: () => void; // New prop for continue action
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  pin,
  serialNumber,
  invoiceNumber,
  onContinue = () => window.location.href = '/dashboard' // Default redirect
}) => {
  return (
    <div style={{
      fontFamily: "'Arial', sans-serif",
      lineHeight: 1.6,
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {/* Optional: Add your logo here */}
          <Image src="/logo.png" alt="Ministry of Interior Logo" width={60} height={60}className="mr-4" />
        </div>
        
        <div style={{
          color: '#28a745',
          fontSize: '48px',
          textAlign: 'center',
          margin: '15px 0',
        }}>✓</div>
        
        <h1 style={{
          color: '#28a745',
          fontSize: '24px',
          textAlign: 'center',
          marginBottom: '10px',
        }}>Payment Successful!</h1>
        
        <p>Your payment with invoice number <strong>{invoiceNumber}</strong> has been processed successfully. Below is your generated <strong>PIN</strong> and <strong>Serial Number</strong></p>
        
        <div style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '6px',
          margin: '20px 0',
        }}>
          <p style={{ margin: '8px 0' }}>
            <span style={{ fontWeight: 'bold', color: '#000' }}>PIN:</span>{' '}
            <strong>{pin}</strong>
          </p>
          <p style={{ margin: '8px 0' }}>
            <span style={{ fontWeight: 'bold', color: '#000' }}>Serial Number:</span>{' '}
            <strong>{serialNumber}</strong>
          </p>
        </div>
        
        <p>For your convenience, these details have also been sent to the email and phone number provided</p>
        
        {/* New Continue Button */}
        <div style={{ textAlign: 'center', margin: '25px 0' }}>
          <button 
            onClick={onContinue}
            style={{
              padding: '12px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              fontWeight: 'bold',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            Continue to Login
          </button>
        </div>

        <p style={{ fontStyle: 'italic', color: '#555', marginTop: '15px' }}>
          {`Please keep this information secure, as it will be required for future access or transactions. If you don't receive the details via email/SMS, check your spam folder or contact support.`}
        </p>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#777' }}>
          <p>
            Need help? Contact us at{' '}
            {/* <a href={`mailto:${supportEmail}`} style={{ color: '#28a745' }}>
              {supportEmail}
            </a>{' '}
            or call {supportPhone}. */}
          </p>
          {/* <p>&copy; {companyName} {currentYear}</p> */}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;