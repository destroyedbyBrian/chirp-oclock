import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
    TouchableOpacity,
    Modal
} from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Entypo from "@expo/vector-icons/Entypo";
import globalStyles from './styles/globalStyles';
import { router } from "expo-router";
import { useState } from "react";
import NfcManager, { NfcTech } from 'react-native-nfc-manager';


export default function SettingsScreen() {
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
            <ScrollView style={globalStyles.scrollView}>
                <View style={[globalStyles.subHeaderBar, {justifyContent: "flex-start"}]}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons
                            name="return-up-back"
                            size={28}
                            color="black"
                            style={{ paddingRight: 15, marginTop: -7 }}
                        />
                    </Pressable>
                    <Text style={[globalStyles.subHeaderText, {fontSize: 30}]}>Settings</Text>
                </View>
                <View style={styles.wrapperCountainer}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            Linked NFC Tags
                    </Text>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.row}>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <MaterialCommunityIcons
                                        name="nfc"
                                        size={24}
                                        color="black"
                                    />
                                    <Title
                                        style={{
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            marginTop: -3,
                                            paddingLeft: 8,
                                        }}
                                    >
                                        04-55-F5-72-5D-64-80
                                    </Title>
                                </View>
                                <SimpleLineIcons
                                    name="options-vertical"
                                    size={17}
                                    color="black"
                                    style={{ marginTop: 2 }}
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <MaterialCommunityIcons
                                        name="nfc"
                                        size={24}
                                        color="black"
                                    />
                                    <Title
                                        style={{
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            marginTop: -3,
                                            paddingLeft: 8,
                                        }}
                                    >
                                        02-W2-DF-22-F2-L0-78
                                    </Title>
                                </View>
                                <SimpleLineIcons
                                    name="options-vertical"
                                    size={17}
                                    color="black"
                                    style={{ marginTop: 2 }}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
                <View style={styles.wrapperCountainer}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            Others
                    </Text>
                    <View>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.row2}>
                                <View>
                                    <Title
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Date & Time
                                    </Title>
                                    <Paragraph
                                        style={{
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            color: "grey",
                                            marginTop: -6,
                                        }}
                                    >
                                        System Time
                                    </Paragraph>
                                </View>
                                <Entypo
                                    name="chevron-right"
                                    size={26}
                                    color="black"
                                    style={{
                                        alignSelf: "center",
                                    }}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
                </View>
                <TouchableOpacity 
                    style={styles.testNFCButton} 
                    onPress={() => setNfcPromptVisible(true)}
                >
                    <Text style={{ color: 'white', fontSize: 17, fontWeight: '600' }}>Test NFC Feature</Text>
                </TouchableOpacity>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={nfcPromptVisible}
                    onRequestClose={() => setNfcPromptVisible(false)}
                    >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                        <Pressable 
                            style={styles.closeButton}
                            onPress={() => setNfcPromptVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#888" />
                        </Pressable>
                        <Text style={styles.modalTitle}>Scan NFC Tag</Text>
                        <Text style={styles.modalSubtitle}>
                            Hold your phone near the tag to dismiss alarm
                        </Text>
                        <Pressable style={styles.scanButton} onPress={doNfcScan}>
                            <Ionicons name="card-outline" size={24} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.scanButtonLabel}>Scan Now</Text>
                        </Pressable>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    wrapperCountainer: {
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
    card: {
        marginTop: 8,
        backgroundColor: "#ffffff",
    },
    cardContent: {
        marginTop: -12,
        minHeight: 80,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        marginTop: 10,
    },
    row2: {
        display: "flex",
        flexDirection: "row",
        marginHorizontal: -4,
        justifyContent: "space-between",
    },
    testNFCButton: {
        backgroundColor: 'black',
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
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
      },
      closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        borderRadius: 12,
      },
})



