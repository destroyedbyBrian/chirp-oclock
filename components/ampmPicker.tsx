import React, { useRef, useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import moment from "moment-timezone";

const AMPM_ITEM_HEIGHT = 80;  // Smaller than hour/minute
const AMPM_VISIBLE_ITEMS = 2;

type AmPmProps = {
    ampm: string;
    onAmpmChange: (ampm: string) => void;
};

const AmPm: React.FC<AmPmProps> = ({ ampm, onAmpmChange }) => {
    const scrollRef = useRef<ScrollView>(null);
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const choices = ["am", "pm"];
    const infiniteChoices = [...choices, ...choices, ...choices];

    useEffect(() => {
        const now = new Date();
        const currentHr = now.getHours();

        if (currentHr < 12) {
            onAmpmChange("am")
        } else {
            onAmpmChange("pm")
        }
    }, [])

    const handleLayout = () => {
        const currentTime = moment();
        const currentAmPm = currentTime.format("a");
        const initialIndex = choices.indexOf(currentAmPm);
        const safeInitialIndex = initialIndex === -1 ? 0 : initialIndex;
        const y = (choices.length + safeInitialIndex - Math.floor(AMPM_VISIBLE_ITEMS / 2)) * AMPM_ITEM_HEIGHT;
        scrollRef.current?.scrollTo({ y, animated: false });
        onAmpmChange(ampm);
        setScrollPosition(y);
    }

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrollPosition(offsetY);

        const totalRows = choices.length * 3;
        const centerIndex = Math.round(offsetY / AMPM_ITEM_HEIGHT) + Math.floor(AMPM_VISIBLE_ITEMS / 2);
        const trueIndex = centerIndex % totalRows;
        const choiceIndex = trueIndex % choices.length;
        onAmpmChange(choices[choiceIndex]);
    };

    const handleMomentumScrollEnd = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const n = choices.length;

        const currentTopIndex = Math.round(offsetY / AMPM_ITEM_HEIGHT);
        const centerIndex = currentTopIndex + Math.floor(AMPM_VISIBLE_ITEMS / 2);

        let numberIndex = centerIndex % n;
        if (numberIndex < 0) numberIndex += n;

        const centeredY = (n + numberIndex - Math.floor(AMPM_VISIBLE_ITEMS / 2)) * AMPM_ITEM_HEIGHT;

        if (Math.abs(centeredY - offsetY) > 1) {
            scrollRef.current?.scrollTo({ y: centeredY, animated: false });
            setScrollPosition(centeredY);
        }
    };

    // Calculate center-visible index for coloring
    const currentTopIndex = Math.round(scrollPosition / AMPM_ITEM_HEIGHT);
    const centerVisibleIndex = currentTopIndex + Math.floor(AMPM_VISIBLE_ITEMS / 2);

    return (
        <View onLayout={handleLayout} style={styles.container}>
            <ScrollView
                ref={scrollRef}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                showsVerticalScrollIndicator={false}
                snapToInterval={AMPM_ITEM_HEIGHT}
                decelerationRate="fast"
                bounces={false}
                scrollEventThrottle={16}
            >
                {infiniteChoices.map((choice, index) => {
                    const distance = Math.abs(index - centerVisibleIndex);
                    let color = "#f0f0f1";
                    if (distance === 1) color = "#c3c4c7";
                    else if (distance === 0) color = "#101517";
                    return (
                        <View key={index} style={styles.numberContainer}>
                            <Text style={[styles.number, { color }]}>{choice}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: AMPM_ITEM_HEIGHT * AMPM_VISIBLE_ITEMS,
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },
    numberContainer: {
        height: AMPM_ITEM_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
    number: {
        fontSize: 30, 
        fontWeight: "bold",
        color: "#000",
        letterSpacing: 1.5,
    },
});

export default AmPm;