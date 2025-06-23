import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useState } from "react";
import globalStyles from "../styles/globalStyles";
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Button
} from "react-native";
import { Paragraph } from 'react-native-paper';
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";


export default function TestNFC() {
  const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
  const [nfcPromptVisible, setNfcPromptVisible] = useState<boolean>(false);

  const doNfcScan = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {}
  
    try {
      await NfcManager.requestTechnology([NfcTech.IsoDep]);
      await NfcManager.getTag();
      setNfcPromptVisible(false);
      setSuccessfulNFC(true);
    } catch (e) {
      setSuccessfulNFC(false);
      // Don't close modal here
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };
  

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.scrollView}>
        <TouchableOpacity onPress={() => setNfcPromptVisible(true)}>
          <Text>Tap to scan NFC</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={nfcPromptVisible}
          onRequestClose={() => setNfcPromptVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Scan NFC Tag</Text>
              <Text style={styles.modalSubtitle}>
                Hold your phone near the tag to dismiss alarm
              </Text>
              <Text style={styles.alarmTime}>10:10 AM</Text>
              <Pressable style={styles.scanButton} onPress={doNfcScan}>
                <Ionicons name="card-outline" size={24} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.scanButtonLabel}>Scan Now</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Paragraph>
          {successfulNFC ? 'Tag Connected' : 'No Tags Connected'}
        </Paragraph>
        <Button title="back to settings" onPress={() => router.back()}/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.44)",
    justifyContent: "flex-end",
    paddingBottom: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    alignItems: "center",
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 11,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 4,
    color: "#222",
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 18,
    textAlign: "center"
  },
  alarmTime: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 20,
    marginTop: 5
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#007AFF",
    borderRadius: 22,
    paddingHorizontal: 25,
    paddingVertical: 11,
    marginBottom: 13,
    marginTop: 5,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  scanButtonLabel: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600"
  }
});
