import { QRType, ContactData, WiFiData } from '@/types/qr';

export const formatQRData = (type: QRType, data: any): string => {
  switch (type) {
    case 'text':
      return data.text || '';
    
    case 'url':
      const url = data.url || '';
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    
    case 'email':
      const { email, subject = '', body = '' } = data;
      if (subject || body) {
        const params = new URLSearchParams();
        if (subject) params.append('subject', subject);
        if (body) params.append('body', body);
        return `mailto:${email}?${params.toString()}`;
      }
      return `mailto:${email}`;
    
    case 'sms':
      const { phone, smsBody = '' } = data;
      return smsBody ? `sms:${phone}?body=${encodeURIComponent(smsBody)}` : `sms:${phone}`;
    
    case 'phone':
      return `tel:${data.phone || ''}`;
    
    case 'wifi':
      const wifi: WiFiData = data.wifi;
      return `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`;
    
    case 'contact':
      const contact: ContactData = data.contact;
      return `BEGIN:VCARD
VERSION:3.0
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
${contact.organization ? `ORG:${contact.organization}` : ''}
${contact.phone ? `TEL:${contact.phone}` : ''}
${contact.email ? `EMAIL:${contact.email}` : ''}
${contact.url ? `URL:${contact.url}` : ''}
END:VCARD`;
    
    default:
      return '';
  }
};

export const getQRTitle = (type: QRType, data: any): string => {
  switch (type) {
    case 'text':
      return data.text?.substring(0, 30) + (data.text?.length > 30 ? '...' : '') || 'Text QR';
    case 'url':
      return data.url || 'URL QR';
    case 'email':
      return data.email || 'Email QR';
    case 'sms':
      return data.phone || 'SMS QR';
    case 'phone':
      return data.phone || 'Phone QR';
    case 'wifi':
      return data.wifi?.ssid || 'WiFi QR';
    case 'contact':
      return `${data.contact?.firstName || ''} ${data.contact?.lastName || ''}`.trim() || 'Contact QR';
    default:
      return 'QR Code';
  }
};