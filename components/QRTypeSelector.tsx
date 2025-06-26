import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { QRType } from '@/types/qr';
import { 
  Type, 
  Link, 
  Mail, 
  MessageCircle, 
  Phone, 
  Wifi, 
  User 
} from 'lucide-react-native';

interface QRTypeSelectorProps {
  selectedType: QRType;
  onTypeSelect: (type: QRType) => void;
}

const QR_TYPES = [
  { type: 'text' as QRType, label: 'Text', icon: Type },
  { type: 'url' as QRType, label: 'URL', icon: Link },
  { type: 'email' as QRType, label: 'Email', icon: Mail },
  { type: 'sms' as QRType, label: 'SMS', icon: MessageCircle },
  { type: 'phone' as QRType, label: 'Phone', icon: Phone },
  { type: 'wifi' as QRType, label: 'WiFi', icon: Wifi },
  { type: 'contact' as QRType, label: 'Contact', icon: User },
];

export function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {QR_TYPES.map(({ type, label, icon: Icon }) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeButton,
            selectedType === type && styles.selectedTypeButton
          ]}
          onPress={() => onTypeSelect(type)}
        >
          <Icon 
            size={24} 
            color={selectedType === type ? '#fff' : '#3B82F6'} 
          />
          <Text style={[
            styles.typeLabel,
            selectedType === type && styles.selectedTypeLabel
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  typeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#fff',
    minWidth: 80,
  },
  selectedTypeButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  typeLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  selectedTypeLabel: {
    color: '#fff',
  },
});