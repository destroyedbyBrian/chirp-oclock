import {
    SafeAreaView,
    View,
    Text,
    Pressable,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
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
import * as Haptics from 'expo-haptics';

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
    const [vibrate, setVibrate] = useState<boolean>(true);
    const [description, setDescription] = useState<string>('');
    const [showDescriptionModal, setShowDescriptionModal] = useState<boolean>(false);

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
            vibrate: vibrate,
            description: description,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/');
    };

    useEffect(() => {
        let cancelled = false;
        if (testNFCButton) {
            (async () => {
                try {
                    await NfcManager.start();
                    await NfcManager.requestTechnology([NfcTech.IsoDep]);
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
                        <TouchableOpacity onPress={() => setVibrate(!vibrate)}>
                            <View style={alarmSettingStyles.row}>
                                <View>
                                    <Title style={{ fontSize: 18, fontWeight: "bold" }}>Vibrate</Title>
                                </View>
                                <Fontisto
                                    name={vibrate ? "toggle-on" : "toggle-off"}
                                    size={40}
                                    color="black"
                                    style={{ marginTop: -2 }}
                                />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowDescriptionModal(true)}>
                            <View style={alarmSettingStyles.row}>
                                <View>
                                    <Title style={{ fontSize: 18, fontWeight: "bold" }}>Description</Title>
                                    <Paragraph
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "bold",
                                            color: "grey",
                                            marginTop: -7,
                                        }}
                                    >
                                        {description || 'No description'}
                                    </Paragraph>
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
                        </TouchableOpacity>
                    </Card.Content>
                </Card>
            </View>

            {/* Description Input Modal */}
            <Modal
                visible={showDescriptionModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDescriptionModal(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            borderRadius: 12,
                            padding: 20,
                            width: '100%',
                            maxWidth: 400,
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                marginBottom: 15,
                                textAlign: 'center',
                            }}>
                                Alarm Description
                            </Text>
                            
                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    padding: 12,
                                    fontSize: 16,
                                    marginBottom: 20,
                                    minHeight: 100,
                                    textAlignVertical: 'top',
                                }}
                                placeholder="Enter alarm description..."
                                value={description}
                                onChangeText={setDescription}
                                multiline={true}
                                numberOfLines={1}
                                maxLength={15}
                                autoFocus={true}
                            />
                            
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                gap: 10,
                            }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f0f0f0',
                                        padding: 12,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        setDescription('');
                                        setShowDescriptionModal(false);
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: '#666',
                                    }}>
                                        Clear
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'black',
                                        padding: 12,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                    }}
                                    onPress={() => setShowDescriptionModal(false)}
                                >
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: 'white',
                                    }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    )
}