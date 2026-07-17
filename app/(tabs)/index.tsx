import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSyncStore } from '@/features/sync/store';
import { syncService } from '@/services/sync.service';
import { getNetworkStatus } from '@/core/network/networkMonitor';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { pendingCount, lastSync, isSyncing, setPendingCount, setLastSync, setSyncing } =
    useSyncStore();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = syncService.subscribe(status => {
      setPendingCount(status.pendingCount);
      setSyncing(status.isSyncing);
      if (status.lastSync) {
        setLastSync(new Date(status.lastSync).toLocaleString());
      }
    });

    setPendingCount(syncService.getPendingCount());

    return () => unsubscribe();
  }, [setPendingCount, setLastSync, setSyncing]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncService.triggerSync();
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bienvenido a Kullin Mobile</Text>
        <Text style={styles.welcomeText}>
          Aplicación offline-first con sincronización automática
        </Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getNetworkStatus() ? '#28a745' : '#dc3545' },
              ]}
            />
            <Text style={styles.statusLabel}>
              {getNetworkStatus() ? 'En línea' : 'Fuera de línea'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <View
              style={[styles.statusDot, { backgroundColor: isSyncing ? '#ffc107' : '#28a745' }]}
            />
            <Text style={styles.statusLabel}>{isSyncing ? 'Sincronizando...' : 'Listo'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sincronización</Text>

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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Acciones Rápidas</Text>
        <View style={styles.actionGrid}>
          <View style={styles.actionButton}>
            <Ionicons name="add-circle" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Crear Registro</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="list" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Ver Lista</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="sync" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Forzar Sync</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="settings" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Config API</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información</Text>
        <Text style={styles.infoText}>
          Esta app guarda los datos localmente usando Realm Database. Cuando hay conexión,
          sincroniza automáticamente con la API. El health check se ejecuta en /api/health.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#333',
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
