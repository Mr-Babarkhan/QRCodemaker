import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQRStore } from '@/store/qrStore';
import { QRCard } from '@/components/QRCard';
import { QRType } from '@/types/qr';
import { Search, Filter, Heart, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' as QRType | 'all' },
  { label: 'Text', value: 'text' as QRType },
  { label: 'URL', value: 'url' as QRType },
  { label: 'Email', value: 'email' as QRType },
  { label: 'SMS', value: 'sms' as QRType },
  { label: 'Phone', value: 'phone' as QRType },
  { label: 'WiFi', value: 'wifi' as QRType },
  { label: 'Contact', value: 'contact' as QRType },
];

export default function HistoryScreen() {
  const { qrCodes, favorites, searchQRCodes, filterByType, clearHistory } = useQRStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<QRType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const getFilteredQRCodes = () => {
    let codes = showFavoritesOnly ? favorites : qrCodes;
    
    if (selectedFilter !== 'all') {
      codes = codes.filter(qr => qr.type === selectedFilter);
    }
    
    if (searchQuery.trim()) {
      codes = codes.filter(qr => 
        qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.data.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return codes;
  };

  const filteredQRCodes = getFilteredQRCodes();

  const handleFilterSelect = (filter: QRType | 'all') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFilter(filter);
  };

  const toggleFavoritesOnly = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const handleClearHistory = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to clear all history?')) {
        clearHistory();
      }
    } else {
      // For mobile, you might want to implement a native alert
      clearHistory();
    }
  };

  const renderQRCard = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <QRCard qrCode={item} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {showFavoritesOnly ? (
        <>
          <Heart size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any QR code to add it to favorites
          </Text>
        </>
      ) : (
        <>
          <Search size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No QR codes found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try a different search term' : 'Create your first QR code from the generator'}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {showFavoritesOnly ? 'Favorites' : 'History'}
        </Text>
        <Text style={styles.subtitle}>
          {filteredQRCodes.length} QR code{filteredQRCodes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search QR codes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            showFavoritesOnly && styles.activeFilterChip
          ]}
          onPress={toggleFavoritesOnly}
        >
          <Heart 
            size={16} 
            color={showFavoritesOnly ? '#fff' : '#3B82F6'}
            fill={showFavoritesOnly ? '#fff' : 'none'}
          />
          <Text style={[
            styles.filterChipText,
            showFavoritesOnly && styles.activeFilterChipText
          ]}>
            Favorites ({favorites.length})
          </Text>
        </TouchableOpacity>

        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              selectedFilter === option.value && !showFavoritesOnly && styles.activeFilterChip
            ]}
            onPress={() => handleFilterSelect(option.value)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === option.value && !showFavoritesOnly && styles.activeFilterChipText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* QR Codes List */}
      <FlatList
        data={filteredQRCodes}
        renderItem={renderQRCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />

      {/* Clear History Button */}
      {qrCodes.length > 0 && !showFavoritesOnly && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Trash2 size={20} color="#FF4444" />
          <Text style={styles.clearButtonText}>Clear All History</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    flex: 0.48,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  clearButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#FF4444',
    fontFamily: 'Inter-Regular',
  },
});