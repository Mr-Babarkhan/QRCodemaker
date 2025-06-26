import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRCode as QRCodeType } from '@/types/qr';

interface QRCodeDisplayProps {
  qrCode: QRCodeType;
  size?: number;
  showLogo?: boolean;
}

export function QRCodeDisplay({ qrCode, size, showLogo = true }: QRCodeDisplayProps) {
  const qrSize = size || qrCode.size;
  
  return (
    <View style={[styles.container, { width: qrSize + 20, height: qrSize + 20 }]}>
      <QRCode
        value={qrCode.data}
        size={qrSize}
        color={qrCode.foregroundColor}
        backgroundColor={qrCode.backgroundColor}
        ecl={qrCode.errorCorrectionLevel}
        logo={showLogo && qrCode.logoUri ? { uri: qrCode.logoUri } : undefined}
        logoSize={qrSize * 0.2}
        logoBackgroundColor="transparent"
        logoMargin={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});