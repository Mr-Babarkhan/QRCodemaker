import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  Switch
} from 'react-native';
import { QRType, QRGeneratorForm } from '@/types/qr';

interface QRFormFieldsProps {
  type: QRType;
  formData: QRGeneratorForm;
  onFormChange: (data: Partial<QRGeneratorForm>) => void;
}

export function QRFormFields({ type, formData, onFormChange }: QRFormFieldsProps) {
  const renderFields = () => {
    switch (type) {
      case 'text':
        return (
          <TextInput
            style={styles.textArea}
            placeholder="Enter your text here..."
            placeholderTextColor="#666"
            value={formData.text}
            onChangeText={(text) => onFormChange({ text })}
            multiline
            numberOfLines={4}
            underlineColorAndroid="transparent"
          />
        );

      case 'url':
        return (
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor="#666"
            value={formData.url}
            onChangeText={(url) => onFormChange({ url })}
            keyboardType="url"
            autoCapitalize="none"
            underlineColorAndroid="transparent"
          />
        );

      case 'email':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#666"
              value={formData.email}
              onChangeText={(email) => onFormChange({ email })}
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.input}
              placeholder="Subject (optional)"
              placeholderTextColor="#666"
              value={formData.subject}
              onChangeText={(subject) => onFormChange({ subject })}
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.textArea}
              placeholder="Message (optional)"
              placeholderTextColor="#666"
              value={formData.body}
              onChangeText={(body) => onFormChange({ body })}
              multiline
              numberOfLines={3}
              underlineColorAndroid="transparent"
            />
          </View>
        );

      case 'sms':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#666"
              value={formData.phone}
              onChangeText={(phone) => onFormChange({ phone })}
              keyboardType="phone-pad"
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.textArea}
              placeholder="Message (optional)"
              placeholderTextColor="#666"
              value={formData.smsBody}
              onChangeText={(smsBody) => onFormChange({ smsBody })}
              multiline
              numberOfLines={3}
              underlineColorAndroid="transparent"
            />
          </View>
        );

      case 'phone':
        return (
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#666"
            value={formData.phone}
            onChangeText={(phone) => onFormChange({ phone })}
            keyboardType="phone-pad"
            underlineColorAndroid="transparent"
          />
        );

      case 'wifi':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Network Name (SSID)"
              placeholderTextColor="#666"
              value={formData.wifi.ssid}
              onChangeText={(ssid) => onFormChange({ 
                wifi: { ...formData.wifi, ssid } 
              })}
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={formData.wifi.password}
              onChangeText={(password) => onFormChange({ 
                wifi: { ...formData.wifi, password } 
              })}
              secureTextEntry
              underlineColorAndroid="transparent"
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Hidden Network</Text>
              <Switch
                value={formData.wifi.hidden}
                onValueChange={(hidden) => onFormChange({ 
                  wifi: { ...formData.wifi, hidden } 
                })}
              />
            </View>
          </View>
        );

      case 'contact':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#666"
              value={formData.contact.firstName}
              onChangeText={(firstName) => onFormChange({ 
                contact: { ...formData.contact, firstName } 
              })}
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#666"
              value={formData.contact.lastName}
              onChangeText={(lastName) => onFormChange({ 
                contact: { ...formData.contact, lastName } 
              })}
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.input}
              placeholder="Organization (optional)"
              placeholderTextColor="#666"
              value={formData.contact.organization}
              onChangeText={(organization) => onFormChange({ 
                contact: { ...formData.contact, organization } 
              })}
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              placeholderTextColor="#666"
              value={formData.contact.phone}
              onChangeText={(phone) => onFormChange({ 
                contact: { ...formData.contact, phone } 
              })}
              keyboardType="phone-pad"
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#666"
              value={formData.contact.email}
              onChangeText={(email) => onFormChange({ 
                contact: { ...formData.contact, email } 
              })}
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
            />
            <TextInput
              style={styles.input}
              placeholder="Website (optional)"
              placeholderTextColor="#666"
              value={formData.contact.url}
              onChangeText={(url) => onFormChange({ 
                contact: { ...formData.contact, url } 
              })}
              keyboardType="url"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderFields()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    color: '#000',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    color: '#000',
    textAlignVertical: 'top',
    includeFontPadding: false,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
});