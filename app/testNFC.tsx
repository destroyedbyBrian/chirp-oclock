import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import NfcManager from 'react-native-nfc-manager';

export default function NFCDetector() {
  const [isNFCSupported, setIsNFCSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkNfc = async () => {
      try {
        // For debugging
        console.log('Checking NFC support...');
        
        // Check if hardware supports NFC
        const supported = await NfcManager.isSupported();
        console.log('NFC supported:', supported);
        setIsNFCSupported(supported);
        
        if (supported) {
          // Initialize NFC
          await NfcManager.start();
          console.log('NFC initialized successfully');
        }
      } catch (ex: any) {
        console.log('Error checking NFC:', ex);
        setError(ex.toString());
        Alert.alert('NFC Error', ex.toString());
      }
    };

    checkNfc();

    // Cleanup
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFC Detector</Text>
      
      {isNFCSupported === null ? (
        <Text style={styles.status}>Checking NFC support...</Text>
      ) : isNFCSupported ? (
        <Text style={styles.statusSuccess}>NFC is supported on this device</Text>
      ) : (
        <Text style={styles.statusError}>NFC is not supported on this device</Text>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Details:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  statusSuccess: {
    fontSize: 18,
    color: 'green',
    marginBottom: 20,
  },
  statusError: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
  },
  errorText: {
    fontSize: 14,
    color: '#333',
  },
});
