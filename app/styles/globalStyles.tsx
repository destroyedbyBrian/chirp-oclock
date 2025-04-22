import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
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
});

export default globalStyles;
