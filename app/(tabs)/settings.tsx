import React from 'react';
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

export default function SettingsScreen() {
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

  const handleBooleanSetting = (key: string, value: boolean) => {
    if (Platform.OS !== 'web' && hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSetting(key as any, value);
  };

  const handleResetSettings = () => {
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

  const handleRateApp = () => {
    // In a real app, you would use the actual app store URLs
    const appStoreUrl = 'https://play.google.com/'
    
    Linking.openURL(appStoreUrl);
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    children 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string; 
    children: React.ReactNode;
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
      {children}
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

        {/* Appearance */}
        {/* <SettingSection title="Appearance">
          <SettingRow
            icon={<Moon size={20} color="#3B82F6" />}
            title="Theme"
            subtitle="Choose your preferred theme"
          >
            <TouchableOpacity
              style={styles.themeButton}
              onPress={() => {
                const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
                updateSetting('theme', newTheme);
              }}
            >
              <Text style={styles.themeButtonText}>
                {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}
              </Text>
            </TouchableOpacity>
          </SettingRow>
        </SettingSection> */}

        {/* Default QR Customization */}
        <SettingSection title="Default QR Appearance">
          <View style={styles.colorSettings}>
            <ColorPicker
              label="Foreground Color"
              color={defaultForegroundColor}
              onColorChange={(color) => updateSetting('defaultForegroundColor', color)}
            />
            <ColorPicker
              label="Background Color"
              color={defaultBackgroundColor}
              onColorChange={(color) => updateSetting('defaultBackgroundColor', color)}
            />
          </View>
          
          <SettingRow
            icon={<Palette size={20} color="#3B82F6" />}
            title="Default Size"
            subtitle={`${defaultSize}px`}
          >
            <View style={styles.sizeButtons}>
              {[150, 200, 250, 300].map((size) => (
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
            icon={<Smartphone size={20} color="#3B82F6" />}
            title="Haptic Feedback"
            subtitle="Feel vibrations for interactions"
          >
            <Switch
              value={hapticFeedback}
              onValueChange={(value) => handleBooleanSetting('hapticFeedback', value)}
            />
          </SettingRow>

          <SettingRow
            icon={<Zap size={20} color="#3B82F6" />}
            title="Auto-save to Gallery"
            subtitle="Automatically save generated QR codes"
          >
            <Switch
              value={autoSaveToGallery}
              onValueChange={(value) => handleBooleanSetting('autoSaveToGallery', value)}
            />
          </SettingRow>
        </SettingSection>

        {/* Actions */}
        <SettingSection title="Actions">
          <TouchableOpacity style={styles.actionButton} onPress={handleResetSettings}>
            <RefreshCw size={20} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRateApp}>
            <Star size={20} color="#F59E0B" />
            <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>
              Rate This App
            </Text>
          </TouchableOpacity>
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <View style={styles.aboutCard}>
            <Info size={24} color="#3B82F6" />
            <Text style={styles.aboutTitle}>QR Generator</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Create beautiful, customizable QR codes with ease. Share them instantly or save them for later use.
            </Text>
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
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'Inter-Regular',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  colorSettings: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Regular',
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  activeSizeButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sizeButtonText: {
    fontSize: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  aboutCard: {
    padding: 20,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    fontFamily: 'Inter-SemiBold',
  },
  aboutVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});