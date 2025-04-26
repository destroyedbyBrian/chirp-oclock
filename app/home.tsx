import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    Pressable
} from "react-native";
import globalStyles from './styles/globalStyles';
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Card, Title, Paragraph } from "react-native-paper";
import { useState } from "react";
import { router } from 'expo-router';
import { useAlarmsStore } from '../stores/alarmsStore';


export default function HomeScreen() {
    const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
    const alarms = useAlarmsStore((s) => s.alarms);

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
                    alarms.map((alarm) => (
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