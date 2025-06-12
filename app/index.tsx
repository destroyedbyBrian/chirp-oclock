// import {
//     SafeAreaView,
//     ScrollView,
//     View,
//     Text,
//     StyleSheet,
//     Pressable,
//     TouchableOpacity,
//     Button, 
//     Modal,
//     AppState
// } from "react-native";
// import globalStyles from './styles/globalStyles';
// import Ionicons from "@expo/vector-icons/Ionicons";
// import Fontisto from "@expo/vector-icons/Fontisto";
// import { Card, Title, Paragraph } from "react-native-paper";
// import { useState, useEffect, useRef, useMemo } from "react";
// import { router } from 'expo-router';
// import * as Notifications from 'expo-notifications';
// import NfcManager, {NfcTech} from 'react-native-nfc-manager';
// import { useAlarmStore } from '../stores/alarmsStore';
// import { useAlarmSoundStore } from '../stores/soundStore';
// import { useAppStateStore } from "@/stores/appStateStore";
// import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
// import Animated, {
//     useSharedValue,
//     withTiming,
//     useAnimatedStyle,
//     runOnJS,
//   } from 'react-native-reanimated';
// import { zustandStorage } from '../storage/mmkvStorage';


// // ---- ALARM OBJECT PROPERTIES
// type Alarm = {
//     id: string;
//     hour: number;
//     minute: number;
//     ampm: string;
//     notificationIdArray?: string[];
// }

// function alarmCorePropsEqual(a: Alarm, b: Alarm) {
//     // Add every "user controlled" property, but *not* notificationIdArray
//     return (
//     a.id === b.id &&
//     a.hour === b.hour &&
//     a.minute === b.minute &&
//     a.ampm === b.ampm
//     // label, repeat, etc if you have them
//     );
// }

// export default function HomeScreen() {
//     /* ---- CREATE LOCAL STATE to :
//         - create an alarm button 
//         - track NFC status
//         - track NFC modal visibility
//     */
//     const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
//     const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
//     const [nfcPromptVisible, setNfcPromptVisible] = useState<boolean>(false);
    
//     /* ---- GET GLOBAL STATE for :
//         - (alarmStore) all alarms
//         - (soundStore) all properties 
//     */
//     const alarms = useAlarmStore((s) => s.alarms);
//     const isAlarmActive = useAlarmSoundStore(s => s.isAlarmRinging);
//     const setAlarmActive = useAlarmSoundStore(s => s.setIsAlarmRinging);
//     const stopAlarmSound = useAlarmSoundStore(s => s.stopAlarmSound);

//     /* ---- NFC SCAN PROCEDURE :
//         1. Request for particular nfc technology 
//         2. Start to listen to tag
//         3. Set NFC status to True
//         4. Unload global sound
//         5. Cancel all scheduleed Notification related to alarm
//         6. Set NFC modal to False
//         7. 
//     */
//     const doNfcScan = async () => {
//         try {
//             await NfcManager.requestTechnology([NfcTech.Ndef]);
//             await NfcManager.start();
//             await NfcManager.getTag();
//             setSuccessfulNFC(true);

//             // ---- STOP alarm and clear all infos
//             await Notifications.cancelAllScheduledNotificationsAsync();
//             Notifications.dismissAllNotificationsAsync();
//             await stopAlarmSound();
//             setNfcPromptVisible(false);

//             // ---- DELETE persistent alarm due state
//             zustandStorage.removeItem('next-alarm-due')
//         } catch (e) {
//             setSuccessfulNFC(false);
//         } finally {
//             NfcManager.cancelTechnologyRequest();
//         }
//     };

//     /* ---- SCHEDULE ALARM : 
//         - make sure to schedule an OS noti for a specific datetime.
//         - persist (in MMKV, or in alarm state) the full datetime for each alarm (not just hour:minute).
//         - (At app resume/on foreground) for each alarm check 
//             - is this alarm enabled?
//             - is its scheduled datetime <= now and not yet 'handled'?
//         - Only trigger the soonest missed alarm
//             - clear all other old missed alarms

//         {
//             id: '1',
//             label: 'Morning',
//             enabled: true,
//             time: '6:30',
//             nextDue: '2024-06-13T06:30:00.000Z',
//             repeat: 'daily' // if repeating
//         },
//     */

//     /* ---- ALARM DUE :
//         - check for alarms meant for right now (or, in the last few minutes).
//     */

//     // useEffect(() => {
//     //     const subscription = AppState.addEventListener('change', (state) => {
//     //         if (state === 'active') {
//     //             // Give zustand-persist a moment to rehydrate
//     //             setTimeout(() => {
//     //                 const { isAlarmRinging } = useAlarmSoundStore.getState();
//     //                 if (isAlarmRinging && !nfcPromptVisible) {
//     //                     setNfcPromptVisible(true);
//     //                 }
//     //             }, 200);
//     //         }
//     //     });
//     //     return () => subscription.remove();
//     // }, [nfcPromptVisible]);

//     /* ---- REMOVE ALARM DUPLICATES :
//         - alarms.map(alarms => [...])  // For each alarm in the array, create a new array that contains e.g. "9.30AM", alarm object.
//         - new Map([...])  // Creates a Map object from k-v pairs that only stores unique keys, keep last if there're multiple.
//         - Array.from(...)  // converts Map values back into array.
//     */
//     const uniqueAlarms = Array.from(new Map(alarms.map(alarm => [
//         `${alarm.hour}:${alarm.minute} ${alarm.ampm}`, alarm
//     ])).values());
    
//     /* ---- CONVERT ALARM -> MINUTES :
//         - e.g. 7AM -> 420 minutes
//         - e.g. 7PM -> 1140 minutes
//     */
//     const alarmToMinutes = (alarm: Alarm) => {
//         let hr = alarm.hour;
//         if (alarm.ampm === "am") {
//             if (hr === 12) hr = 0;
//         } else if (alarm.ampm === "pm") {
//             if (hr !== 12) hr += 12;
//         }
//         return hr * 60 + alarm.minute;
//     }

//     /* ---- SORT ALARM IN ASCENDING ORDER :
//         - If a = 7AM & b = 7PM, 420 - 1140 = -720  // Since res is -ve, a (7AM) comes before b
//         - If a = 7PM & b = 7AM, 1140 - 420 = 720  // Since res is +ve, b (7PM) comes before a
//     */
//     const sortedAlarms = uniqueAlarms.sort((a, b) => alarmToMinutes(a) - alarmToMinutes(b));

//     /* ---- CHECK IF ALARM SHOULD BE SCHEDULED TODAY OR TMRW :
//         - If it's currently 2PM, and alarm is set for 7AM
//             - since 7AM is before 2PM, returns a date for 7AM for tmrw
//         - If it's currently 2PM, and alarm is set for 7PM
//             - since 7PM is after 2PM, returns a date for 7AM for today
//     */
//     const getNextAlarmDate = (alarm: Alarm) => {
//         const now = new Date();
//         let hour = alarm.hour;
//         if (alarm.ampm.toUpperCase() === "AM") {
//           if (hour === 12) hour = 0;
//         } else if (alarm.ampm.toUpperCase() === "PM") {
//           if (hour !== 12) hour += 12;
//         }
//         const alarmDate = new Date(
//           now.getFullYear(),
//           now.getMonth(),
//           now.getDate(),
//           hour,
//           alarm.minute,
//           0,
//           0
//         );
//         if (alarmDate <= now) {
//           alarmDate.setDate(alarmDate.getDate() + 1);
//         }
//         return alarmDate;
//       }

//     /* ---- ALARM NOTIFICATION :
//         1. Check if alarm should be scheduled for today or the next day.
//         2. Store alarm date into Persistence Storage.
//         3. Create multiple notifications for one alarm.
//         4. Store every notification ID as global state in notificationIdArray
//             - notificationIdArray = ["1", "2", ...] 
//     */
//     async function scheduleAlarmNotification(alarm: Alarm) {
//         // Cancel any existing notifications for this alarm first
//         if (alarm.notificationIdArray) {
//             for (const notificationId of alarm.notificationIdArray) {
//                 await Notifications.cancelScheduledNotificationAsync(notificationId);
//             }
//         }

//         const alarmDate = getNextAlarmDate(alarm);
//         const setNextAlarmDue = (alarmDate: Date) => {
//             zustandStorage.setItem('next-alarm-due', { state: alarmDate });
//         }
//         // setNextAlarmDue(alarmDate);
//         const notificationIds = [];
//         // Schedule notifications every 2 seconds over 2 minutes (2*60/10 = 12)
//         for (let i = 0; i < 12; i++) {
//             const triggerDate = new Date(alarmDate.getTime() + i * 3 * 1000);
//             const notificationId = await Notifications.scheduleNotificationAsync({
//                 content: {
//                     title: "⏰ Alarm",
//                     body: `Alarm for ${alarm.hour.toString().padStart(2, "0")}:${alarm.minute
//                         .toString()
//                         .padStart(2, "0")} ${alarm.ampm.toUpperCase()} (tap to stop)`,
//                     sound: "netflix.mp3"
//                 },
//                 trigger: {
//                     type: Notifications.SchedulableTriggerInputTypes.DATE,
//                     date: triggerDate,
//                 },
//             });
//             notificationIds.push(notificationId);
//         }
//         // Update the alarm store with the notification IDs
//         useAlarmStore.getState().updateAlarmNotifications(alarm.id, notificationIds);
//     }

//     /* ---- SCHEDULE ALARM (new/updated) :
//         1. Get previous state of alarms from store using useMemo
//             - check for new alarms created, current alarms modified, alarms deleted.
//             - if not changes, useMemo should just return value.
//         2. Filter alarms to find those that are New or Modified
//         3. Only schedule notifications for those in Step #2

//         [dependency] : cannot be alarms.length, becus it doesn't account for modified alarms.
//     */
    
//     // tracking changes of alarms in zustand global store and store it inside newly created uniqueAlarms that has no duplicates
//         // - only scheduleAlarmNotification when there is/are new alarm(s) created or current alarms being modified
//         // - no changes made -> no alarms should run scheduleAlarmNotification

//     // React to uniqueAlarms changes using useEffect: Schedule notifications only when the uniqueAlarms array (reference) changes.
//     const prevSortedAlarmsRef = useRef<Alarm[] | null>(null);

//     useEffect(() => {
//         const prevAlarms = prevSortedAlarmsRef.current || [];
//         const currentAlarms = sortedAlarms;
    
//         // Added/deleted
//         const addedOrDeleted =
//         currentAlarms.length !== prevAlarms.length ||
//         currentAlarms.some(a => !prevAlarms.some(b => b.id === a.id)) ||
//         prevAlarms.some(a => !currentAlarms.some(b => b.id === a.id));
    
//         // Modified core props only (ignore notificationIdArray)
//         const modified = currentAlarms.some(ca => {
//         const prev = prevAlarms.find(pa => pa.id === ca.id);
//         return prev && !alarmCorePropsEqual(prev, ca);
//         });
    
//         const hasMeaningfulChanges = addedOrDeleted || modified;
    
//         if (hasMeaningfulChanges) {
//         console.log("ALARM STATE CHANGED! Re-scheduling notifications...");
//         currentAlarms.forEach(alarm => {
//             scheduleAlarmNotification(alarm);
//         });
//         } else {
//         console.log("No meaningful alarm changes detected.");
//         }
    
//         prevSortedAlarmsRef.current = currentAlarms;
//     }, [sortedAlarms]);
  

//     return (
//         <SafeAreaView style={globalStyles.safeArea}>
//             <ScrollView style={globalStyles.scrollView}>
//                         <View style={globalStyles.subHeaderBar}>
//                             <Text style={globalStyles.subHeaderText}>Alarm</Text>
//                             <Text>Number of alarms: {alarms.length}</Text>
//                             <Pressable onPress={() => router.push('/settings')}>
//                                 <Ionicons 
//                                     name="menu-outline"
//                                     size={32}
//                                     color="black"
//                                     marginTop={-4}
//                                 />
//                             </Pressable>
//                         </View>
//                         <Button title="Go to testNFC" onPress={()=> router.push('/testRun/testNFC')}></Button>
//                         <Button title="Go to testNoti" onPress={()=> router.push('/testRun/testPushNoti')}></Button>
//                         <Button title="Go to testGesture" onPress={()=> router.push('/testRun/testGesture')}></Button>
//                         {alarms.length === 0 ? (
//                             <Text>No alarms yet.</Text>
//                         ) : (
//                             sortedAlarms.map((alarm: Alarm) => (
//                                 <CardComponent alarm={alarm} key={alarm.id} />
//                             ))
//                         )}
//             </ScrollView>
//             <Modal
//                 animationType="slide"
//                 transparent={true}
//                 visible={nfcPromptVisible}
//                 onRequestClose={() => setNfcPromptVisible(false)}
//                 >
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalContent}>
//                     <Text style={styles.modalTitle}>Scan NFC Tag</Text>
//                     <Text style={styles.modalSubtitle}>
//                         Hold your phone near the tag to dismiss alarm
//                     </Text>
//                     <Text style={styles.alarmTime}>10:10 AM</Text>
//                     <Pressable style={styles.scanButton} onPress={doNfcScan}>
//                         <Ionicons name="card-outline" size={24} color="#fff" style={{ marginRight: 6 }} />
//                         <Text style={styles.scanButtonLabel}>Scan Now</Text>
//                     </Pressable>
//                     </View>
//                 </View>
//             </Modal>  
//             <Pressable 
//                 onPressIn={() => setNewAlarmButtonPressed(true)}
//                 onPressOut={() => setNewAlarmButtonPressed(false)}
//                 onPress={() => router.push('/newAlarm')}
//                 style={[styles.addAlarmButton, newAlarmButtonPressed && styles.buttonPressed]}>
//                 <Ionicons name="add-circle" size={70} color="black" />
//             </Pressable>
//         </SafeAreaView>
//     )
// }

// const RENDER_POSITION = 0;

// function CardComponent ({ alarm }: { alarm: Alarm }) {
//     const triggerDeleteIcon = useSharedValue(false);
//     const position = useSharedValue(RENDER_POSITION);
//     const deleteAlarm = useAlarmStore((s) => s.deleteAlarm);
//     const deletedRef = useRef<Boolean>(false);

//     const handleData = (id: string) => {
//         Notifications.cancelScheduledNotificationAsync(id);
//     }

//     const panGesture = Gesture.Pan()
//         .onUpdate((e) => {
//             'worklet';
//             if (e.translationX < - 150 && !triggerDeleteIcon.value && !deletedRef.current) {
//                 triggerDeleteIcon.value = true;
//                 deletedRef.current = true;
//                 runOnJS(handleData)(alarm.id);
//                 runOnJS(deleteAlarm)(alarm.id);
//             }
//             if (e.translationX > 100) {
//                 e.translationX = withTiming(RENDER_POSITION, { duration: 2000 });
//             }
//             position.value = RENDER_POSITION + e.translationX;
//         })
//         .onEnd((e) => {
//             const limit = RENDER_POSITION - 150;
//             // Once card component passes a certain point to the left
//             if (position.value < limit) {
//                 triggerDeleteIcon.value = true;
//             } else {
//                 position.value = withTiming(RENDER_POSITION, { duration: 100 })
//                 triggerDeleteIcon.value = false;
//             }
//         })

//     const animatedStyle = useAnimatedStyle(() => ({
//         transform: [{ translateX: position.value }],
//     }));

//     return (
//         <GestureHandlerRootView>
//             <GestureDetector gesture={panGesture}>
//                 <Animated.View style={[animatedStyle, styles.card]}>
//                     <TouchableOpacity onPress={() => router.push({ pathname: '/editAlarm', params: { id: alarm.id } })}>
//                     <Card style={styles.card}>
//                         <Card.Content style={styles.cardContent}>
//                             <View>
//                                 {/* <Paragraph style={styles.day}>
//                                     Mon, Tue
//                                 </Paragraph> */}
//                                 <Title style={styles.time}>
//                                     {`${alarm.hour.toString().padStart(2, "0")}:${alarm.minute.toString().padStart(2, "0")} ${alarm.ampm}`} 
//                                 </Title>
//                                 <Paragraph style={styles.caption}>
//                                     Wake up
//                                 </Paragraph>
//                                 {/* <Paragraph style={styles.caption}>
//                                     {obj.caption || "Wake up"}
//                                 </Paragraph> */}
//                                 {/* {alarm.notificationIdArray && alarm.notificationIdArray.length > 0 && (
//                                     <View style={styles.notificationIds}>
//                                         {alarm.notificationIdArray.map((id, index) => (
//                                             <Text key={id} style={styles.notificationId}>
//                                                 Notification {index + 1}: {id}
//                                             </Text>
//                                         ))}
//                                     </View>
//                                 )} */}
//                             </View>
//                             <Card.Actions>
//                                 <Fontisto
//                                     name="toggle-on"
//                                     size={50}
//                                     color="black"
//                                     marginRight={-10}
//                                 />
//                             </Card.Actions>
//                         </Card.Content>
//                     </Card>
//                     </TouchableOpacity>
//                 </Animated.View>
//             </GestureDetector>
//         </GestureHandlerRootView>
//     )
// }


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
    AppState,
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
import { useAppStateStore } from "@/stores/appStateStore";
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

// ---- ALARM OBJECT PROPERTIES
type Alarm = {
    id: string;
    hour: number;
    minute: number;
    ampm: string;
    notificationIdArray?: string[];
};
type AlarmWithNextDue = Alarm & { nextDue: Date };

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
    const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);
    const [nfcPromptVisible, setNfcPromptVisible] = useState<boolean>(false);

    const alarms = useAlarmStore((s) => s.alarms);
    const isAlarmActive = useAlarmSoundStore((s) => s.isAlarmRinging);
    const stopAlarmSound = useAlarmSoundStore((s) => s.stopAlarmSound);
    
    // Display modal if alarm is set to trigger 
    useEffect(() => {
        if (isAlarmActive && !nfcPromptVisible) {
            setNfcPromptVisible(true);
        }
    }, [isAlarmActive]);

    // --- MEMOIZED, SORTED, DEDUPED, nextDue ALARMS ARRAY ---
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

    // ... (no need for uniqueAlarms, alarmToMinutes, sortedAlarms, getNextAlarmDate in body) ...

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

            setSuccessfulNFC(true);

            // Update UI state first to prevent any race conditions
            setNfcPromptVisible(false);

            // Then handle notifications
            try {
                await Notifications.cancelAllScheduledNotificationsAsync();
                await Notifications.dismissAllNotificationsAsync();
            } catch (notifError) {
                console.log('Error handling notifications:', notifError);
            }

            // Stop the alarm sound if it's active
            if (isAlarmActive) {
                try {
                    await stopAlarmSound();
                } catch (soundError) {
                    console.log('Error stopping alarm sound:', soundError);
                }
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
        // (QN) Why am I cancelling all the scheduled notifications for one alarm?
            // (ANS) Prevent duplicates of old notifications
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
        for (let i = 0; i < 12; i++) {
            const nextDate = new Date(currentTriggerDate.getTime() + (i * 3 * 1000));
            triggerDates.push(nextDate);
        }
        
        // Schedule notifications for each date
        const notificationIds = await Promise.all(triggerDates.map(async date => {
            return await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⏰ Alarm",
                    body: `Alarm for ${alarm.hour.toString().padStart(2, "0")}:${alarm.minute
                        .toString()
                        .padStart(2, "0")} ${alarm.ampm.toUpperCase()} (tap to stop)`,
                    sound: "netflix.mp3",
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

        const hasMeaningfulChanges = addedOrDeleted || modified;

        if (hasMeaningfulChanges) {
            console.log("ALARM STATE CHANGED! Re-scheduling notifications...");
            currentAlarms.forEach((alarm) => {
                scheduleAlarmNotification(alarm);
            });
        } else {
            console.log("No meaningful alarm changes detected.");
        }

        prevSortedAlarmsRef.current = currentAlarms;
    }, [sortedAlarms]);

    // Display modal if alarm is set to trigger 
    // useEffect(() => {
    //     if (isAlarmActive && !nfcPromptVisible) {
    //         setNfcPromptVisible(true);
    //     }
    //     return () => {
    //         setNfcPromptVisible(false);
    //     }
    // }, [isAlarmActive])

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <ScrollView style={globalStyles.scrollView}>
                <View style={globalStyles.subHeaderBar}>
                    <Text style={globalStyles.subHeaderText}>Alarm</Text>
                    <Text>Number of alarms: {alarms.length}</Text>
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

    const handleDeletedAlarmData = (id: string) => {
        Notifications.cancelScheduledNotificationAsync(id);
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
                                        name="toggle-on"
                                        size={50}
                                        color="black"
                                        marginRight={-10}
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