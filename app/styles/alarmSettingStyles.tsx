import { StyleSheet } from 'react-native';
import type { lightTheme as lightThemeType } from '@/theme/colors';

const alarmSettingStyles  = (theme: typeof lightThemeType) =>  StyleSheet.create({
    cancelButton: {
        marginTop: -8,
        color: theme.text
    },
    doneButton: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: -12,
        color: theme.text
    },
    ringingIn: {
        color: theme.text,
        fontSize: 14,
        fontWeight: "bold",
        marginTop: -22,
        textAlign: "center"
    },
    cardContainer1: {
        marginTop: 30,
        width: 350,
        alignSelf: "center",
        backgroundColor: theme.card
    },
    cardContainer2: {
        marginTop: 30,
        width: 350,
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.card
    },
    cardContent1: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        margin: -15,
    },
    cardContent2: {
        paddingTop: -14,
    },
    cardContentText: {
        color: theme.text,
        fontSize: 18,
        fontWeight: "bold"
    },
    cardContentTextSecondary: {
        fontSize: 13,
        fontWeight: "bold",
        marginTop: -7,
        color: theme.subText
    },
    semiCollen: {
        fontSize: 36,
        fontWeight: "700",
        alignSelf: "center",
        marginTop: -6,
        color: theme.text
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
    deleteAlarmButtomn: {
        backgroundColor: theme.button,
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    deleteAlarmText: { 
        color: theme.buttonText,
        fontSize: 17, 
        fontWeight: '600',
    }
})

export default alarmSettingStyles;