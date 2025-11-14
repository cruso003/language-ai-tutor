import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardHeader, CardContent } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { apiClient } from '../../src/api/client';

export default function MarketplaceScreen() {
  const [packs, setPacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'language', name: 'Language', icon: 'language' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'travel', name: 'Travel', icon: 'airplane' },
    { id: 'culture', name: 'Culture', icon: 'globe' },
  ];

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMarketplacePacks();
      setPacks(data);
    } catch (error) {
      console.error('Failed to load packs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPacks();
  };

  const handlePurchase = async (packId: string) => {
    try {
      const response = await apiClient.purchasePack(packId);
      // Handle Stripe checkout URL
      console.log('Checkout URL:', response.checkoutUrl);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="bg-white px-6 py-6 mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Marketplace</Text>
          <Text className="text-base text-gray-600">
            Discover premium skill packs from expert creators
          </Text>
        </View>

        {/* Categories */}
        <View className="px-6 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  selectedCategory === category.id ? 'bg-primary-600' : 'bg-white border border-gray-300'
                }`}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? 'white' : '#374151'}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Pack */}
        <View className="px-6 mb-4">
          <Card variant="elevated">
            <View className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6">
              <View className="flex-row items-center mb-2">
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white font-bold text-xs">FEATURED</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-white mb-2">
                Business English Mastery
              </Text>
              <Text className="text-white/90 mb-4">
                Master professional communication with 50+ real-world scenarios
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className="text-white font-semibold ml-1">4.9</Text>
                  <Text className="text-white/80 ml-1">(234 reviews)</Text>
                </View>
                <Text className="text-2xl font-bold text-white">$29.99</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* All Packs */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">All Skill Packs</Text>

          {packs.length === 0 && !isLoading && (
            <Text className="text-gray-500 text-center py-8">No skill packs available</Text>
          )}

          {packs.map((pack) => (
            <Card key={pack.id} className="mb-4">
              <View className="flex-row">
                {pack.thumbnailUrl && (
                  <Image
                    source={{ uri: pack.thumbnailUrl }}
                    className="w-24 h-24 rounded-xl mr-4"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{pack.name}</Text>
                  <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                    {pack.description}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3">
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={14} color="#fbbf24" />
                        <Text className="text-sm font-semibold text-gray-700 ml-1">
                          {pack.rating || '5.0'}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="download" size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                          {pack.downloads || 0}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xl font-bold text-primary-600">
                      ${(pack.price / 100).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
              <Button
                onPress={() => handlePurchase(pack.id)}
                variant="primary"
                fullWidth
                className="mt-3"
              >
                Purchase
              </Button>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
