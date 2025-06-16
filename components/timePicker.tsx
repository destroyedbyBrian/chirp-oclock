import { Dimensions, View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import moment from "moment-timezone";
import { useState, useRef } from "react";
import * as Haptics from 'expo-haptics';


const SCREEN_HEIGHT = Dimensions.get("window").height;
const CARD_HEIGHT = 250;
const ITEM_HEIGHT = SCREEN_HEIGHT / 17;
const VISIBLE_ITEMS = 5; 

type HourPickerProps = {
    hour: number;
    onHourChange: (hour: number) => void;
};

const HourPicker: React.FC<HourPickerProps> = ({ hour, onHourChange }) => {
    const numbers = Array.from({ length: 12 }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );
    const infiniteNumbers = [...numbers, ...numbers, ...numbers];
    const scrollRef = useRef<ScrollView>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [hasInitialized, setHasInitialized] = useState(false);
  
    // Wait for layout before setting initial position
    const handleLayout = () => {
      if (!hasInitialized) {
        const now = moment();
        let initialHour = now.hour() % 12 || 12;
        const hourStr = String(initialHour).padStart(2, "0");
        const initialIndex = numbers.indexOf(hourStr);
        const safeInitialIndex = initialIndex === -1 ? 0 : initialIndex;
        const y =
          (numbers.length + safeInitialIndex - Math.floor(VISIBLE_ITEMS / 2)) * ITEM_HEIGHT;
        scrollRef.current?.scrollTo({ y, animated: false });
        onHourChange(initialHour);
        setScrollPosition(y);
        setHasInitialized(true);
      }
    };
  
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setScrollPosition(offsetY);

      const totalRows = numbers.length * 3;
      const centerIndex = Math.round(offsetY / ITEM_HEIGHT) + Math.floor(VISIBLE_ITEMS / 2);
      const trueIndex = centerIndex % totalRows;
      const numberIndex = trueIndex % numbers.length;
      const value = Number(numbers[numberIndex]);
      if (value !== hour) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        onHourChange(value);
      }
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const n = numbers.length;
      const currentTopIndex = Math.round(offsetY / ITEM_HEIGHT);
      const centerIndex = currentTopIndex + Math.floor(VISIBLE_ITEMS / 2);
  
      let numberIndex = centerIndex % n;
      if (numberIndex < 0) numberIndex += n;
      const centeredY =
        (n + numberIndex - Math.floor(VISIBLE_ITEMS / 2)) * ITEM_HEIGHT;
      if (Math.abs(centeredY - offsetY) > 1) {
        scrollRef.current?.scrollTo({ y: centeredY, animated: false });
        setScrollPosition(centeredY);
      }
    };
  
    const currentTopIndex = Math.round(scrollPosition / ITEM_HEIGHT);
    const centerVisibleIndex = currentTopIndex + Math.floor(VISIBLE_ITEMS / 2);
  
    return (
      <View onLayout={handleLayout} style={styles.container}>
        <ScrollView
          ref={scrollRef}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          bounces={false}
        >
          {infiniteNumbers.map((number, index) => {
            const distance = Math.abs(index - centerVisibleIndex);
            let color = "#f0f0f1";
            if (distance === 2) color = "#f0f0f1";
            else if (distance === 1) color = "#c3c4c7";
            else if (distance === 0) color = "#101517";
            return (
              <View key={index} style={styles.numberContainer}>
                <Text style={[styles.number, { color }]}>{number}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

type MinutePickerProps = {
    minute: number;
    onMinuteChange: (minute: number) => void;
};

const MinutePicker: React.FC<MinutePickerProps> = ({ minute, onMinuteChange }) => {
    const numbers = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
    const infiniteNumbers = [...numbers, ...numbers, ...numbers];
  
    const scrollRef = useRef<ScrollView>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Wait until layout before setting initial position
    const handleLayout = () => {
      if (!hasInitialized) {
        const now = moment();
        const initialMinute = now.minute();
        const minuteStr = String(initialMinute).padStart(2, "0");
        const initialIndex = numbers.indexOf(minuteStr);
        const safeInitialIndex = initialIndex === -1 ? 0 : initialIndex;
        const y = (numbers.length + safeInitialIndex - Math.floor(VISIBLE_ITEMS / 2)) * ITEM_HEIGHT;
        scrollRef.current?.scrollTo({ y, animated: false });
        onMinuteChange(initialMinute);
        setScrollPosition(y);
        setHasInitialized(true);
      }
    };
  
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setScrollPosition(offsetY);
      const totalRows = numbers.length * 3;
      const centerIndex = Math.round(offsetY / ITEM_HEIGHT) + Math.floor(VISIBLE_ITEMS / 2);
      const trueIndex = centerIndex % totalRows;
      const numberIndex = trueIndex % numbers.length;
      const value = Number(numbers[numberIndex]);
      if (value !== minute) {
        onMinuteChange(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      }
    };
  
    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const n = numbers.length;
      const currentTopIndex = Math.round(offsetY / ITEM_HEIGHT);
      const centerIndex = currentTopIndex + Math.floor(VISIBLE_ITEMS / 2);
  
      let numberIndex = centerIndex % n;
      if (numberIndex < 0) numberIndex += n;
      const centeredY = (n + numberIndex - Math.floor(VISIBLE_ITEMS / 2)) * ITEM_HEIGHT;
      if (Math.abs(centeredY - offsetY) > 1) {
        scrollRef.current?.scrollTo({ y: centeredY, animated: false });
        setScrollPosition(centeredY);
      }
    };
  
    const currentTopIndex = Math.round(scrollPosition / ITEM_HEIGHT);
    const centerVisibleIndex = currentTopIndex + Math.floor(VISIBLE_ITEMS / 2);
  
    return (
      <View style={styles.container} onLayout={handleLayout}>
        <ScrollView
          ref={scrollRef}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          bounces={false}
        >
          {infiniteNumbers.map((number, index) => {
            const distance = Math.abs(index - centerVisibleIndex);
            let color = "#f0f0f1";
            if (distance === 2) color = "#f0f0f1";
            else if (distance === 1) color = "#c3c4c7";
            else if (distance === 0) color = "#101517";
            return (
              <View key={index} style={styles.numberContainer}>
                <Text style={[styles.number, { color }]}>{number}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

const styles = StyleSheet.create({
    container: {
        height: CARD_HEIGHT,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    numberContainer: {
        height: ITEM_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
    number: {
        fontSize: 38,
        fontWeight: "bold",
    },
})

export { HourPicker, MinutePicker };