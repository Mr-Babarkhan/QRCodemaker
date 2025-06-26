import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQRStore } from '@/store/qrStore';
import { QRCard } from '@/components/QRCard';
import { QRType } from '@/types/qr';
import { 
  Type, 
  Link, 
  Mail, 
  MessageCircle, 
  Phone, 
  Wifi, 
  User,
  Plus,
  Zap,
  QrCode
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { type: 'text' as QRType, label: 'Text', icon: Type, color: '#3B82F6' },
  { type: 'url' as QRType, label: 'Website', icon: Link, color: '#10B981' },
  { type: 'email' as QRType, label: 'Email', icon: Mail, color: '#F59E0B' },
  { type: 'wifi' as QRType, label: 'WiFi', icon: Wifi, color: '#8B5CF6' },
];

export default function HomeScreen() {
  const { recentQRCodes } = useQRStore();
  const [quickText, setQuickText] = useState('');

  const handleQuickGenerate = () => {
    if (quickText.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      router.push({
        pathname: '/generator',
        params: { type: 'text', data: quickText }
      });
    }
  };

  const handleQuickAction = (type: QRType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/generator',
      params: { type }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QR Generator</Text>
          <Text style={styles.subtitle}>Create beautiful QR codes instantly</Text>
        </View>

        {/* Quick Generator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Generate</Text>
          <View style={styles.quickGeneratorCard}>
            <TextInput
              style={styles.quickInput}
              placeholder="Enter text to generate QR code..."
              value={quickText}
              onChangeText={setQuickText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.quickButton,
                !quickText.trim() && styles.quickButtonDisabled
              ]}
              onPress={handleQuickGenerate}
              disabled={!quickText.trim()}
            >
              <Zap size={20} color={quickText.trim() ? '#fff' : '#ccc'} />
              <Text style={[
                styles.quickButtonText,
                !quickText.trim() && styles.quickButtonTextDisabled
              ]}>
                Generate
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.type}
                style={[styles.actionCard, { borderColor: action.color }]}
                onPress={() => handleQuickAction(action.type)}
              >
                <action.icon size={24} color={action.color} />
                <Text style={[styles.actionLabel, { color: action.color }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent QR Codes */}
        {recentQRCodes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent QR Codes</Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentQRScroll}
            >
              {recentQRCodes.map((qrCode) => (
                <View key={qrCode.id} style={styles.recentQRCard}>
                  <QRCard qrCode={qrCode} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Empty State */}
        {recentQRCodes.length === 0 && (
          <View style={styles.emptyState}>
            <QrCode size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No QR codes yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first QR code using the quick generator above
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/generator')}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 30,
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
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Inter-SemiBold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  quickGeneratorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
    minHeight: 80,
    fontFamily: 'Inter-Regular',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  quickButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
  quickButtonTextDisabled: {
    color: '#ccc',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  recentQRScroll: {
    paddingRight: 20,
  },
  recentQRCard: {
    width: 200,
    marginRight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});