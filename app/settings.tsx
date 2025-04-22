import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
} from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Entypo from "@expo/vector-icons/Entypo";
import globalStyles from './styles/globalStyles';
import { router } from "expo-router";


export default function SettingsScreen() {
    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <ScrollView style={globalStyles.scrollView}>
                <View style={[globalStyles.subHeaderBar, {justifyContent: "flex-start"}]}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons
                            name="return-up-back"
                            size={28}
                            color="black"
                            style={{ paddingRight: 15, marginTop: -8 }}
                        />
                    </Pressable>
                    <Text style={[globalStyles.subHeaderText, {fontSize: 28}]}>Settings</Text>
                </View>
                <View style={styles.wrapperCountainer}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            Linked NFC Tags
                    </Text>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.row}>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <MaterialCommunityIcons
                                        name="nfc"
                                        size={24}
                                        color="black"
                                    />
                                    <Title
                                        style={{
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            marginTop: -3,
                                            paddingLeft: 16,
                                        }}
                                    >
                                        04-55-F5-72-5D-64-80
                                    </Title>
                                </View>
                                <SimpleLineIcons
                                    name="options-vertical"
                                    size={17}
                                    color="black"
                                    style={{ marginTop: 2 }}
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <MaterialCommunityIcons
                                        name="nfc"
                                        size={24}
                                        color="black"
                                    />
                                    <Title
                                        style={{
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            marginTop: -3,
                                            paddingLeft: 16,
                                        }}
                                    >
                                        02-W2-DF-22-F2-L0-78
                                    </Title>
                                </View>
                                <SimpleLineIcons
                                    name="options-vertical"
                                    size={17}
                                    color="black"
                                    style={{ marginTop: 2 }}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
                <View style={styles.wrapperCountainer}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            Others
                    </Text>
                    <View>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.row2}>
                                <View>
                                    <Title
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Date & Time
                                    </Title>
                                    <Paragraph
                                        style={{
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            color: "grey",
                                            marginTop: -6,
                                        }}
                                    >
                                        System Time
                                    </Paragraph>
                                </View>
                                <Entypo
                                    name="chevron-right"
                                    size={26}
                                    color="black"
                                    style={{
                                        alignSelf: "center",
                                    }}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    wrapperCountainer: {
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
    card: {
        marginTop: 8,
        backgroundColor: "#ffffff",
    },
    cardContent: {
        marginTop: -10,
        minHeight: 80,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        marginTop: 10,
    },
    row2: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
})



