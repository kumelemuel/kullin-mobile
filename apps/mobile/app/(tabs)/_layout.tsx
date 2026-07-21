import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '@/components/TabBarIcon';
import { useSyncStore } from '@/features/sync/store';

const Tab = createBottomTabNavigator();

function HomeScreenContent() {
  const { pendingCount, lastSync } = useSyncStore();

  return (
    <View style={styles.container}>
      <Text style={styles.cardTitle}>Bienvenido a Kullin Mobile</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lastSync || 'Nunca'}</Text>
          <Text style={styles.statLabel}>Última sync</Text>
        </View>
      </View>
    </View>
  );
}

function SyncScreenContent() {
  const { pendingCount, lastSync } = useSyncStore();

  return (
    <View style={styles.container}>
      <Text style={styles.cardTitle}>Sincronización</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lastSync || '—'}</Text>
          <Text style={styles.statLabel}>Última sync</Text>
        </View>
      </View>
    </View>
  );
}

export function TabsLayout() {
  const { pendingCount } = useSyncStore();

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
          return <TabBarIcon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="index"
        options={{ title: 'Inicio' }}
        children={() => <HomeScreenContent />}
      />
      <Tab.Screen
        name="sync"
        options={{
          title: 'Sync',
          tabBarBadge: pendingCount > 0 ? pendingCount.toString() : undefined,
        }}
        children={() => <SyncScreenContent />}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
