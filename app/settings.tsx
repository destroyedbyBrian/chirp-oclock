import {
    ScrollView,
    Text,
    View,
    Pressable,
    TouchableOpacity,
    Modal,
    Image
} from "react-native";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState, useMemo } from "react";
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import Fontisto from "@expo/vector-icons/Fontisto";
import { lightTheme, darkTheme } from '@/theme/colors';
import { useAppColorScheme } from '@/stores/appColorScheme';
import createGlobalStyles from "./styles/globalStyles";
import settingsStyles from "./styles/settingStyles";
import * as Haptics from 'expo-haptics';


export default function SettingsScreen() {
    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
    const [nfcPromptVisible, setNfcPromptVisible] = useState<boolean>(false);

    const isAppColorSchemeDark = useAppColorScheme(s => s.isAppColorSchemeDark);
    const setIsAppColorSchemeDark = useAppColorScheme(s => s.setIsAppColorSchemeDark);

    const theme = isAppColorSchemeDark ? darkTheme : lightTheme;
    // Memoize styles to prevent recreation on every render
    const globalStylesObj = useMemo(() => createGlobalStyles(theme), [theme]);
    const styles = useMemo(() => settingsStyles(theme), [theme]);

    const pointLeftImage = isAppColorSchemeDark === true 
        ? require('../assets/images/in-app/pointLeft-dark.png')
        : require('../assets/images/in-app/pointLeft-light.png');

    const pointRightImage = isAppColorSchemeDark === true 
        ? require('../assets/images/in-app/pointRight-dark.png')
        : require('../assets/images/in-app/pointRight-light.png');

    const onTopImage = isAppColorSchemeDark === true 
        ? require('../assets/images/in-app/onTop-dark.png')
        : require('../assets/images/in-app/onTop-light.png');

    const leaningImage = isAppColorSchemeDark === true 
        ? require('../assets/images/in-app/leaning-dark.png')
        : require('../assets/images/in-app/leaning-light.png');


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
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    };

    const toggleAppScheme = () => { 
        const toggleDarkModeButtonState = !isAppColorSchemeDark;
        setIsAppColorSchemeDark(toggleDarkModeButtonState);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    return (
        <SafeAreaView style={globalStylesObj.safeArea}>
            <ScrollView style={globalStylesObj.scrollView}>
                <View style={[globalStylesObj.subHeaderBar, {justifyContent: "flex-start"}]}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons
                            name="return-up-back"
                            size={28}
                            color={isAppColorSchemeDark? "white" : "black"}
                            style={{ paddingRight: 15, marginTop: -7 }}
                        />
                    </Pressable>
                    <Text style={[globalStylesObj.subHeaderText, {fontSize: 30}]}>Settings</Text>
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
                                            color: theme.text
                                        }}
                                    >
                                        Dark Mode
                                    </Text>
                                </View>
                                <Fontisto
                                    name={isAppColorSchemeDark ? "toggle-on": "toggle-off"}
                                    size={45}
                                    color= {isAppColorSchemeDark ? (isAppColorSchemeDark ? "#ffffff":"#000000") : "#8e8e8e"}
                                    style={{ marginLeft: 12 }}
                                    onPress={() => {toggleAppScheme()}}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
                </View>
                <View style={styles.howToUseContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="help-circle-outline" size={26} style={styles.questionIcon} />
                        <Text style={styles.howToUseTitle}>How to use</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
                        <Text style={styles.stepText}>Turn off Do not Disturb & Silent Mode</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
                        <Text style={styles.stepText}>Test NFC Card (not all cards with NFC chip will work)</Text>
                        <Image source={pointLeftImage} style={[styles.stepImage, { transform: [{ rotate: '3deg' }] }]} />
                    </View>
                    <View style={{flexDirection: "row"}}>
                        <Image source={pointRightImage} style={styles.stepImage} />
                        <TouchableOpacity 
                            style={styles.testNFCButton} 
                            onPress={() => setNfcPromptVisible(true)}
                        >
                            <Text style={styles.testNFCText}>Test NFC Feature</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
                        <Text style={styles.stepText}>Create an alarm</Text>
                        <Image source={onTopImage} style={[styles.stepImage, { transform: [{ rotate: '2deg' }] }]} />
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>4</Text></View>
                        <Text style={styles.stepText}>When alarm triggers, scan NFC card with device</Text>
                        <Image source={leaningImage} style={[styles.stepImage, { transform: [{ rotate: '-90deg' }] }]} />
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
                            <Ionicons name="close" size={24} color="#000000" />
                        </Pressable>
                        <Text style={styles.modalTitle}>Scan NFC Tag</Text>
                        <Text style={styles.modalSubtitle}>
                            Hold your phone near the tag to dismiss alarm
                        </Text>
                        <Pressable style={styles.scanButton} onPress={doNfcScan}>
                            <Ionicons name="card-outline" size={24} color="#ffffff" style={{ marginRight: 6 }} />
                            <Text style={styles.scanButtonLabel}>Scan Now</Text>
                        </Pressable>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}

