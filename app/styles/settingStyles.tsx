import { StyleSheet } from 'react-native';
import type { lightTheme as lightThemeType } from '@/theme/colors';

const settingsStyles = (theme: typeof lightThemeType) => StyleSheet.create({
    wrapperCountainer: {
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
    card: {
        marginTop: 8,
        backgroundColor: theme.card
    },
    cardContent: {
        marginTop: -8,
    },
    cardOthers: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        marginTop: 10,
    },
    row2: {
        display: "flex",
        flexDirection: "row",
        marginHorizontal: -4,
        justifyContent: "space-between",
        alignItems: "center",
    },
    testNFCButton: {
        backgroundColor: theme.button,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
        width: 200,
        marginBottom: 8
    },
    testNFCText: {
        color: theme.buttonText,
        fontSize: 17, 
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.44)",
        justifyContent: "flex-end",
        paddingBottom: 0,
      },
      modalContent: {
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        alignItems: "center",
        padding: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 11,
      },
      modalTitle: {
        fontWeight: '700',
        fontSize: 22,
        marginBottom: 4,
        color: "#222",
        letterSpacing: 0.3,
      },
      modalSubtitle: {
        fontSize: 15,
        color: "#888",
        marginBottom: 18,
        textAlign: "center"
      },
      scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#000000",
        borderRadius: 22,
        paddingHorizontal: 25,
        paddingVertical: 11,
        marginBottom: 13,
        marginTop: 5,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 2,
      },
      scanButtonLabel: {
        color: "#ffffff",
        fontSize: 17,
        fontWeight: "600"
      },
      closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        borderRadius: 12,
      },
    howToUseContainer: {
        backgroundColor: theme.instructionCard,
        borderRadius: 18,
        padding: 18,
        margin: 12,
        marginTop: 10,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 1,
        borderColor: theme.text,
        borderWidth: 1
    },
    howToUseTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
        letterSpacing: 0.2,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        marginTop: 2,
    },
    stepBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.stepBadge,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    stepBadgeText: {
        color: "#ffffff",
        fontWeight: '700',
        fontSize: 16,
    },
    stepImage: {
        width: 70,
        height: 76,
        marginRight: 10,
        resizeMode: 'contain',
        opacity: 0.87
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        color: theme.text,
        fontWeight: '500',
    },
    questionIcon: {
        marginRight: 8, 
        fontSize: 26,
        color: theme.text
    }
})

export default settingsStyles;