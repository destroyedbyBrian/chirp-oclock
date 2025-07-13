import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
    TouchableOpacity,
    Modal,
    Image
} from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import globalStyles from './styles/globalStyles';
import { router } from "expo-router";
import { useState } from "react";
import { useAppColorScheme} from '@/stores/appColorScheme';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import Fontisto from "@expo/vector-icons/Fontisto";


export default function SettingsScreen() {
    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
    const [nfcPromptVisible, setNfcPromptVisible] = useState<boolean>(false);

    const isAppColorSchemeDark = useAppColorScheme(s => s.isAppColorSchemeDark);
    const setIsAppColorSchemeDark = useAppColorScheme(s => s.setIsAppColorSchemeDark);

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

    const toggleAppScheme = () => { 
        const toggleDarkModeButtonState = !isAppColorSchemeDark;
        setIsAppColorSchemeDark(toggleDarkModeButtonState);
    }

    // 1. Turn off Do not Disturb & Silent Mode
    // 2. Test nfc card in settings (not all cards with nfc will work)
    // 3. Create alarm
    // 4. Alarm trigger → Scan nfc card

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
                <View style={styles.cardOthers}>
                    <View>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.row2}>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 17,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Dark Mode
                                    </Text>
                                </View>
                                <Fontisto
                                    name={isAppColorSchemeDark ? "toggle-on": "toggle-off"}
                                    size={45}
                                    color= {isAppColorSchemeDark ? "black" : "grey"}
                                    style={{ marginLeft: 12 }}
                                    onPress={() => {toggleAppScheme()}}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
                </View>
                {/* Improved How to Use Section */}
                <View style={styles.howToUseContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="help-circle-outline" size={26} color="#007AFF" style={{ marginRight: 8 }} />
                        <Text style={styles.howToUseTitle}>How to use</Text>
                    </View>
                    {/* Step 1 */}
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
                        <Text style={styles.stepText}>Turn off Do not Disturb & Silent Mode</Text>
                        {/* <Image source={require('../assets/images/in-app/pointRight-light.png')} style={styles.stepImage} /> */}
                    </View>
                    {/* Step 2 */}
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
                        <Text style={styles.stepText}>Test NFC Card (not all cards with NFC chip will work)</Text>
                        <Image source={require('../assets/images/in-app/pointLeft-light.png')} style={[styles.stepImage, { transform: [{ rotate: '3deg' }] }]} />
                    </View>
                    <View style={{flexDirection: "row"}}>
                        <Image source={require('../assets/images/in-app/pointRight-light.png')} style={styles.stepImage} />
                        <TouchableOpacity 
                            style={styles.testNFCButton} 
                            onPress={() => setNfcPromptVisible(true)}
                        >
                            <Text style={{ color: 'white', fontSize: 17, fontWeight: '600' }}>Test NFC Feature</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Step 3 */}
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
                        <Text style={styles.stepText}>Create an alarm</Text>
                        <Image source={require('../assets/images/in-app/onTop-light.png')} style={[styles.stepImage, { transform: [{ rotate: '2deg' }] }]} />
                    </View>
                    {/* Step 4 */}
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>4</Text></View>
                        <Text style={styles.stepText}>When alarm triggers, scan NFC card with device</Text>
                        <Image source={require('../assets/images/in-app/leaning-light.png')} style={[styles.stepImage, { transform: [{ rotate: '-90deg' }] }]} />
                    </View>
                </View>
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
        marginTop: -8,
    },
    cardOthers: {
        paddingHorizontal: 10,
        paddingBottom: 20,
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
        alignItems: "center",
    },
    testNFCButton: {
        backgroundColor: 'black',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
        width: 200,
        marginBottom: 8
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.44)",
        justifyContent: "flex-end",
        paddingBottom: 0,
      },
      modalContent: {
        backgroundColor: "#ffffff",
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
    howToUseContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 18,
        margin: 14,
        marginTop: 10,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 1,
    },
    howToUseTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
        letterSpacing: 0.2,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        marginTop: 2,
    },
    stepBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    stepBadgeText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    stepImage: {
        width: 70,
        height: 76,
        marginRight: 10,
        resizeMode: 'contain',
        opacity: 0.87
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
})



