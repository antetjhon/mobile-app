// components/BottomMenu.tsx
import { useRouter } from "expo-router";
import { Home as HomeIcon, IdCard, Newspaper, QrCode, UserRoundCog } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function BottomMenu() {
  const router = useRouter();
  return (
    <View className="flex-row justify-around items-center py-2 bg-white border-t border-gray-200 shadow-lg">
      <Pressable className="items-center flex-1" onPress={() => router.push("/")}>
        <HomeIcon size={22} color="#2563eb" />
        <Text className="text-xs text-blue-600 font-semibold">Home</Text>
      </Pressable>
      <Pressable className="items-center flex-1">
        <Newspaper size={22} color="#6b7280" />
        <Text className="text-xs text-gray-500">Chat</Text>
      </Pressable>
      <Pressable className="items-center flex-1">
        <QrCode size={22} color="#6b7280" />
        <Text className="text-xs text-gray-500">Scan</Text>
      </Pressable>
      <Pressable className="items-center flex-1">
        <IdCard size={22} color="#6b7280" />
        <Text className="text-xs text-gray-500">Transactions</Text>
      </Pressable>
      <Pressable className="items-center flex-1" onPress={() => router.push("/profile")}>
        <UserRoundCog size={22} color="#6b7280" />
        <Text className="text-xs text-gray-500">Profile</Text>
      </Pressable>
    </View>
  );
}