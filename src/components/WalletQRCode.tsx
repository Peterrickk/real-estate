import { QRCodeCanvas } from 'qrcode.react';

interface WalletQRCodeProps {
  address: string;
  size?: number;
  className?: string;
}

export function WalletQRCode({ address, size = 200, className = '' }: WalletQRCodeProps) {
  return (
    <div className={`wallet-qr-code ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '1rem',
      padding: '1.5rem',
      background: 'rgba(47, 86, 68, 0.05)',
      borderRadius: '1rem',
      border: '1px solid rgba(47, 86, 68, 0.2)'
    }}>
      <h3 style={{ 
        margin: 0, 
        fontSize: '1rem', 
        color: '#2f5644',
        fontWeight: '600'
      }}>
        Scan to Send BCH
      </h3>
      <div style={{ 
        padding: '1rem', 
        background: 'white', 
        borderRadius: '0.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <QRCodeCanvas 
          value={address} 
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      <div style={{ 
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#2f5644'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
          Wallet Address:
        </div>
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.75rem',
          wordBreak: 'break-all',
          opacity: 0.8
        }}>
          {address}
        </div>
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#2f5644',
        opacity: 0.7,
        textAlign: 'center'
      }}>
        Network: BCH Chipnet
      </div>
    </div>
  );
}
