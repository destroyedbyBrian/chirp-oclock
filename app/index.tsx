import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    Pressable,
    Platform
} from "react-native";
import globalStyles from './styles/globalStyles';
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Card, Title, Paragraph } from "react-native-paper";
import { useState, useEffect, useRef } from "react";
import { router } from 'expo-router';
import { useAlarmsStore } from '../stores/alarmsStore';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

export default function HomeScreen() {
    const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
    const alarms = useAlarmsStore((s) => s.alarms);

    // Push Notification State
    const [expoPushToken, setExpoPushToken] = useState('');  
    // const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);  
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);  
    const notificationListener = useRef<Notifications.EventSubscription>();  
    const responseListener = useRef<Notifications.EventSubscription>(); 

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
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: alarmDate
        },
        });
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));
        
        // Schedule notifications for all alarms
        alarms.forEach(alarm => scheduleAlarmNotification(alarm));
        
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
          });
      
          responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
          });
      
          return () => {
            notificationListener.current &&
              Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
              Notifications.removeNotificationSubscription(responseListener.current);
          };
    }, [])

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

async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
        try {
          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          if (!projectId) {
            throw new Error('Project ID not found');
          }
          token = (
            await Notifications.getExpoPushTokenAsync({
              projectId,
            })
          ).data;
          console.log(token);
        } catch (e) {
          token = `${e}`;
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }
    
      return token;
}

type Alarm = {
    id: string;
    hour: number;
    minute: number;
    ampm: string;
}

const CardComponent = (props: { alarm: Alarm }) => {
    return (
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