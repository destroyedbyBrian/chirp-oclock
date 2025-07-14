import { StyleSheet } from 'react-native';
import type { lightTheme as lightThemeType } from '@/theme/colors';

const indexStyles = (theme: typeof lightThemeType) => StyleSheet.create({
    card: {
        backgroundColor: theme.card,
        elevation: 1, 
        shadowColor: theme.shadow, 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderRadius: 12,
        marginBottom: 16,
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
        letterSpacing: 0.8,
        color: theme.text
    },
    caption: {
        color: theme.secondaryText,
        fontWeight: "500",
        fontSize: 14,
        marginBottom: -2,
        letterSpacing: 1.2,
    },
    addAlarmButton: {
        position: "absolute",
        bottom: 50, 
        alignSelf: "center", 
        zIndex: 10,
        transform: [{ scale: 1 }],
    },
    buttonPressed: {
        transform: [{ scale: 0.9 }],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        paddingBottom: 0,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        alignItems: "center",
        padding: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 15,
    },
    modalTitle: {
        fontWeight: '700',
        fontSize: 24,
        marginBottom: 8,
        color: "#222",
        letterSpacing: 0.3,
    },
    modalSubtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
        lineHeight: 22,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#000000",
        borderRadius: 22,
        paddingHorizontal: 28,
        paddingVertical: 14,
        marginBottom: 16,
        marginTop: 8,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    scanButtonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    scanButtonLabel: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    delete: {
        backgroundColor: 'red',
        overflow: 'hidden',
        position: 'absolute',
        right: 0
    },
    notificationIds: {
        marginTop: 8,
    },
    notificationId: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 20,
    },
    emptyStateIcon: {
        width: 160,
        height: 160,
        opacity: 0.82,
        alignSelf: 'center',
        resizeMode: 'contain',
        marginLeft: -16
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.subText,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: theme.subText,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default indexStyles;