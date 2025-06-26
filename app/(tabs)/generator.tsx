import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { QRTypeSelector } from '@/components/QRTypeSelector';
import { QRFormFields } from '@/components/QRFormFields';
import { ColorPicker } from '@/components/ColorPicker';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { QRType, QRGeneratorForm, QRCustomization, ContactData, WiFiData } from '@/types/qr';
import { formatQRData, getQRTitle } from '@/utils/qrDataFormatter';
import { useQRStore } from '@/store/qrStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Slider } from '@miblanchard/react-native-slider';
import { Save, Share, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

const { width } = Dimensions.get('window');

const INITIAL_FORM_DATA: QRGeneratorForm = {
  type: 'text',
  text: '',
  url: '',
  email: '',
  subject: '',
  body: '',
  phone: '',
  smsBody: '',
  contact: {
    firstName: '',
    lastName: '',
    organization: '',
    phone: '',
    email: '',
    url: '',
  },
  wifi: {
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false,
  },
};

export default function GeneratorScreen() {
  const params = useLocalSearchParams();
  const { addQRCode, qrCodes } = useQRStore(); // Also get qrCodes to track changes
  const { 
    defaultForegroundColor, 
    defaultBackgroundColor, 
    defaultSize, 
    defaultErrorCorrection 
  } = useSettingsStore();

  const [selectedType, setSelectedType] = useState<QRType>('text');
  const [formData, setFormData] = useState<QRGeneratorForm>(INITIAL_FORM_DATA);
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: defaultForegroundColor,
    backgroundColor: defaultBackgroundColor,
    size: defaultSize,
    errorCorrectionLevel: defaultErrorCorrection,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const viewShotRef = React.useRef<ViewShot>(null);

  // Handle initial params
  useEffect(() => {
    if (params.type) {
      setSelectedType(params.type as QRType);
    }
    if (params.data && params.type === 'text') {
      setFormData(prev => ({ ...prev, text: params.data as string }));
    }
  }, [params.type, params.data]);

  // Memoize the preview QR object to prevent unnecessary re-renders
  const previewQR = useMemo(() => {
    const qrData = formatQRData(selectedType, formData);
    if (qrData) {
      return {
        id: 'preview',
        type: selectedType,
        data: qrData,
        title: getQRTitle(selectedType, formData),
        ...customization,
        createdAt: new Date(),
        isFavorite: false,
      };
    }
    return null;
  }, [selectedType, formData, customization]);

  const handleFormChange = (data: Partial<QRGeneratorForm>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleCustomizationChange = (key: keyof QRCustomization, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!previewQR || !canGenerate()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      // Create a new QR code object with a unique ID and current timestamp
      const newQRCode = {
        type: previewQR.type,
        data: previewQR.data,
        title: previewQR.title,
        foregroundColor: previewQR.foregroundColor,
        backgroundColor: previewQR.backgroundColor,
        size: previewQR.size,
        errorCorrectionLevel: previewQR.errorCorrectionLevel,
        logoUri: previewQR.logoUri,
        isFavorite: false,
        createdAt: new Date(),
      };

      console.log('Saving QR Code:', newQRCode);
      
      // Wait for the QR code to be added
      await addQRCode(newQRCode);
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Show success animation
      Alert.alert(
        'Success!',
        'QR code saved successfully',
        [
          { text: 'Create Another', onPress: resetForm },
          { 
            text: 'View History', 
            onPress: () => {
              // Force navigation with params to refresh the screen
              router.push({
                pathname: '/history',
                params: { refresh: Date.now().toString() }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!previewQR || !viewShotRef.current) return;

    try {
      if (viewShotRef.current && typeof viewShotRef.current.capture === 'function') {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedType('text');
    setCustomization({
      foregroundColor: defaultForegroundColor,
      backgroundColor: defaultBackgroundColor,
      size: defaultSize,
      errorCorrectionLevel: defaultErrorCorrection,
    });
  };

  const canGenerate = () => {
    switch (selectedType) {
      case 'text':
        return formData.text.trim().length > 0;
      case 'url':
        return formData.url.trim().length > 0;
      case 'email':
        return formData.email.trim().length > 0;
      case 'sms':
      case 'phone':
        return formData.phone.trim().length > 0;
      case 'wifi':
        return formData.wifi.ssid.trim().length > 0;
      case 'contact':
        return formData.contact.firstName.trim().length > 0 || 
               formData.contact.lastName.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QR Generator</Text>
          <Text style={styles.subtitle}>Create and customize your QR code</Text>
        </View>

        {/* QR Type Selector */}
        <QRTypeSelector
          selectedType={selectedType}
          onTypeSelect={(type) => {
            setSelectedType(type);
            setFormData(INITIAL_FORM_DATA);
          }}
        />

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          <View style={styles.formCard}>
            <QRFormFields
              type={selectedType}
              formData={formData}
              onFormChange={handleFormChange}
            />
          </View>
        </View>

        {/* Preview */}
        {previewQR && canGenerate() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                <View style={styles.previewContainer}>
                  <QRCodeDisplay qrCode={previewQR} />
                </View>
              </ViewShot>
            </View>
          </View>
        )}

        {/* Customization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customization</Text>
          <View style={styles.customizationCard}>
            <ColorPicker
              label="Foreground Color"
              color={customization.foregroundColor}
              onColorChange={(color) => handleCustomizationChange('foregroundColor', color)}
            />
            
            <ColorPicker
              label="Background Color"
              color={customization.backgroundColor}
              onColorChange={(color) => handleCustomizationChange('backgroundColor', color)}
            />

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Size: {customization.size}px</Text>
              <Slider
                value={customization.size}
                onValueChange={(value) => handleCustomizationChange('size', Math.round(value[0]))}
                minimumValue={100}
                maximumValue={300}
                step={10}
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
                minimumTrackTintColor="#3B82F6"
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        {previewQR && canGenerate() && (
          <View style={styles.section}>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.saveButton,
                  (!canGenerate() || isSaving) && styles.disabledButton
                ]}
                onPress={handleSave}
                disabled={isSaving || !canGenerate()}
              >
                <Save size={20} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
                disabled={isSaving}
              >
                <Share size={20} color="#3B82F6" />
                <Text style={[styles.actionButtonText, styles.shareButtonText]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewContainer: {
    alignItems: 'center',
  },
  customizationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sliderContainer: {
    paddingVertical: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  sliderThumb: {
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  shareButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  shareButtonText: {
    color: '#3B82F6',
  },
});