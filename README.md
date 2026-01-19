# 🐣 Chirp O'Clock

---

## 💻 Front-end Technologies
- ReactNative
- TypeScript
- Styled-components
- Expo

---

## 🔄 The Process

I started by grounding the project in research and hardware exploration, considering Arduino Nano and Raspberry Pi NFC modules. These early experiments helped me understand the challenges of custom hardware, including power management, battery sourcing, and portability, which ultimately made the hardware approach impractical for a consumer-ready solution.

Next, I shifted focus to using a smartphone with built-in NFC and passive NFC tags. This phase emphasized leveraging existing platform capabilities to simplify the product, while still enforcing the intended behavior of a physical interaction to dismiss alarms. By testing different NFC setups, I discovered iOS limitations, such as restrictions on background NFC scanning, which shaped how I implemented alarm dismissal logic.

From there, I built the app using React Native and Expo, iterating through Expo Go, Development Builds, and Expo Build. Each step helped me understand the end-to-end app publishing workflow, from development and testing to submission on the App Store. This experience taught me the nuances of managing bundle identifiers, provisioning profiles, and build pipelines.

As part of this process, I also explored alarm and notification handling, integrating react-native-push-notification and ensuring time-sensitive logic respected OS-level scheduling constraints. This was critical because JavaScript timers alone proved unreliable for alarms running in the background.

Finally, while working through Expo’s build system, I encountered cost considerations, learning how managed builds incur expenses and how that influences decisions between Expo managed vs bare workflows. This informed not only technical choices but also the overall project planning and trade-offs for future improvements.

---

## 📚 What I've Learned

**App publishing workflow**: Experienced the end-to-end process of publishing an app for the first time, including Expo Go, Expo Development Builds, and Expo Build for App Store deployment.

**Platform constraints**: Gained a clear understanding of iOS NFC limitations and how OS restrictions affect app functionality.

**Cost considerations**: Learned that Expo Build services incur costs, influencing decisions between managed vs. bare workflows.

**Mobile development insights**: Realized that smartphones often handle hardware constraints (power, NFC) better than custom microcontrollers, simplifying product design.

---

## 💡 How can it be improved

#### Technical
- Implement platform-native alarm APIs for more reliable wake behavior
- Reduce reliance on third-party notification libraries
- Improve NFC session handling and error states

#### Product 
- Support multiple NFC tags per alarm
  
---

## 📹 Preview

![Chirp O'Clock Demo](assets/readme/chirpoclock.gif)

Full video:  
https://github.com/user-attachments/assets/2c4ce80a-3d8f-4fe6-b3cb-520165315c8c
---
