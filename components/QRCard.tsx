import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Alert,
  PermissionsAndroid
} from 'react-native';
import { QRCode } from '@/types/qr';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Heart, Share, Trash2, Download } from 'lucide-react-native';
import { useQRStore } from '@/store/qrStore';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';

interface QRCardProps {
  qrCode: QRCode;
  onPress?: () => void;
}

export function QRCard({ qrCode, onPress }: QRCardProps) {
  const { toggleFavorite, deleteQRCode } = useQRStore();
  const viewShotRef = React.useRef<ViewShot>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Request storage permissions for Android
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 11+ (API 30+), WRITE_EXTERNAL_STORAGE is not needed for MediaLibrary
        const apiLevel = Platform.constants?.Version || 0;
        if (apiLevel >= 30) {
          return true; // Permission not needed for modern Android versions
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to download QR codes',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error requesting storage permission:', err);
        return false;
      }
    }
    return true; // iOS doesn't need this permission
  };

  const handleFavorite = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await toggleFavorite(qrCode.id);
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current && typeof viewShotRef.current.capture === 'function') {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleDownload = async () => {
    if (!viewShotRef.current) {
      Alert.alert('Error', 'QR code not ready for download');
      return;
    }

    setIsDownloading(true);

    try {
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Request MediaLibrary permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to download QR codes');
        setIsDownloading(false);
        return; // Exit here if permission denied
      }

      // For Android, also request storage permission (only if MediaLibrary permission was granted)
      if (Platform.OS === 'android') {
        const storagePermission = await requestStoragePermission();
        if (!storagePermission) {
          Alert.alert('Permission Required', 'Storage permission is required to download QR codes');
          setIsDownloading(false);
          return; // Exit here if storage permission denied
        }
      }

      // Capture the QR code as image
      if (viewShotRef.current && typeof viewShotRef.current.capture === 'function') {
        const uri = await viewShotRef.current.capture();
        
        // Create a unique filename
        const filename = `QRCode_${qrCode.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
        
        // Save to device
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('QR Codes', asset, false);

        Alert.alert(
          'Download Successful!',
          `QR code saved to your gallery as "${filename}"`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      Alert.alert('Download Failed', 'Unable to download QR code. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete QR Code',
      'Are you sure you want to delete this QR code?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteQRCode(qrCode.id)
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
        <View style={styles.qrContainer}>
          <QRCodeDisplay qrCode={qrCode} size={120} />
        </View>
      </ViewShot>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {qrCode.title}
        </Text>
        <Text style={styles.type}>{qrCode.type.toUpperCase()}</Text>
        <Text style={styles.date}>
          {qrCode.createdAt.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFavorite}
        >
          <Heart 
            size={18} 
            color={qrCode.isFavorite ? '#FF6B6B' : '#666'}
            fill={qrCode.isFavorite ? '#FF6B6B' : 'none'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Share size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isDownloading && styles.disabledButton
          ]}
          onPress={handleDownload}
          disabled={isDownloading}
        >
          <Download 
            size={18} 
            color={isDownloading ? '#999' : '#10B981'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Trash2 size={18} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  disabledButton: {
    backgroundColor: '#e5e5e5',
    opacity: 0.6,
  },
});