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
            value={formData.text}
            onChangeText={(text) => onFormChange({ text })}
            multiline
            numberOfLines={4}
          />
        );

      case 'url':
        return (
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            value={formData.url}
            onChangeText={(url) => onFormChange({ url })}
            keyboardType="url"
            autoCapitalize="none"
          />
        );

      case 'email':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={formData.email}
              onChangeText={(email) => onFormChange({ email })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Subject (optional)"
              value={formData.subject}
              onChangeText={(subject) => onFormChange({ subject })}
            />
            <TextInput
              style={styles.textArea}
              placeholder="Message (optional)"
              value={formData.body}
              onChangeText={(body) => onFormChange({ body })}
              multiline
              numberOfLines={3}
            />
          </View>
        );

      case 'sms':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              value={formData.phone}
              onChangeText={(phone) => onFormChange({ phone })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.textArea}
              placeholder="Message (optional)"
              value={formData.smsBody}
              onChangeText={(smsBody) => onFormChange({ smsBody })}
              multiline
              numberOfLines={3}
            />
          </View>
        );

      case 'phone':
        return (
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={formData.phone}
            onChangeText={(phone) => onFormChange({ phone })}
            keyboardType="phone-pad"
          />
        );

      case 'wifi':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Network Name (SSID)"
              value={formData.wifi.ssid}
              onChangeText={(ssid) => onFormChange({ 
                wifi: { ...formData.wifi, ssid } 
              })}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.wifi.password}
              onChangeText={(password) => onFormChange({ 
                wifi: { ...formData.wifi, password } 
              })}
              secureTextEntry
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
              value={formData.contact.firstName}
              onChangeText={(firstName) => onFormChange({ 
                contact: { ...formData.contact, firstName } 
              })}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.contact.lastName}
              onChangeText={(lastName) => onFormChange({ 
                contact: { ...formData.contact, lastName } 
              })}
            />
            <TextInput
              style={styles.input}
              placeholder="Organization (optional)"
              value={formData.contact.organization}
              onChangeText={(organization) => onFormChange({ 
                contact: { ...formData.contact, organization } 
              })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              value={formData.contact.phone}
              onChangeText={(phone) => onFormChange({ 
                contact: { ...formData.contact, phone } 
              })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              value={formData.contact.email}
              onChangeText={(email) => onFormChange({ 
                contact: { ...formData.contact, email } 
              })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Website (optional)"
              value={formData.contact.url}
              onChangeText={(url) => onFormChange({ 
                contact: { ...formData.contact, url } 
              })}
              keyboardType="url"
              autoCapitalize="none"
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
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    textAlignVertical: 'top',
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