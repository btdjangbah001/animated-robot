import React from 'react';

interface PaymentNoRecordProps {
    onRetry?: () => void; // New prop for continue action
  }

const PaymentNoRecord: React.FC<PaymentNoRecordProps> = ({
    onRetry = () => window.location.href = '/dashboard' // Default redirect 
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.icon, color: '#17a2b8' }}>🔍</div>
        <h1 style={{ ...styles.title, color: '#17a2b8' }}>Transaction Not Found</h1>
        
        <p style={styles.text}>
          {`We couldn't locate your payment record. This usually means:`}
        </p>
        
        <div style={styles.detailsBox}>
          <ul style={styles.list}>
            <li>{`The payment wasn't completed`}</li>
            <li>You used a different email/phone</li>
            <li>System delay (try again in 30 minutes)</li>
          </ul>
        </div>

        <div style={styles.actions}>
          <button onClick={onRetry} style={styles.retryButton}>Check Again</button>
        </div>

        <div style={styles.footer}>
          {`If you're certain you paid, contact support with your proof of payment.`}<br />
          {/* Email <a href={`mailto:${supportEmail}`} style={styles.link}>{supportEmail}</a> or call {supportPhone} */}
        </div>
      </div>
    </div>
  );
};

// Reuses the same styles object
const styles = {
    container: {
        fontFamily: "'Arial', sans-serif",
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
      },
      card: {
        background: '#fff',
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center' as const,
      },
      icon: {
        fontSize: '48px',
        margin: '15px 0',
      },
      title: {
        fontSize: '24px',
        marginBottom: '10px',
      },
      text: {
        lineHeight: 1.6,
        margin: '15px 0',
      },
      detailsBox: {
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '6px',
        margin: '20px 0',
        textAlign: 'left' as const,
      },
      list: {
        paddingLeft: '20px',
        margin: '10px 0',
      },
      actions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        margin: '20px 0',
      },
      retryButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
      supportButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
      footer: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#6c757d',
      },
      link: {
        color: '#007bff',
        textDecoration: 'none',
      },
};
export default PaymentNoRecord;