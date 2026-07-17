import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSyncStore } from '@/features/sync/store';
import { syncService } from '@/services/sync.service';
import { Ionicons } from '@expo/vector-icons';

export default function SyncScreen() {
  const { pendingCount, lastSync, isSyncing, error, setPendingCount, setLastSync, setSyncing, setError } =
    useSyncStore();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = syncService.subscribe((status) => {
      setPendingCount(status.pendingCount);
      setSyncing(status.isSyncing);
      setError(status.error);
      if (status.lastSync) {
        setLastSync(new Date(status.lastSync).toLocaleString());
      }
    });

    setPendingCount(syncService.getPendingCount());

    return () => unsubscribe();
  }, [setPendingCount, setLastSync, setSyncing, setError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncService.triggerSync();
    setRefreshing(false);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncService.triggerSync();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estado de Sincronización</Text>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: pendingCount === 0 ? '#28a745' : '#ffc107' },
              ]}
            />
            <Text style={styles.statusText}>
              {pendingCount === 0 ? 'Todo sincronizado' : `${pendingCount} pendientes`}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isSyncing ? '#ffc107' : '#28a745' },
              ]}
            />
            <Text style={styles.statusText}>
              {isSyncing ? 'Sincronizando...' : 'Inactivo'}
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color="#dc3545" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
          onPress={handleManualSync}
          disabled={isSyncing}
        >
          <Ionicons name={isSyncing ? 'spinner' : 'sync'} size={24} color="#fff" />
          <Text style={styles.syncButtonText}>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estadísticas</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Operaciones pendientes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{lastSync || '—'}</Text>
            <Text style={styles.statLabel}>Última sincronización</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cola de Operaciones</Text>
        <Text style={styles.hint}>
          Las operaciones realizadas sin conexión se guardan aquí y se envían
          automáticamente cuando hay conexión.
        </Text>

        <View style={styles.queueInfo}>
          <View style={styles.queueItem}>
            <Ionicons name="add-circle" size={24} color="#28a745" />
            <Text>Crear (POST)</Text>
          </View>
          <View style={styles.queueItem}>
            <Ionicons name="create" size={24} color="#ffc107" />
            <Text>Actualizar (PUT)</Text>
          </View>
          <View style={styles.queueItem}>
            <Ionicons name="trash" size={24} color="#dc3545" />
            <Text>Eliminar (DELETE)</Text>
          </View>
        </View>

        <View style={styles.backoffInfo}>
          <Ionicons name="information-circle" size={18} color="#666" />
          <Text style={styles.backoffText}>
            Reintentos automáticos con backoff exponencial: 1s → 2s → 4s → 8s → 16s → 30s (máx 3 intentos)
          </Text>
        </View>
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
  statusRow: {
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#feb2b2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
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
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backoffInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backoffText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
});