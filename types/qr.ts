export interface QRCode {
  id: string;
  type: QRType;
  data: string;
  title: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logoUri?: string;
  createdAt: Date;
  isFavorite: boolean;
}

export type QRType = 'text' | 'url' | 'email' | 'sms' | 'phone' | 'wifi' | 'contact';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface ContactData {
  firstName: string;
  lastName: string;
  organization?: string;
  phone?: string;
  email?: string;
  url?: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface QRGeneratorForm {
  type: QRType;
  text: string;
  url: string;
  email: string;
  subject?: string;
  body?: string;
  phone: string;
  smsBody?: string;
  contact: ContactData;
  wifi: WiFiData;
}

export interface QRCustomization {
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logoUri?: string;
}