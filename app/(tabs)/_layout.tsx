import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '@/components/TabBarIcon';
import { useSyncStore } from '@/features/sync/store';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export function TabsLayout() {
  const { pendingCount, isSyncing } = useSyncStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          if (route.name === 'index') {
            iconName = focused ? 'ios-home' : 'ios-home-outline';
          } else if (route.name === 'sync') {
            iconName = focused ? 'ios-sync' : 'ios-sync-outline';
          } else {
            iconName = 'ios-help';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen name="index" options={{ title: 'Inicio' }} />
      <Tab.Screen
        name="sync"
        options={{
          title: 'Sync',
          tabBarBadge: pendingCount > 0 ? pendingCount.toString() : undefined,
        }}
      />
    </Tab.Navigator>
  );
}