import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f4e9",
    },
    scrollView: {
        paddingVertical: 45,
        paddingHorizontal: 20,
        backgroundColor: "#f5f4e9",
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
        letterSpacing: 0.4
    },
});

export default globalStyles;


// #f6f5e9