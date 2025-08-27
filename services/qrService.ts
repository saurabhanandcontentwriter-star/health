

import { toDataURL } from 'qrcode';

export const generateQrCode = async (amount: string): Promise<string> => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Please enter a valid positive amount.');
    }
    const upiId = 'clinic-upi-id@okhdfcbank';
    const merchantName = 'Bihar Health Connect';
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Clinic%20Payment`;
    
    return await toDataURL(upiUrl, { width: 256, margin: 2 });
};