import React, { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store/settingsStore';
import { ColorPicker } from '@/components/ColorPicker';
import { 
  Palette, 
  Smartphone, 
  Info, 
  Star, 
  RefreshCw,
  Moon,
  Sun,
  Zap
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive helper functions
const responsiveWidth = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

const responsiveHeight = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

const responsiveFontSize = (size: number): number => {
  const scale = screenWidth / 320; // Base width (iPhone SE)
  return Math.round(size * scale);
};

// Device categorization
const isSmallDevice = screenWidth < 360;
const isMediumDevice = screenWidth >= 360 && screenWidth < 400;
const isLargeDevice = screenWidth >= 400;

// Dynamic size options based on device
const getSizeOptions = (): number[] => {
  if (isSmallDevice) {
    return [120, 150, 180, 200];
  } else if (isMediumDevice) {
    return [150, 200, 250, 280];
  } else {
    return [180, 230, 280, 320];
  }
};

// Default size based on device
const getDefaultSize = (): number => {
  if (isSmallDevice) {
    return 150;
  } else if (isMediumDevice) {
    return 200;
  } else {
    return 250;
  }
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function SettingsScreen(): JSX.Element {
  const {
    theme,
    hapticFeedback,
    defaultForegroundColor,
    defaultBackgroundColor,
    defaultSize,
    defaultErrorCorrection,
    autoSaveToGallery,
    updateSetting,
    resetSettings,
  } = useSettingsStore();

  const sizeOptions = getSizeOptions();

  const handleBooleanSetting = (key: string, value: boolean): void => {
    if (Platform.OS !== 'web' && hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSetting(key as any, value);
  };

  const handleResetSettings = (): void => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetSettings();
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
        }
      ]
    );
  };

  const handleRateApp = (): void => {
    const appStoreUrl = 'https://play.google.com/store/apps/details?id=com.babartech.qrcodegenerator';
    Linking.openURL(appStoreUrl);
  };

  const SettingSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingRow: React.FC<SettingRowProps> = ({ 
    icon, 
    title, 
    subtitle, 
    children 
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your QR generator experience</Text>
        </View>

        {/* Default QR Customization */}
        <SettingSection title="Default QR Appearance">
          <View style={styles.colorSettings}>
            <ColorPicker
              label="Foreground Color"
              color={defaultForegroundColor}
              onColorChange={(color: string) => updateSetting('defaultForegroundColor', color)}
            />
            <ColorPicker
              label="Background Color"
              color={defaultBackgroundColor}
              onColorChange={(color: string) => updateSetting('defaultBackgroundColor', color)}
            />
          </View>
          
          <SettingRow
            icon={<Palette size={responsiveFontSize(20)} color="#3B82F6" />}
            title="QR Size"
            subtitle={`Current: ${defaultSize}px`}
          >
            <View style={styles.sizeButtons}>
              {sizeOptions.map((size: number) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    defaultSize === size && styles.activeSizeButton
                  ]}
                  onPress={() => updateSetting('defaultSize', size)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    defaultSize === size && styles.activeSizeButtonText
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingRow>
        </SettingSection>

        {/* Behavior */}
        <SettingSection title="Behavior">
          <SettingRow
            icon={<Smartphone size={responsiveFontSize(20)} color="#3B82F6" />}
            title="Haptic Feedback"
            subtitle="Feel vibrations for interactions"
          >
            <Switch
              value={hapticFeedback}
              onValueChange={(value: boolean) => handleBooleanSetting('hapticFeedback', value)}
            />
          </SettingRow>

          <SettingRow
            icon={<Zap size={responsiveFontSize(20)} color="#3B82F6" />}
            title="Auto-save to Gallery"
            subtitle="Automatically save generated QR codes"
          >
            <Switch
              value={autoSaveToGallery}
              onValueChange={(value: boolean) => handleBooleanSetting('autoSaveToGallery', value)}
            />
          </SettingRow>
        </SettingSection>

        {/* Actions */}
        <SettingSection title="Actions">
          <TouchableOpacity style={styles.actionButton} onPress={handleResetSettings}>
            <RefreshCw size={responsiveFontSize(20)} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRateApp}>
            <Star size={responsiveFontSize(20)} color="#F59E0B" />
            <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>
              Rate This App
            </Text>
          </TouchableOpacity>
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <View style={styles.aboutCard}>
            <Info size={responsiveFontSize(24)} color="#3B82F6" />
            <Text style={styles.aboutTitle}>QR Generator</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Create beautiful, customizable QR codes with ease. Share them instantly or save them for later use.
            </Text>
          </View>
        </SettingSection>

        {/* Device Info (Debug - Remove in production) */}
        <SettingSection title="Device Info">
          <View style={styles.debugCard}>
            <Text style={styles.debugText}>Screen Width: {screenWidth}px</Text>
            <Text style={styles.debugText}>Screen Height: {screenHeight}px</Text>
            <Text style={styles.debugText}>Device Type: {isSmallDevice ? 'Small' : isMediumDevice ? 'Medium' : 'Large'}</Text>
          </View>
        </SettingSection>
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
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(2.5),
    paddingBottom: responsiveHeight(2.5),
  },
  title: {
    fontSize: responsiveFontSize(32),
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: responsiveFontSize(16),
    color: '#6b7280',
    marginTop: responsiveHeight(0.5),
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginBottom: responsiveHeight(4),
    paddingHorizontal: responsiveWidth(5),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: responsiveHeight(1.5),
    fontFamily: 'Inter-SemiBold',
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: responsiveHeight(1),
  },
  settingIcon: {
    width: responsiveWidth(8),
    height: responsiveWidth(8),
    borderRadius: responsiveWidth(2),
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveWidth(3),
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'Inter-Regular',
  },
  settingSubtitle: {
    fontSize: responsiveFontSize(14),
    color: '#6b7280',
    marginTop: responsiveHeight(0.25),
    fontFamily: 'Inter-Regular',
  },
  colorSettings: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1),
  },
  themeButton: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    backgroundColor: '#3B82F6',
    borderRadius: responsiveWidth(2),
  },
  themeButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    fontFamily: 'Inter-Regular',
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: responsiveWidth(2),
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  settingControl: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sizeButton: {
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.75),
    borderRadius: responsiveWidth(1.5),
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    minWidth: responsiveWidth(12),
    alignItems: 'center',
  },
  activeSizeButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sizeButtonText: {
    fontSize: responsiveFontSize(12),
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  activeSizeButtonText: {
    color: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: responsiveFontSize(16),
    fontWeight: '500',
    marginLeft: responsiveWidth(3),
    fontFamily: 'Inter-Regular',
  },
  aboutCard: {
    padding: responsiveWidth(5),
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    color: '#1f2937',
    marginTop: responsiveHeight(1),
    fontFamily: 'Inter-SemiBold',
  },
  aboutVersion: {
    fontSize: responsiveFontSize(14),
    color: '#6b7280',
    marginTop: responsiveHeight(0.5),
    fontFamily: 'Inter-Regular',
  },
  aboutDescription: {
    fontSize: responsiveFontSize(14),
    color: '#6b7280',
    textAlign: 'center',
    marginTop: responsiveHeight(1.5),
    lineHeight: responsiveFontSize(20),
    fontFamily: 'Inter-Regular',
  },
  debugCard: {
    padding: responsiveWidth(5),
    backgroundColor: '#f3f4f6',
  },
  debugText: {
    fontSize: responsiveFontSize(12),
    color: '#6b7280',
    marginBottom: responsiveHeight(0.5),
    fontFamily: 'Inter-Regular',
  },
});