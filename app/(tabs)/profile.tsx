import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, Home as HomeIcon, IdCard, Info, LogOut, Newspaper, Phone, QrCode, Settings, UserRoundCog, } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Animated, BackHandler, Dimensions, Easing, Image, Modal, PanResponder, Pressable, ScrollView, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

interface User {
    firstname: string;
    lastname: string;
    [key: string]: any;
}

interface MenuItem {
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    action: () => void;
    isLogout?: boolean;
}

const screenWidth = Dimensions.get("window").width;

const Profile: React.FC = () => {
    const { user, logout: authLogout, isLoading } = useAuth();
    const [isAboutModalVisible, setAboutModalVisible] = useState(false);
    const router = useRouter();

    const slideAnim = useState(new Animated.Value(-screenWidth))[0];
    const fadeAnim = useState(new Animated.Value(0))[0];

    /** Clears user data when logging out */
    const clearAllData = () => console.log(" All profile data cleared");

    /** Handle Android back button → redirect home */
    useEffect(() => {
        const backAction = () => {
            router.push("/home");
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    /** Logout confirmation */
    const handleLogout = async () => {
        Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await authLogout();
                        clearAllData();
                        router.replace("/");
                    } catch {
                        clearAllData();
                        router.replace("/");
                    }
                },
            },
        ]);
    };

    /** Open About modal with smooth slide-in */
    const openAboutModal = () => {
        setAboutModalVisible(true);
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    /** Close About modal with slide-out */
    const closeAboutModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -screenWidth,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setAboutModalVisible(false));
    };

    /** Enable swipe left→right to close */
    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
            Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 10,

        onPanResponderMove: (_, gs) => {
            if (gs.dx > 0) {
                slideAnim.setValue(gs.dx);
                fadeAnim.setValue(Math.max(0, 1 - gs.dx / screenWidth));
            }
        },

        onPanResponderRelease: (_, gs) => {
            if (gs.vx > 0.5 || gs.dx > screenWidth * 0.25) {
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: screenWidth,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                ]).start(() => setAboutModalVisible(false));
            } else {
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 6,
                    useNativeDriver: true,
                }).start();
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    const menuItems: MenuItem[] = [
        { label: "About eBPLS", icon: Info, action: openAboutModal },
        { label: "Contact Us", icon: Phone, action: () => router.push("") },
        { label: "Settings", icon: Settings, action: () => router.push("") },
        { label: "Logout", icon: LogOut, action: handleLogout, isLogout: true },
    ];

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 mb-16">
                {/* HEADER */}
                <View className="bg-gray-100 p-6 flex-row items-center">
                    <Image
                        source={require("../../assets/images/leyte-logo.png")}
                        className="w-16 h-16 rounded-full mr-4"
                    />
                    <View>
                        <Text className="text-lg font-bold text-gray-800">
                            {user ? `${user.firstname} ${user.lastname}` : "Welcome"}
                        </Text>
                        <Text className="text-gray-500">
                            {user ? `${user.role} • ${user.username}` : "Your Profile"}
                        </Text>
                    </View>
                </View>

                {/* MENU */}
                <View className="mt-6">
                    {menuItems.map((item, i) => (
                        <Pressable
                            key={i}
                            onPress={item.action}
                            className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200"
                        >
                            <View className="flex-row items-center">
                                <item.icon size={22} color={item.isLogout ? "#ef4444" : "#2563eb"} />
                                <Text
                                    className={`ml-4 text-base ${item.isLogout ? "text-red-500" : "text-gray-800"
                                        }`}
                                >
                                    {item.label}
                                </Text>
                            </View>
                            {!item.isLogout && <ChevronRight size={22} color="#9ca3af" />}
                        </Pressable>
                    ))}
                </View>

                {/* FOOTER */}
                <View className="mt-10 mb-20 items-center">
                    <Text className="text-gray-400 text-xs">v .1</Text>
                    <Text className="text-gray-400 text-xs mt-1">
                        DEVELOPED BY Province OF LEYTE
                    </Text>
                </View>
            </ScrollView>

            {/* ✅ ABOUT MODAL */}
            <Modal
                visible={isAboutModalVisible}
                transparent
                animationType="none"
                onRequestClose={closeAboutModal}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        backgroundColor: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["transparent", "rgba(0,0,0,0.45)"],
                        }),
                    }}
                >
                    {/* Background Tap to Close */}
                    <Pressable
                        onPress={closeAboutModal}
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />

                    {/* Animated Modal Content */}
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={{
                            flex: 1,
                            backgroundColor: "white",
                            transform: [{ translateX: slideAnim }],
                            elevation: 6,
                            shadowColor: "#000",
                            shadowOpacity: 0.25,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 4,
                        }}
                    >
                        {/* HEADER */}
                        <View className="flex-row items-center justify-between px-4 py-5 bg-red-600">
                            <Pressable onPress={closeAboutModal} className="p-1">
                                <ArrowLeft color="white" size={22} />
                            </Pressable>
                            <Text className="text-white text-lg font-bold">About eBPLS</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* CONTENT */}
                        <ScrollView
                            scrollEventThrottle={16}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 15 }}
                        >
                            <Text className="text-gray-800 text-base leading-6 mb-4">
                                The Electronic Business Permits and Licensing System (eBPLS) is designed
                                to streamline business permit applications, improve transparency, and
                                enhance efficiency in local government units.
                            </Text>

                            <Text className="text-gray-700 text-base leading-6">
                                {`• Online application: Apply for new or renewed business permits from home.
                  • Digital process: Eliminates physical visits to government offices.
                  • Streamlined processing: Enables faster and more accurate LGU workflows.
                  • Real-time status updates: Provides up-to-date application tracking.
                  • Unique tracking codes: Each permit can be easily verified.
                  • Data management: Generates detailed reports for better oversight.`}
                            </Text>
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* NAVIGATION BAR */}
            <View className="absolute bottom-0 w-full flex-row justify-around items-center py-2 bg-white border-t border-gray-200 shadow-lg">
                <Pressable className="items-center flex-1" onPress={() => router.push("/home")}>
                    <HomeIcon size={22} color="#6b7280" />
                    <Text className="text-xs text-gray-500">Home</Text>
                </Pressable>
                <Pressable className="items-center flex-1">
                    <Newspaper size={22} color="#6b7280" />
                    <Text className="text-xs text-gray-500">Chat</Text>
                </Pressable>
                <Pressable className="items-center flex-1">
                    <QrCode size={22} color="#6b7280" />
                    <Text className="text-xs text-gray-500">Scan</Text>
                </Pressable>
                <Pressable className="items-center flex-1" onPress={() => router.push("/transaction")}>
                    <IdCard size={22} color="#6b7280" />
                    <Text className="text-xs text-gray-500">Transactions</Text>
                </Pressable>
                <Pressable className="items-center flex-1">
                    <UserRoundCog size={22} color="#2563eb" />
                    <Text className="text-xs text-blue-600 font-semibold">Profile</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default Profile;
