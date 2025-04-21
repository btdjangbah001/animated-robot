import React from 'react';

interface PaymentPendingProps {
    invoice: string;
  }

const PaymentPending: React.FC<PaymentPendingProps> = ({ invoice }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.icon, color: '#ffc107' }}>⏳</div>
        <h1 style={{ ...styles.title, color: '#ffc107' }}>Payment Processing</h1>
        
        <p style={styles.text}>
          Your payment (Reference: <strong>{invoice}</strong>) is being verified.
        </p>
        
        <div style={styles.detailsBox}>
          <p>What to expect:</p>
          <ul style={styles.list}>
            <li>You'll receive confirmation via email</li>
            <li>No additional action is required</li>
            <li>Refresh this page for updates</li>
          </ul>
        </div>

        <div style={styles.footer}>
          Status will update automatically. Check your spam folder if you don't see updates.
        </div>
      </div>
    </div>
  );
};

// Reuses the same styles object from PaymentFailed
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

export default PaymentPending;