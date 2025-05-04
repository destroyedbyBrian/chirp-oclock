import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
} from "react-native";
import globalStyles from "./styles/globalStyles";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Card, Title, Paragraph } from "react-native-paper";
import { HourPicker, MinutePicker } from "../components/timePicker";
import AmPm from "../components/ampmPicker";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { useNewAlarmStore } from '../stores/newAlarmStore';
import { useAlarmsStore } from '../stores/alarmsStore';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';



export default function NewAlarmScreen() {
    const [successfulNFC, setSuccessfulNFC] = useState<boolean>(false);

    const hour = useNewAlarmStore((s) => s.hour);
    const minute = useNewAlarmStore((s) => s.minute);
    const ampm = useNewAlarmStore((s) => s.ampm);

    const setHour = useNewAlarmStore((s) => s.setHour);
    const setMinute = useNewAlarmStore((s) => s.setMinute);
    const setAmpm = useNewAlarmStore((s) => s.setAmpm);

    const addAlarm = useAlarmsStore((s) => s.addAlarm);

    const handleDone = () => {
        addAlarm({
          id: Date.now().toString(), // simple unique id
          hour: hour,
          minute: minute,
          ampm: ampm,
          });
        router.push('/');
      };

    const [testNFCButton, setTestNFCButton] = useState<boolean>(false);

    useEffect(() => {
        let cancelled = false;
        if (testNFCButton) {
          (async () => {
            try {
              await NfcManager.start();
              await NfcManager.requestTechnology([
                NfcTech.Ndef
              ]);
              const tag = await NfcManager.getTag();
              console.log('NFC Tag:', tag);
              setSuccessfulNFC(true);
            } catch (e) {
              console.warn('NFC error:', e);
            } finally {
              if (!cancelled) {
                NfcManager.cancelTechnologyRequest();
              }
            }
          })();
        }
        return () => { cancelled = true }
      }, [testNFCButton])
      


    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.scrollView}>
                <View style={[globalStyles.subHeaderBar, {flexDirection: "row", alignItems: "center"}]}>
                    <Feather 
                        name="x"
                        size={24}
                        color="black"
                        style={styles.cancelButton}
                        // onPress={() => router.back()}
                        onPress={() => router.push('/')}
                    />
                    <Text style={[globalStyles.subHeaderText, {fontSize: 24, marginLeft: 24}]}>New Alarm</Text>
                    <Pressable>
                        <Text 
                            style={styles.saveButton}
                            onPress={() => {
                                handleDone()
                                router.push('/')
                            }}
                        >Done</Text>
                    </Pressable>
                </View>
                <Text style={styles.subHeader2}>Ring in 7hours: 24 minutes</Text>
                <Card style={styles.cardContainer1}>
                    <Card.Content style={styles.cardContent1}>
                        <HourPicker onHourChange={setHour} />
                        <Text style={styles.semiCollen}>:</Text>
                        <MinutePicker onMinuteChange={setMinute} />
                        <AmPm onAmpmChange={setAmpm} />
                    </Card.Content>
                </Card>
                <Card style={styles.cardContainer2}>
                    <Card.Content style={styles.cardContent2}>
                        <View style={styles.row}>
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
                        <View style={styles.row}>
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
                            <View style={styles.row}>
                                <View>
                                    <Title style={{ fontSize: 18, fontWeight: "bold" }}>NFC Link</Title>
                                    <Paragraph
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "bold",
                                            color: "grey",
                                            marginTop: -7,
                                        }}
                                    >No Tags Connected</Paragraph>
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


const styles = StyleSheet.create({
    cancelButton: {
        marginTop: -8
    },
    saveButton: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: -12
    },
    subHeader2: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: -22,
        textAlign: "center"
    },
    cardContainer1: {
        marginTop: 30,
        width: 350,
        alignSelf: "center",
    },
    cardContainer2: {
        marginTop: 30,
        width: 350,
        display: "flex",
        flexDirection: "column",
    },
    cardContent1: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        margin: -15,
    },
    cardContent2: {
        paddingTop: -14,
    },
    semiCollen: {
        fontSize: 36,
        fontWeight: "700",
        alignSelf: "center",
    },
    row: {
        paddingTop: 14,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalWrapper: {
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: 12,
        paddingHorizontal: 6,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    },
    modalCard: {
        marginHorizontal: 3,
        backgroundColor: "#ffffff",
        elevation: 1,
        borderRadius: 20,
        marginBottom: 10,
        width: "95%",
        alignSelf: "center",
    },
    modalContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    iconWrapper: {
        position: "relative",
        height: 160, // Match the size of the Entypo circle
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        position: "absolute",
        width: 100, // Same as the circle
        height: 62, // This reduces the height to show only 3/4 of the phone icon
        overflow: "hidden", // Cut off the top portion of the phone
        justifyContent: "center",
        alignItems: "center",
    },
    closeNFCModal: {
        backgroundColor: "#F3F3F3",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
        marginTop: 40,
        marginBottom: 4,
    },
})

