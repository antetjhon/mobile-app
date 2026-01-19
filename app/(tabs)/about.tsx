import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function About() {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in + fade in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="mr-3 rounded-full p-2"
          style={{ backgroundColor: "#f2f2f2" }}
        >
          <ArrowLeft color="#333" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">About eBPLS</Text>
      </View>

      {/* Animated Content */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
          flex: 1,
        }}
      >
        <ScrollView className="p-5">
          <Text className="text-base text-gray-700 leading-6 mb-4">
            The <Text className="font-semibold">Electronic Business Permits and Licensing System (eBPLS)</Text> 
            is designed to streamline business permit applications, improve transparency, and 
            enhance efficiency in local government units.
          </Text>

          <Text className="text-gray-700 leading-6 mb-3">
            • <Text className="font-semibold">Online application:</Text> Apply for new or renewed business permits from home.{"\n"}
            • <Text className="font-semibold">Digital process:</Text> Eliminates physical visits to government offices.{"\n"}
            • <Text className="font-semibold">Streamlined processing:</Text> Enables faster and more accurate LGU workflows.{"\n"}
            • <Text className="font-semibold">Online payment:</Text> Supports secure and convenient payments.{"\n"}
            • <Text className="font-semibold">Real-time status updates:</Text> Provides up-to-date application tracking.{"\n"}
            • <Text className="font-semibold">Unique tracking codes:</Text> Each permit can be easily verified.{"\n"}
            • <Text className="font-semibold">Data management:</Text> Generates detailed reports for better oversight.
          </Text>

          <Text className="text-sm text-gray-500 mt-10 text-center">
            Developed by the <Text className="font-semibold">Province of Leyte</Text>  
          </Text>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
