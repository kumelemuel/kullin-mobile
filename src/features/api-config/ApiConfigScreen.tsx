import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApiConfigStore } from './store';

export function ApiConfigScreen() {
  const { setConfig, isConfigured } = useApiConfigStore();
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('');
  const [token, setToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!url.trim()) {
      setError('URL es requerida');
      return false;
    }
    if (!port.trim()) {
      setError('Puerto es requerido');
      return false;
    }
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Puerto inválido (1-65535)');
      return false;
    }
    if (!token.trim()) {
      setError('Token es requerido');
      return false;
    }
    setError('');
    return true;
  };

  const testConnection = async (): Promise<boolean> => {
    setTesting(true);
    setError('');

    const testUrl = url.trim();
    const testPort = parseInt(port.trim(), 10);
    const testToken = token.trim();

    try {
      const response = await fetch(`${testUrl}:${testPort}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testToken}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return true;
      } else {
        setError(`Health check falló: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('Timeout: No se pudo conectar al servidor (5s)');
      } else if (err.message?.includes('Network request failed')) {
        setError('Error de red: Verifica la URL y que el servidor esté accesible');
      } else {
        setError(`Error: ${err.message || 'Desconocido'}`);
      }
      return false;
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const success = await testConnection();
    if (!success) return;

    await setConfig(url.trim(), parseInt(port.trim(), 10), token.trim());
  };

  if (isConfigured) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuración Inicial</Text>
          <Text style={styles.subtitle}>
            Ingresa la información de la API para continuar
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>URL Base</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://api.ejemplo.com"
              autoCapitalize="none"
              keyboardType="url"
              autoCompleteType="off"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Puerto</Text>
            <TextInput
              style={styles.input}
              value={port}
              onChangeText={setPort}
              placeholder="3000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Token de Acceso</Text>
            <TextInput
              style={styles.input}
              value={token}
              onChangeText={setToken}
              placeholder="Bearer token..."
              secureTextEntry
              autoCompleteType="off"
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={testing ? 'Probando conexión...' : 'Guardar y Probar Conexión'}
            onPress={handleSave}
            disabled={testing}
            style={styles.button}
          />

          {testing && <ActivityIndicator style={styles.spinner} size="large" />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  error: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  spinner: {
    marginTop: 16,
  },
});