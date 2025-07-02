import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, TouchableOpacity, Linking, Modal, ScrollView, Share } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Flashlight, FlashlightOff, X, Copy, Share2, ImageIcon } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
// Removed deprecated expo-barcode-scanner import

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [cameraKey, setCameraKey] = useState(0); // Force re-render camera
  const [isProcessing, setIsProcessing] = useState(false);
  const insets = useSafeAreaInsets();

  // Handle screen focus/unfocus
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      setScanned(false);
      setCameraKey(prev => prev + 1); // Force camera re-render
      
      return () => {
        setIsFocused(false);
        setFlashOn(false); // Turn off flash when leaving screen
      };
    }, [])
  );

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const isValidURL = (string: string | URL) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(scannedData);
      Alert.alert('Success', 'Data copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy data to clipboard');
    }
  };

  // Share function
  const shareData = async () => {
    try {
      const result = await Share.share({
        message: scannedData,
        title: 'QR Code Data',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share data');
    }
  };

  // Enhanced Gallery function with expo-camera scanning
  const pickImageFromGallery = async () => {
    try {
      setIsProcessing(true);
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable gallery access to scan QR codes from images');
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        
        mediaTypes: ['images'], // Fixed deprecated MediaTypeOptions
        allowsEditing: false,
        quality: 1,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        try {
          // Use expo-camera's scanning functionality for images
          // Note: expo-camera doesn't have a direct scanFromURL method like the deprecated BarCodeScanner
          // This is a limitation - for now we'll show an informative message
          Alert.alert(
            'Gallery Scanning', 
            'Due to current limitations, scanning QR codes from gallery images is not supported. Please use the camera to scan the QR code.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        } catch (scanError) {
          console.error('Scan error:', scanError);
          Alert.alert('Scan Error', 'Failed to scan the image. Please try another image or use the camera instead.');
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to access gallery');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned && isFocused) {
      setScanned(true);
      setScannedData(data);
      setModalVisible(true);
    }
  };

  const renderClickableText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => {
      if (typeof part === 'string' && urlRegex.test(part)) {
        return (
          <Text
            key={index}
            style={styles.urlText}
            onPress={() => openURL(part)}
          >
            {part}
          </Text>
        );
      }
      return (
        <Text key={index} style={styles.normalText}>
          {part}
        </Text>
      );
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    setScanned(false);
    setScannedData('');
  };

  if (!permission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.text}>No access to camera</Text>
        <Text style={styles.subText}>
          Please enable camera permission in settings to scan QR codes
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Code Scanner</Text>
        <Text style={styles.subtitle}>Point your camera at a QR code or select from gallery</Text>
      </View>
      
      <View style={styles.cameraContainer}>
        {isFocused && (
          <CameraView
            key={cameraKey} // Force re-render with key
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            enableTorch={flashOn}
          />
        )}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setFlashOn(!flashOn)}
          disabled={!isFocused}
        >
          {flashOn ? (
            <FlashlightOff size={24} color="#fff" />
          ) : (
            <Flashlight size={24} color="#fff" />
          )}
          <Text style={styles.flashText}>
            {flashOn ? 'Flash Off' : 'Flash On'}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.galleryButton, isProcessing && styles.disabledButton]}
          onPress={pickImageFromGallery}
          disabled={isProcessing}
        >
          <ImageIcon size={24} color="#fff" />
          <Text style={styles.galleryText}>
            {isProcessing ? 'Processing...' : 'Gallery'}
          </Text>
        </TouchableOpacity> */}

        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={closeModal}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Modal for Scanned Data */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>QR Code Scanned!</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.dataLabel}>Scanned Data:</Text>
              <View style={styles.dataContainer}>
                {renderClickableText(scannedData)}
              </View>
            </ScrollView>
            
            {/* Action Buttons - Copy and Share */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyToClipboard}
              >
                <Copy size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareData}
              >
                <Share2 size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.scanAgainModalButton}
                onPress={closeModal}
              >
                <Text style={styles.scanAgainModalText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  flashButton: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  flashText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  galleryButton: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  galleryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  scanAgainButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 300,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  dataContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  urlText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
    fontSize: 14,
    lineHeight: 20,
  },
  normalText: {
    color: '#1F2937',
    fontSize: 14,
    lineHeight: 20,
  },
  // Action buttons styles
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalFooter: {
    padding: 20,
  },
  scanAgainModalButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});