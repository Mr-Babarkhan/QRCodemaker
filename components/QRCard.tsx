import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Alert
} from 'react-native';
import { QRCode } from '@/types/qr';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Heart, Share, Trash2 } from 'lucide-react-native';
import { useQRStore } from '@/store/qrStore';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

interface QRCardProps {
  qrCode: QRCode;
  onPress?: () => void;
}

export function QRCard({ qrCode, onPress }: QRCardProps) {
  const { toggleFavorite, deleteQRCode } = useQRStore();
  const viewShotRef = React.useRef<ViewShot>(null);

  const handleFavorite = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await toggleFavorite(qrCode.id);
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
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
            size={20} 
            color={qrCode.isFavorite ? '#FF6B6B' : '#666'}
            fill={qrCode.isFavorite ? '#FF6B6B' : 'none'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Share size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    gap: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
});