import { useGlobalSearchParams, router } from 'expo-router';
import { useAlarmsStore } from '../stores/alarmsStore';
import { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import globalStyles from "./styles/globalStyles";
import alarmSettingStyles from "./styles/alarmSettingStyles";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Card, Title, Paragraph } from "react-native-paper";
import { HourPicker, MinutePicker } from "../components/timePicker";
import AmPm from "../components/ampmPicker";
import NfcManager, {NfcTech} from 'react-native-nfc-manager';


// Delete button at the bottom of the screen

export default function EditAlarmScreen() {
    const { id } = useGlobalSearchParams();
    const alarm = useAlarmsStore((s) => s.alarms.find((a) => a.id === id));

    const [hour, setHour] = useState(alarm?.hour || 6);
    const [minute, setMinute] = useState(alarm?.minute || 30);
    const [ampm, setAmpm] = useState(alarm?.ampm || "am");

    const updateAlarm = useAlarmsStore((s) => s.updateAlarm);
    const deleteAlarm = useAlarmsStore((s) => s.deleteAlarm);

    const handleDone = () => {
        // updateAlarm({
        //     hour: hour,
        //     minute: minute,
        //     ampm: ampm,
        // });
        router.push('/');
    }
    
}
