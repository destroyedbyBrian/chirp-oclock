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
import globalStyles from "./styles/globalStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Card, Title, Paragraph } from "react-native-paper";
import { useState, useEffect, useRef, useMemo } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { useAlarmStore } from "../stores/alarmsStore";
import { useAlarmSoundStore } from "../stores/soundStore";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    runOnJS,
} from "react-native-reanimated";
import { zustandStorage } from "../storage/mmkvStorage";
import { STORAGE_KEYS } from '../storage/storageKeys';
import { useNfcStore } from '../stores/nfcStore';

// ---- ALARM OBJECT PROPERTIES
type Alarm = {
    id: string;
    hour: number;
    minute: number;
    ampm: string;
    notificationIdArray?: string[];
    enabled: boolean;
};
type AlarmWithNextDue = Alarm & { 
    nextDue: Date ;
};

function alarmCorePropsEqual(a: Alarm, b: Alarm) {
    // Add every "user controlled" property, but *not* notificationIdArray
    return (
        a.id === b.id &&
        a.hour === b.hour &&
        a.minute === b.minute &&
        a.ampm === b.ampm
        // label, repeat, etc if you have them
    );
}

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

export default function HomeScreen() {
    /* ---- CREATE LOCAL STATE to :
        - create an alarm button 
        - track NFC status
        - track NFC modal visibility
    */
    const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
    // const [nfcPromptVisible, setNfcPromptVisible] = useState<boolean>(false);

    /* ---- GET GLOBAL STATE for :
        - (alarmStore) all alarms
        - (soundStore) all properties 
    */
    const alarms = useAlarmStore(s => s.alarms);
    const isAlarmActive = useAlarmSoundStore(s => s.isAlarmRinging);
    const stopAlarmSound = useAlarmSoundStore(s => s.stopAlarmSound);
    const nfcPromptVisible = useNfcStore(s => s.nfcPromptVisible);
    const setNfcPromptVisible = useNfcStore(s => s.setNfcPromptVisible);
    
    // ---- MEMOIZED, SORTED, DEDUPED, nextDue ALARMS ARRAY ---
    const { sortedAlarms } = useMemo(() => {
        // De-duplicate by time (keeping last occurrence of dups)
        const uniqueAlarmsArray: Alarm[] = Array.from(
            new Map(
                alarms.map((alarm) => [
                    `${alarm.hour}:${alarm.minute} ${alarm.ampm}`.toLowerCase(),
                    alarm,
                ])
            ).values()
        );
        // Add nextDue property
        const enriched = uniqueAlarmsArray.map((alarm) => ({
            ...alarm,
            nextDue: getNextAlarmDate(alarm),
        }));
        // Sort by minutes after midnight
        enriched.sort((a, b) => {
            const aMinutes = get24Hour(a.hour, a.ampm) * 60 + a.minute;
            const bMinutes = get24Hour(b.hour, b.ampm) * 60 + b.minute;
            return aMinutes - bMinutes;
        });
        return { sortedAlarms: enriched };
    }, [alarms]);


    const doNfcScan = async () => {
        try {
            // First, ensure NFC is properly initialized
            if (!NfcManager.isSupported()) {
                console.log('NFC not supported');
                return;
            }

            // Request NFC technology and get tag
            await NfcManager.requestTechnology([NfcTech.Ndef]);
            const tag = await NfcManager.getTag();
            
            if (!tag) {
                console.log('No tag found');
                return;
            }

            // Stop the alarm sound FIRST if it's active
            if (isAlarmActive) {
                console.log('Stopping alarm sound after successful NFC scan...');
                try {
                    const currentSound = useAlarmSoundStore.getState().soundRef;
                    if (currentSound && typeof currentSound.stopAsync === 'function') {
                        await currentSound.stopAsync();
                        await currentSound.unloadAsync();
                    }
                    useAlarmSoundStore.getState().setSoundRef(null);
                    useAlarmSoundStore.getState().setIsAlarmRinging(false);
                    console.log('Alarm sound stopped successfully after NFC scan');
                } catch (soundError) {
                    console.log('Error stopping alarm sound after NFC scan:', soundError);
                }
            }

            // Update UI state
            setNfcPromptVisible(false);
            setSuccessfulNFC(true);

            // Then handle notifications
            try {
                await Notifications.cancelAllScheduledNotificationsAsync();
                await Notifications.dismissAllNotificationsAsync();
            } catch (notifError) {
                console.log('Error handling notifications:', notifError);
            }

            // Clear storage last
            try {
                zustandStorage.removeItem(STORAGE_KEYS.NEXT_ALARM_DUE);
            } catch (storageError) {
                console.log('Error clearing storage:', storageError);
            }

        } catch (e) {
            console.log('NFC scan error:', e);
            setSuccessfulNFC(false);
        } finally {
            // Always clean up NFC
            try {
                await NfcManager.cancelTechnologyRequest();
            } catch (cleanupError) {
                console.log('Error cleaning up NFC:', cleanupError);
            }
        }
    };

    // (QN) Why did it take in an argument alarm of type AlarmWithNextDue?
        // (QN) What even is type AlarmWithNextDue?
            // (ANS) Normal alarm type with nextDue date attribute, determines whether Alarm should be scheduled for today or tmrw.
        // (ANS + QN) newly updated type, why not just use that type from the start? 
            // (ANS) its reactive, notifications are cancelled and scheduled again, now the alarm is set for tmrw instead of later today. 
    async function scheduleAlarmNotification(alarm: AlarmWithNextDue) {
        // Don't schedule if alarm is disabled
        if (!alarm.enabled) {
            return;
        }
        // Cancel any existing notifications first
        if (alarm.notificationIdArray) {
            for (const notificationId of alarm.notificationIdArray) {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
            }
        }

        const alarmDate = alarm.nextDue;
        // (QN) What is "alarm-due-date"?
            // (ANS) storage key.
        // (QN) Why is the storage value alarmDate? Shouldn't it be alarm object?
            // (ANS) date alone contains the time info (hr, min, am/pm), so storing just the date in mmkv is more efficient.
        zustandStorage.setItem(STORAGE_KEYS.ALARM_DUE_DATE, { state: alarmDate });
        
        let currentTriggerDate = new Date(alarmDate.getTime());
        const triggerDates = [];

        // Collect the trigger dates. Create 12 notifications, each 3 seconds apart.
        for (let i = 0; i < 3; i++) {
            const nextDate = new Date(currentTriggerDate.getTime() + (i * 3 * 1000));
            triggerDates.push(nextDate);
        }
        
        // Schedule notifications for each date
        const notificationIds = await Promise.all(triggerDates.map(async (date, index) => {
            return await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⏰ Alarm",
                    body: `Alarm for ${alarm.hour.toString().padStart(2, "0")}:${alarm.minute
                        .toString()
                        .padStart(2, "0")} ${alarm.ampm.toUpperCase()} (tap to stop)`,
                    sound: "netflix.mp3",
                    data: { isChainNotification: true, chainIndex: index }
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: date,
                },
            });
        }));
        useAlarmStore.getState().updateAlarmNotifications(alarm.id, notificationIds);
    }    
    
    // State of prevSortedAlarmsRef tracked to be used after re-render to be compared with the newly sorted alarm
    const prevSortedAlarmsRef = useRef<AlarmWithNextDue[] | null>(null);
    useEffect(() => {
        let isSubscribed = true;  // For cleanup
        const prevAlarms = prevSortedAlarmsRef.current || [];
        const currentAlarms = sortedAlarms;

        // Added/deleted
        const addedOrDeleted =
        currentAlarms.length !== prevAlarms.length ||  // Check 1: Different number of alarms
        currentAlarms.some((a) => !prevAlarms.some((b) => b.id === a.id)) ||  // Check 2: New alarm added
        prevAlarms.some((a) => !currentAlarms.some((b) => b.id === a.id));    // Check 3: Alarm deleted
        
        // Modified core props only (ignore notificationIdArray, nextDue)
        const modified = currentAlarms.some((ca) => {
            const prev = prevAlarms.find((pa) => pa.id === ca.id);
            return prev && !alarmCorePropsEqual(prev, ca);
        });

        // Check if any alarm's enabled state changed
        const enabledStateChanged = currentAlarms.some((ca) => {
            const prev = prevAlarms.find((pa) => pa.id === ca.id);
            return prev && prev.enabled !== ca.enabled;
        });

        const hasMeaningfulChanges = addedOrDeleted || modified || enabledStateChanged;

        if (hasMeaningfulChanges && isSubscribed) {
            
            // First, cancel all existing notifications
            const cancelAllNotifications = async () => {
                try {
                    await Notifications.cancelAllScheduledNotificationsAsync();
                } catch (error) {
                    console.error('Error cancelling notifications:', error);
                }
            };

            // Then handle each alarm
            const updateNotifications = async () => {
                await cancelAllNotifications();
                // Only schedule notifications for enabled alarms
                for (const alarm of currentAlarms) {
                    if (alarm.enabled) {
                        await scheduleAlarmNotification(alarm);
                    } 
                }
            };
            updateNotifications();
        }

        prevSortedAlarmsRef.current = currentAlarms;

        // Cleanup function
        return () => {
            isSubscribed = false;
        };
    }, [sortedAlarms]);

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <ScrollView style={globalStyles.scrollView}>
                <View style={globalStyles.subHeaderBar}>
                    <Text style={globalStyles.subHeaderText}>Alarm</Text>
                    <Pressable onPress={() => router.push("/settings")}>
                        <Ionicons
                            name="menu-outline"
                            size={32}
                            color="black"
                            marginTop={-4}
                        />
                    </Pressable>
                </View>
                <Button title="Go to testNFC" onPress={() => router.push("/testRun/testNFC")} />
                <Button title="Go to testNoti" onPress={() => router.push("/testRun/testPushNoti")} />
                <Button title="Go to testGesture" onPress={() => router.push("/testRun/testGesture")} />
                {alarms.length === 0 ? (
                    <Text>No alarms yet.</Text>
                ) : (
                    sortedAlarms.map((alarm) => (
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
                            <Ionicons
                                name="card-outline"
                                size={24}
                                color="#fff"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.scanButtonLabel}>Scan Now</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Pressable
                onPressIn={() => setNewAlarmButtonPressed(true)}
                onPressOut={() => setNewAlarmButtonPressed(false)}
                onPress={() => router.push("/newAlarm")}
                style={[
                    styles.addAlarmButton,
                    newAlarmButtonPressed && styles.buttonPressed,
                ]}
            >
                <Ionicons name="add-circle" size={70} color="black" />
            </Pressable>
        </SafeAreaView>
    );
}

const RENDER_POSITION = 0;

function CardComponent({ alarm }: { alarm: AlarmWithNextDue }) {
    const triggerDeleteIcon = useSharedValue(false);
    const position = useSharedValue(RENDER_POSITION);
    const deleteAlarm = useAlarmStore((s) => s.deleteAlarm);
    const deletedRef = useRef<Boolean>(false);

    const handleDeletedAlarmData = async (id: string) => {
        // Get the alarm being deleted to access its notification IDs
        const alarmToDelete = useAlarmStore.getState().alarms.find((alarm: Alarm) => alarm.id === id);
        if (alarmToDelete?.notificationIdArray) {
            // Cancel all notifications for this alarm
            await Promise.all(
                alarmToDelete.notificationIdArray.map((notificationId: string) =>
                    Notifications.cancelScheduledNotificationAsync(notificationId)
                )
            );
        }
        // Also clear the next alarm due storage
        zustandStorage.removeItem(STORAGE_KEYS.NEXT_ALARM_DUE);
    };

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            "worklet";
            if (
                e.translationX < -150 &&
                !triggerDeleteIcon.value &&
                !deletedRef.current
            ) {
                triggerDeleteIcon.value = true;
                deletedRef.current = true;
                runOnJS(handleDeletedAlarmData)(alarm.id);
                runOnJS(deleteAlarm)(alarm.id);
            }
            if (e.translationX > 100) {
                e.translationX = withTiming(RENDER_POSITION, { duration: 2000 });
            }
            position.value = RENDER_POSITION + e.translationX;
        })
        .onEnd((e) => {
            const limit = RENDER_POSITION - 150;
            // Once card component passes a certain point to the left
            if (position.value < limit) {
                triggerDeleteIcon.value = true;
            } else {
                position.value = withTiming(RENDER_POSITION, { duration: 100 });
                triggerDeleteIcon.value = false;
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: position.value }],
    }));

    const toggleAlarm = useAlarmStore((s) => s.toggleAlarm);
    const toggleOnOff = (id: string) => {
        // Pass the opposite of current enabled state
        const newEnabledState = !alarm.enabled;
        toggleAlarm(id, newEnabledState);
    }

    return (
        <GestureHandlerRootView>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[animatedStyle, styles.card]}>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/editAlarm",
                                params: { id: alarm.id },
                            })
                        }
                    >
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <View>
                                    <Title style={styles.time}>
                                        {`${alarm.hour
                                            .toString()
                                            .padStart(2, "0")}:${alarm.minute
                                            .toString()
                                            .padStart(2, "0")} ${alarm.ampm}`}
                                    </Title>
                                    <Paragraph style={styles.caption}>
                                        Wake up
                                    </Paragraph>
                                    <Paragraph style={[styles.caption, { color: "#007AFF" }]}>
                                        Next: {alarm.nextDue.toLocaleString()}
                                    </Paragraph>
                                </View>
                                <Card.Actions>
                                    <Fontisto
                                        name={alarm.enabled ? "toggle-on": "toggle-off"}
                                        size={50}
                                        color= {alarm.enabled ? "black" : "grey"}
                                        marginRight={-10}
                                        onPress={() => toggleOnOff(alarm.id)}
                                    />
                                </Card.Actions>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
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
    }, 
    delete: {
        backgroundColor: 'red',
        overflow: 'hidden',
        position: 'absolute',
        right: 0
    },
    notificationIds: {
        marginTop: 8,
    },
    notificationId: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
})