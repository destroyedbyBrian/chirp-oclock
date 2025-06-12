import {
    SafeAreaView,
    View,
    Text,
    Pressable,
    TouchableOpacity,
} from "react-native";
import { useEffect, useState } from 'react';
import globalStyles from "./styles/globalStyles";
import alarmSettingStyles from "./styles/alarmSettingStyles";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Card, Title, Paragraph } from "react-native-paper";
import { HourPicker, MinutePicker } from "../components/timePicker";
import AmPm from "../components/ampmPicker";
import { router, useLocalSearchParams } from "expo-router";
import { useAlarmStore } from '../stores/alarmsStore';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';


// Delete button at the bottom of the screen

export default function EditAlarmScreen() { 
    const [testNFCButton, setTestNFCButton] = useState<boolean>(false);
    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
    const [hour, setHour] = useState<number>(7);
    const [minute, setMinute] = useState<number>(0);
    const [ampm, setAmpm] = useState<string>('AM');

    const { id } = useLocalSearchParams<{ id: string }>();
    const updateAlarm = useAlarmStore((s) => s.updateAlarm);

    const handleDone = () => {
        updateAlarm({
            id: id,
            hour: hour,
            minute: minute,
            ampm: ampm,
        });
        router.push('/');
    }

    useEffect(() => {
        let cancelled = false;
        if (testNFCButton) {
            (async () => {
                try {
                    await NfcManager.start();
                    await NfcManager.requestTechnology([NfcTech.Ndef]);
                    const tag = await NfcManager.getTag();
                    console.log('NFC Tag:', tag);
                    if (!cancelled) setSuccessfulNFC(true);
                } catch (e) {
                    if (!cancelled) {
                        setSuccessfulNFC(false);
                    }
                    console.warn('NFC error:', e);
                } finally {
                    if (!cancelled) {
                        NfcManager.cancelTechnologyRequest();
                    }
                    // Allow future scan
                    if (!cancelled) setTestNFCButton(false);
                }
            })();
        }
        return () => { cancelled = true; }
    }, [testNFCButton]);


    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.scrollView}>
                <View style={[globalStyles.subHeaderBar, {flexDirection: "row", alignItems: "center"}]}>
                    <Feather 
                        name="x"
                        size={24}
                        color="black"
                        style={alarmSettingStyles.cancelButton}
                        onPress={() => router.push('/')}
                    />
                    <Text style={[globalStyles.subHeaderText, {fontSize: 24, marginLeft: 24}]}>Edit Alarm</Text>
                    <Pressable>
                        <Text 
                            style={alarmSettingStyles.saveButton}
                            onPress={handleDone}
                        >Done</Text>
                    </Pressable>
                </View>
                <Text style={alarmSettingStyles.subHeader2}>Ring in 7hours: 24 minutes</Text>
                <Card style={alarmSettingStyles.cardContainer1}>
                    <Card.Content style={alarmSettingStyles.cardContent1}>
                        <HourPicker hour={hour} onHourChange={setHour} />
                        <Text style={alarmSettingStyles.semiCollen}>:</Text>
                        <MinutePicker minute={minute} onMinuteChange={setMinute} />
                        <AmPm ampm={ampm} onAmpmChange={setAmpm} />
                    </Card.Content>
                </Card>
                <Card style={alarmSettingStyles.cardContainer2}>
                    <Card.Content style={alarmSettingStyles.cardContent2}>
                        <View style={alarmSettingStyles.row}>
                            <View>
                                <Title style={{ fontSize: 18, fontWeight: "bold" }}>Ringtone</Title>
                                <Paragraph
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "bold",
                                        color: "grey",
                                        marginTop: -7,
                                    }}
                                >Delight</Paragraph>
                            </View>
                            <Entypo
                                name="chevron-right"
                                size={28}
                                color="black"
                                style={{
                                    alignSelf: "center",
                                    marginTop: -7,
                                    paddingRight: 4,
                                }}
                            />
                        </View>
                        <View style={alarmSettingStyles.row}>
                            <View>
                                <Title style={{ fontSize: 18, fontWeight: "bold" }}>Vibrate</Title>
                            </View>
                            <Fontisto
                                name="toggle-on"
                                size={40}
                                color="black"
                                style={{ marginTop: -4 }}
                            />
                        </View>
                        <TouchableOpacity onPress={() => setTestNFCButton(true)}>
                            <View style={alarmSettingStyles.row}>
                                <View>
                                    <Title style={{ fontSize: 18, fontWeight: "bold" }}>NFC Link</Title>
                                    <Paragraph
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "bold",
                                            color: "grey",
                                            marginTop: -7,
                                        }}
                                    >
                                        {testNFCButton 
                                            ? 'Scanning...'
                                            : successfulNFC
                                                ? 'Tag Connected'
                                                : 'No Tags Connected'
                                        }
                                    </Paragraph>
                                </View>
                                <AntDesign
                                    name="disconnect"
                                    size={24}
                                    color="black"
                                    style={{ marginTop: 5, paddingRight: 6 }}
                                />
                            </View>
                        </TouchableOpacity>
                    </Card.Content>
                </Card>
                <Text>Scan successful:{successfulNFC ? "true" : "false"}</Text>
            </View>
        </SafeAreaView>
    )
}
