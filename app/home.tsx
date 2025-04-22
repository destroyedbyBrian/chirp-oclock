import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Card, Title, Paragraph } from "react-native-paper";
import { useState } from "react";


export default function HomeScreen() {
    const [newAlarmButtonPressed, setNewAlarmButtonPressed] = useState<boolean>(false);
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.subHeaderBar}>
                    <Text style={styles.subHeaderText}>Alarm</Text>
                    <TouchableOpacity>
                        <Ionicons 
                            name="menu-outline"
                            size={32}
                            color="black"
                            marginTop={-4}
                        />
                    </TouchableOpacity>
                </View>
                <CardComponent />
            </ScrollView>
            <TouchableOpacity 
                onPressIn={() => setNewAlarmButtonPressed(true)}
                onPressOut={() => setNewAlarmButtonPressed(false)}
                style={[styles.addAlarmButton, newAlarmButtonPressed && styles.buttonPressed]}>
                <Ionicons name="add-circle" size={70} color="black" />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const CardComponent = () => {
    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View>
                    <Paragraph style={styles.day}>
                        Mon, Tue
                    </Paragraph>
                    <Title style={styles.time}>
                        10:00 AM
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
    safeArea: {
        flex: 1,
        backgroundColor: "#F3F3F3",
    },
    scrollView: {
        paddingVertical: 45,
        paddingHorizontal: 20,
        backgroundColor: "#F3F3F3",
    },
    subHeaderBar: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 5,
        paddingBottom: 30,
    },
    subHeaderText: {
        fontSize: 35,
        marginTop: -11,
        fontWeight: "700",
    },
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