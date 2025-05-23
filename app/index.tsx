import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Button, 
    Modal,
} from "react-native";
import globalStyles from './styles/globalStyles';
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Card, Title, Paragraph } from "react-native-paper";
import { useState, useEffect } from "react";
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { useAlarmsStore } from '../stores/alarmsStore';
import { useAlarmSoundStore } from '../stores/soundStore';
import { useAppStateStore } from "@/stores/appStateStore";


type Alarm = {
    id: string;
    hour: number;
    minute: number;
    ampm: string;
}

export default function HomeScreen() {
    const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
    const alarms = useAlarmsStore((s) => s.alarms);

    const isAlarmActive = useAlarmSoundStore(s => s.isAlarmRinging);
    const stopAlarmSound = useAlarmSoundStore(s => s.stopAlarmSound);

    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);

    const [nfcPromptVisible, setNfcPromptVisible] = useState<boolean>(false);
    const activeAlarm = alarms.length > 0 ? alarms[0] : undefined;

    const doNfcScan = async () => {
        try {
          await NfcManager.cancelTechnologyRequest();
        } catch {}
      
        try {
            await NfcManager.requestTechnology([NfcTech.Ndef]);
            await NfcManager.getTag();
            setSuccessfulNFC(true);
            // Multiple alerts
            await Notifications.cancelAllScheduledNotificationsAsync();
            Notifications.dismissAllNotificationsAsync();
            await stopAlarmSound();
            setNfcPromptVisible(false);   
        } catch (e) {
            setSuccessfulNFC(false);
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
      };

    useEffect(() => {
        Notifications.cancelAllScheduledNotificationsAsync().then(() => {
            alarms.forEach(alarm => scheduleAlarmNotification(alarm));
        });
    }, [])

    useEffect(() => {
        if (isAlarmActive && !nfcPromptVisible) {
            setNfcPromptVisible(true);
        }
    }, [isAlarmActive]);

    const uniqueAlarms = Array.from(new Map(alarms.map(alarm => [
        `${alarm.hour}:${alarm.minute} ${alarm.ampm}`, alarm
    ])).values());
    
    function alarmToMinutes(alarm: Alarm) {
        let hr = alarm.hour;
        if (alarm.ampm === "am") {
            if (hr === 12) hr = 0;
        } else if (alarm.ampm === "pm") {
            if (hr !== 12) hr += 12;
        }
        return hr * 60 + alarm.minute;
    }

    const sortedAlarms = uniqueAlarms.sort((a, b) => alarmToMinutes(a) - alarmToMinutes(b));

    function getNextAlarmDate(alarm: Alarm) {
        const now = new Date();
        let hour = alarm.hour;
        if (alarm.ampm.toUpperCase() === "AM") {
          if (hour === 12) hour = 0;
        } else if (alarm.ampm.toUpperCase() === "PM") {
          if (hour !== 12) hour += 12;
        }
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

    // async function scheduleForeGroundAlarmNotification(alarm: Alarm) {
    //     const alarmDate = getNextAlarmDate(alarm);
    //     await Notifications.scheduleNotificationAsync({
    //         content: {
    //             title: "⏰ Alarm",
    //             body: `Alarm for ${alarm.hour.toString().padStart(2, "0")}:${alarm.minute
    //             .toString()
    //             .padStart(2, "0")} ${alarm.ampm.toUpperCase()}`,
    //             sound: "netflix.mp3"
    //         },
    //         trigger: {
    //             type: Notifications.SchedulableTriggerInputTypes.DATE,
    //             date: alarmDate
    //         },
    //     });
    // }

    async function scheduleAlarmNotification(alarm: Alarm) {
        const alarmDate = getNextAlarmDate(alarm);
        // Schedule notifications every 2 seconds over 2 minutes (2*60/10 = 12)
        for (let i = 0; i < 12; i++) {
            const triggerDate = new Date(alarmDate.getTime() + i * 2 * 1000);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⏰ Alarm",
                    body: `Alarm for ${alarm.hour.toString().padStart(2, "0")}:${alarm.minute
                        .toString()
                        .padStart(2, "0")} ${alarm.ampm.toUpperCase()} (tap to stop)`,
                    sound: "netflix.mp3"
                },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: triggerDate
                    },
            });
        }
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <ScrollView style={globalStyles.scrollView}>
                <View style={globalStyles.subHeaderBar}>
                    <Text style={globalStyles.subHeaderText}>Alarm</Text>
                    
                    <Pressable onPress={() => router.push('/settings')}>
                        <Ionicons 
                            name="menu-outline"
                            size={32}
                            color="black"
                            marginTop={-4}
                        />
                    </Pressable>
                </View>
                <Button title="Go to testNFC" onPress={()=> router.push('/testRun/testNFC')}></Button>
                <Button title="Go to testNoti" onPress={()=> router.push('/testRun/testPushNoti')}></Button>
                <Button title="Go to testGesture" onPress={()=> router.push('/testRun/testGesture')}></Button>
                {alarms.length === 0 ? (
                    <Text>No alarms yet.</Text>
                ) : (
                    sortedAlarms.map((alarm: Alarm) => (
                        <CardComponent alarm={alarm} key={alarm.id} />
                    ))
                )}
            </ScrollView>
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
            <Pressable 
                onPressIn={() => setNewAlarmButtonPressed(true)}
                onPressOut={() => setNewAlarmButtonPressed(false)}
                onPress={() => router.push('/newAlarm')}
                style={[styles.addAlarmButton, newAlarmButtonPressed && styles.buttonPressed]}>
                <Ionicons name="add-circle" size={70} color="black" />
            </Pressable>
        </SafeAreaView>
    )
}

// Swipe Card Component to the left to show delete button.
    // Swipe right to cancel event.
    // Tap somewhere else other than the card to dismiss delete button.
// Tap on Card Component to bring user to editAlarm screen. ✅


const CardComponent = (props: { alarm: Alarm }) => {
    return (
        <TouchableOpacity onPress={() => router.push({ pathname: '/editAlarm', params: { id: props.alarm.id } })}>
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <View>
                        {/* <Paragraph style={styles.day}>
                            Mon, Tue
                        </Paragraph> */}
                        <Title style={styles.time}>
                            {`${props.alarm.hour.toString().padStart(2, "0")}:${props.alarm.minute.toString().padStart(2, "0")} ${props.alarm.ampm}`}
                        </Title>
                        <Paragraph style={styles.caption}>
                            Wake up
                        </Paragraph>
                        {/* <Paragraph style={styles.caption}>
                            {obj.caption || "Wake up"}
                        </Paragraph> */}
                    </View>
                    <Card.Actions>
                        <Fontisto
                            name="toggle-on"
                            size={50}
                            color="black"
                            marginRight={-10}
                        />
                    </Card.Actions>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 8,
        marginVertical: 8,
        backgroundColor: "#ffffff",
        elevation: 1,
    },
    cardContent: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    day: {
        fontWeight: "200",
        fontSize: 12,
        marginTop: -6,
    },
    time: {
        fontWeight: "700",
        fontSize: 30,
        marginBottom: -1,
    },
    caption: {
        fontWeight: "500",
        fontSize: 14,
        marginBottom: -2,
    },
    addAlarmButton: {
        position: "absolute",
        bottom: 50, // Adjust this value as needed for spacing from the bottom
        alignSelf: "center", // Center horizontally
        zIndex: 10, // Ensure it's on top of other elements
        transform: [{ scale: 1 }],
    },
    buttonPressed: {
        transform: [{ scale: 0.9 }],
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
    }
})

