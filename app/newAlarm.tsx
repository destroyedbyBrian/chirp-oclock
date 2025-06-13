import {
    SafeAreaView,
    View,
    Text,
    Pressable,
    TouchableOpacity,
} from "react-native";
import globalStyles from "./styles/globalStyles";
import alarmSettingStyles from "./styles/alarmSettingStyles";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Card, Title, Paragraph } from "react-native-paper";
import { HourPicker, MinutePicker } from "../components/timePicker";
import AmPm from "../components/ampmPicker";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { useAlarmStore } from '../stores/alarmsStore';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';

type Alarm = {
    hour: number;
    minute: number;
    ampm: string;
};

export default function NewAlarmScreen() {
    const [testNFCButton, setTestNFCButton] = useState<boolean>(false);
    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
    const [hour, setHour] = useState<number>(7);
    const [minute, setMinute] = useState<number>(0);
    const [ampm, setAmpm] = useState<string>('AM');

    const [ringingIn, setRingingIn] = useState<string>('');

    function get24Hour(hour: number, ampm: string) {
        ampm = ampm.toLowerCase();
        if (ampm === "am") return hour === 12 ? 0 : hour;
        if (ampm === "pm") return hour === 12 ? 12 : hour + 12;
        return hour; // fallback
    }

    function getNextAlarmDate(alarm: Alarm) {
        const now = new Date();
        const hour = get24Hour(alarm.hour, alarm.ampm);
        const alarmDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            alarm.minute,
            0,
            0
        );
        if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }
        return alarmDate;
    }

    // Calculate time difference whenever hour or minute changes
    useEffect(() => {
        const currentAlarm: Alarm = {
            hour,
            minute,
            ampm
        };
        
        const nextAlarmDate = getNextAlarmDate(currentAlarm);
        const now = new Date();
        
        // Calculate difference in minutes, using ceil to round up partial minutes
        const diffMinutes = Math.ceil((nextAlarmDate.getTime() - now.getTime()) / (1000 * 60));
        
        // Convert to hours and minutes
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        setRingingIn(`Ring in ${hours} hours : ${minutes} minutes`);
    }, [hour, minute, ampm]);

    const addAlarm = useAlarmStore((s) => s.addAlarm);

    const handleDone = () => {
        addAlarm({
            id: Date.now().toString(), 
            hour: hour,
            minute: minute,
            ampm: ampm,
            enabled: true, 
        });
        router.push('/');
    };

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
                    <Text style={[globalStyles.subHeaderText, {fontSize: 24, marginLeft: 24}]}>New Alarm</Text>
                    <Pressable>
                        <Text 
                            style={alarmSettingStyles.saveButton}
                            onPress={handleDone}
                        >Done</Text>
                    </Pressable>
                </View>
                {/* <Text style={alarmSettingStyles.subHeader2}>Ring in 7hours: 24 minutes</Text> */}
                <Text style={alarmSettingStyles.subHeader2}>{ringingIn}</Text>
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
                {/* <Text>Scan successful:{successfulNFC ? "true" : "false"}</Text> */}
            </View>
        </SafeAreaView>
    )
}