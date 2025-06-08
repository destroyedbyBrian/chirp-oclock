/* 
  in newAlarm.tsx? : 
    - Attach Pan Gesture to each individual alarm
  in index.tsx : 
    - put resetGesture (tap view) to reset Pan Gesture
    - Pan Gestures shouldn't stack, no pan gestures should be triggered at once
*/

import { StyleSheet, SafeAreaView, View, Pressable } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

const END_POSITION = 0;
const START_POSITION = 120;

export default function App() {
  const onRight = useSharedValue(true);
  const position = useSharedValue(START_POSITION);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (onRight.value) {
        position.value = START_POSITION + e.translationX;
      } else {
        position.value = END_POSITION + e.translationX;
      }
    })
    .onEnd((e) => {
      if (position.value < START_POSITION / 2) {
        position.value = withTiming(END_POSITION, { duration: 100 });
        onRight.value = false;
      } else {
        position.value = withTiming(START_POSITION, { duration: 100 });
        onRight.value = true;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  const resetGesture = Gesture.Tap()
    .onEnd((e) => {
      position.value = START_POSITION;
      onRight.value = true;
    })

    return (
      <SafeAreaView>
        <GestureHandlerRootView>
          <GestureDetector gesture={resetGesture}>
            <>
              <View style={styles.outOfContainer}>
              <Pressable style={styles.container}>
                <Pressable onPress={() => {alert("hi")}}>
                  <Ionicons name="trash-outline" size={60} color="black" style={styles.delete} />
                </Pressable>
                <GestureDetector gesture={panGesture}>
                  <Animated.View style={[styles.box1, animatedStyle]} />
                </GestureDetector>
              </Pressable>
              </View>
            </>
          </GestureDetector>
        </GestureHandlerRootView>S
      </SafeAreaView> 
    );
}



const styles = StyleSheet.create({
  box1: {
    height: 120,
    width: 120,
    backgroundColor: 'green',
    borderRadius: 20,
    marginBottom: 30,
  },
  container: {
    height: 120,
    width: 220,
    backgroundColor: 'purple',
  },
  delete: {
    backgroundColor: 'red',
    overflow: 'hidden',
    position: 'absolute',
    right: 0
  },
  outOfContainer: {
    backgroundColor: 'blue',
    height: 620,
    width: 220,
  }
});