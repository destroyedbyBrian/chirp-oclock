import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Pressable,
} from "react-native";
import globalStyles from "./styles/globalStyles";
import Feather from "@expo/vector-icons/Feather";
import { Card } from "react-native-paper";
import { HourPicker, MinutePicker } from "../components/timePicker";
import AmPm from "../components/ampmPicker";


export default function NewAlarmScreen() {
    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.scrollView}>
                <View style={[globalStyles.subHeaderBar, {flexDirection: "row", alignItems: "center"}]}>
                    <Feather
                        name="x"
                        size={24}
                        color="black"
                        style={styles.cancelButton}
                    />
                    <Text style={[globalStyles.subHeaderText, {fontSize: 24, marginLeft: 24}]}>New Alarm</Text>
                    <Pressable>
                        <Text style={styles.saveButton}>Done</Text>
                    </Pressable>
                </View>
                <Text style={styles.subHeader2}>Ring in 7hours: 24 minutes</Text>
                <Card style={styles.cardContainer}>
                    <Card.Content style={styles.cardContent1}>
                        <HourPicker onHourChange={() => {}} />
                        <Text style={styles.semiCollen}>:</Text>
                        <MinutePicker onMinuteChange={() => {}} />
                        <AmPm />
                    </Card.Content>
                </Card>
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
    cardContainer: {
        marginTop: 30,
        width: 350,
        alignSelf: "center",
    },
    cardContent1: {
        // display: "flex",
        flexDirection: "row",
        // alignItems: "center",
        justifyContent: "space-evenly",
        margin: -15,
    },
    semiCollen: {
        fontSize: 36,
        fontWeight: "700",
        alignSelf: "center",
    },
})

