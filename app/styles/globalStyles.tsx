import { StyleSheet } from 'react-native';
import type { lightTheme as lightThemeType } from '@/theme/colors';

const createGlobalStyles = (theme: typeof lightThemeType) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.safeArea
    },
    scrollView: {
        paddingVertical: 45,
        paddingHorizontal: 20,
        backgroundColor: theme.scrollView,
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
        letterSpacing: 0.4,
        color: theme.subHeaderText
    },
});

export default createGlobalStyles;

