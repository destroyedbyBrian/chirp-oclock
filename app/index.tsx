import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Button
} from "react-native";
import globalStyles from './styles/globalStyles';
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Card, Title, Paragraph } from "react-native-paper";
import { useState, useEffect, useRef } from "react";
import { router } from 'expo-router';
import { useAlarmsStore } from '../stores/alarmsStore';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';


export default function HomeScreen() {
    const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
    const alarms = useAlarmsStore((s) => s.alarms);

    useEffect(() => {
        Notifications.cancelAllScheduledNotificationsAsync().then(() => {
            alarms.forEach(alarm => scheduleAlarmNotification(alarm));
        });
    }, [])

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

    async function scheduleAlarmNotification(alarm: Alarm) {
        const alarmDate = getNextAlarmDate(alarm);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "⏰ Alarm",
                body: `Alarm for ${alarm.hour.toString().padStart(2, "0")}:${alarm.minute
                .toString()
                .padStart(2, "0")} ${alarm.ampm.toUpperCase()}`,
                sound: "netflix.mp3"
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: alarmDate
            },
        });
    }

    // async function playSound() {
    //     const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/netflix.mp3'));
    //     setSound(sound);
    //     await sound.playAsync();
    // }

    // async function playSound() {
    //     const now = Date.now();
    //     console.log("[DEBUG] playSound() called at", now);
    //     // Play max once every 2 seconds (tweak as needed)
    //     if (now - lastSoundPlayedAt.current < 2000) {
    //         console.log("[DEBUG] playSound debounced: not playing sound");
    //       return;
    //     }
    //     lastSoundPlayedAt.current = now;
      
    //     // Stop previous sound
    //     if (soundRef.current) {
    //       try {
    //         await soundRef.current.stopAsync();
    //         await soundRef.current.unloadAsync();
    //       } catch (e) {}
    //       soundRef.current = null;
    //     }
    //     const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/netflix.mp3'));
    //     soundRef.current = sound;
    //     await sound.playAsync();
    //     console.log("[DEBUG] Sound played at", now);
    //   }


    // async function playSoundEndlessly() {
    //     // Stop and unload any existing sound first
    //     if (soundRef.current) {
    //         try {
    //             await soundRef.current.stopAsync();
    //             await soundRef.current.unloadAsync();
    //         } catch (e) { /* handle error if any */ }
    //         soundRef.current = null;
    //     }
    //     // Load the sound
    //     const { sound: newSound } = await Audio.Sound.createAsync(
    //         require('../assets/sounds/ringtone.mp3')
    //     );
    //     await newSound.setIsLoopingAsync(true);
    //     await newSound.playAsync();
    //     soundRef.current = newSound;
    // }
    
    // async function stopSound() {
    //     if (soundRef.current) {
    //         try {
    //             await soundRef.current.stopAsync();
    //             await soundRef.current.unloadAsync();
    //         } catch (e) {}
    //         soundRef.current = null;
    //     }
    // }
 
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
                {/* <Button title="Go to testPushNoti" onPress={()=> router.push('/testRun/testPushNoti')}></Button> */}
                <Button title="Go to testGesture" onPress={()=> router.push('/testRun/testGesture')}></Button>
                {alarms.length === 0 ? (
                    <Text>No alarms yet.</Text>
                ) : (
                    sortedAlarms.map((alarm: Alarm) => (
                        <CardComponent alarm={alarm} key={alarm.id} />
                    ))
                )}
            </ScrollView>
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

type Alarm = {
    id: string;
    hour: number;
    minute: number;
    ampm: string;
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
})

