import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import axios from "axios";
import { Camera, CameraView } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Info, Lock, QrCode, Settings2, User, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, BackHandler, Dimensions, Easing, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { getApiUrl, isApiConfigured } from "../utils/api";


const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error = "",
  showPasswordToggle = false,
  onTogglePassword,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}) => (
  <View className="w-full mb-3">
    <View className={`flex-row items-center border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl bg-white/95 px-4 shadow-sm`} style={{ minHeight: 52 }}>
      <View className="mr-3">{icon}</View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        className="flex-1 text-gray-800 text-base"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={{ paddingVertical: 14 }}
      />
      {showPasswordToggle && (
        <Pressable onPress={onTogglePassword} className="ml-2">
          {secureTextEntry ? (
            <EyeOff color="#6b7280" size={20} />
          ) : (
            <Eye color="#6b7280" size={20} />
          )}
        </Pressable>
      )}
    </View>
    {error ? (
      <Text className="text-red-300 text-xs mt-1 ml-2">{error}</Text>
    ) : null}
  </View>
);

export default function LoginForm() {
  const { setUser, refetchUser } = useAuth()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [savedApiUrl, setSavedApiUrl] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const router = useRouter();

  // Get screen dimensions
  const { width, height } = Dimensions.get('window');

  // ✅ Check if API is configured on mount
  useEffect(() => {
    checkApiConfiguration();
  }, []);

  const checkApiConfiguration = async () => {
    try {
      const configured = await isApiConfigured();

      if (!configured) {
        Alert.alert(
          "API Not Configured",
          "Please configure your API settings first.",
          [
            {
              text: "Configure Now",
              onPress: () => router.replace("/next"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("[LOGIN] Error checking API configuration:", error);
    }
  };

  const handleNavigateToConfig = async () => {
    Alert.alert(
      "Change Configuration",
      "Changing your API configuration will clear all saved data and log you out. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              console.log("[CONFIG] Starting data clear process...");

              // 1. Try to logout from server if possible
              if (savedApiUrl) {
                try {
                  await axios.post(`${savedApiUrl}/logout`, {}, {
                    withCredentials: true,
                    timeout: 2000
                  });
                  console.log("[CONFIG] Server logout successful");
                } catch (err) {
                  console.log("[CONFIG] Server logout skipped");
                }
              }

              // 2. Clear all AsyncStorage data
              await AsyncStorage.clear();
              console.log("[CONFIG] AsyncStorage cleared");

              // 3. Clear local component state
              setSavedApiUrl("");
              setSelectedMunicipality("");
              setUsername("");
              setPassword("");
              setErrors({ username: "", password: "" });
              console.log("[CONFIG] Local state cleared");

              // 4. Clear axios headers
              delete axios.defaults.headers.common['Authorization'];

              setLoading(false);

              // 5. Navigate to configuration screen
              router.replace("/next");

              console.log("[CONFIG] Navigation to config screen complete");

            } catch (error) {
              console.error("[CONFIG] Error during data clear:", error);
              setLoading(false);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          }
        }
      ]
    );
  };


  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      rotateAnim.stopAnimation();
      fadeAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [loading]);

  // Rotation value
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get API URL from storage
        const API_URL = await getApiUrl();

        const response = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
          timeout: 3000
        })

        if (response.data && response.data.id) {
          console.log("[LOGIN] Active session found, redirecting to home")
          router.replace("/home")
        }
      } catch (error: any) {
        if (error.message && error.message.includes("API configuration")) {
          // API not configured
          console.log("[LOGIN] API not configured");
        } else {
          console.log("[LOGIN] No active session")
        }
      }
    }

    checkSession()
  }, [])

  useFocusEffect(
    useCallback(() => {
      console.log("[LOGIN] Screen focused - reloading API configuration");
      loadSavedApiConfig();
      return () => {
        // Cleanup if needed
        console.log("[LOGIN] Screen unfocused");
      };
    }, [])
  );

  const loadSavedApiConfig = async () => {
    try {
      const apiUrl = await AsyncStorage.getItem("API_URL");
      const municipality = await AsyncStorage.getItem("@ebpls_selected_municipality");
      const option = await AsyncStorage.getItem("@ebpls_config_option");

      if (apiUrl) {
        setSavedApiUrl(apiUrl);
      }

      if (municipality && option === 'municipality') {
        setSelectedMunicipality(municipality);
      }

      console.log("[LOGIN] Loaded API config:", { apiUrl, municipality, option });
    } catch (error) {
      console.error("[LOGIN] Error loading API config:", error);
    }
  };

  // Add this helper function to format municipality names
  const formatMunicipalityName = (municipality: string): string => {
    if (!municipality) return "";

    const nameMap: { [key: string]: string } = {
      baybay: "Baybay City",
      tabango: "Tabango",
      sanisidro: "San Isidro",
      capoocan: "Capoocan",
      tunga: "Tunga",
      barugo: "Barugo",
      stafe: "Sta. Fe",
      dagami: "Dagami",
      babatngon: "Babatngon",
    };

    return nameMap[municipality] || municipality.charAt(0).toUpperCase() + municipality.slice(1);
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (showScanner) {
        setShowScanner(false);
        setScanned(false);
        return true;
      }

      Alert.alert(
        "Exit App?",
        "Are you sure you want to exit?",
        [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel"
          },
          {
            text: "Exit",
            onPress: () => BackHandler.exitApp(),
            style: "destructive"
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showScanner]);

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
    };

    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const performLogin = async (user: string, pass: string) => {
    setLoading(true);

    // ✅ Create timeout for 10 seconds
    const timeoutDuration = 10000; // 10 seconds
    let loginTimeoutId: NodeJS.Timeout | null = null;
    let userTimeoutId: NodeJS.Timeout | null = null;

    try {
      console.log("[LOGIN] Attempting login for user:", user);

      // ✅ Get API URL from storage with timeout handling
      let API_URL: string;
      try {
        API_URL = await Promise.race([
          getApiUrl(),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error("API_TIMEOUT")), timeoutDuration)
          )
        ]);
      } catch (error: any) {
        if (error.message === "API_TIMEOUT" || error.message?.includes("API configuration")) {
          Alert.alert(
            "API Configuration Error",
            "Unable to load API configuration. Please check your settings.",
            [
              {
                text: "Go to Settings",
                onPress: () => router.replace("/next"),
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]
          );
          setLoading(false);
          return;
        }
        throw error;
      }

      console.log("[LOGIN] Using API URL:", API_URL);

      // Clear old session
      try {
        await axios.post(`${API_URL}/logout`, {}, {
          withCredentials: true,
          timeout: 2000
        });
      } catch (err) {
        console.log("[LOGIN] No old session to clear");
      }

      // ✅ Perform login with timeout
      const loginPromise = axios.post(
        `${API_URL}/login`,
        { username: user, password: pass },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: timeoutDuration,
        }
      );

      const response = await Promise.race([
        loginPromise,
        new Promise<never>((_, reject) => {
          loginTimeoutId = setTimeout(() => {
            reject(new Error("LOGIN_TIMEOUT"));
          }, timeoutDuration);
        })
      ]);

      if (loginTimeoutId) clearTimeout(loginTimeoutId);

      console.log("[LOGIN] Login response:", response.data);

      // ✅ Fetch user data from /me with timeout
      console.log("[LOGIN] Fetching user data from /me...");
      const userPromise = axios.get(`${API_URL}/me`, {
        withCredentials: true,
        timeout: timeoutDuration,
      });

      const userResponse = await Promise.race([
        userPromise,
        new Promise<never>((_, reject) => {
          userTimeoutId = setTimeout(() => {
            reject(new Error("FETCH_USER_TIMEOUT"));
          }, timeoutDuration);
        })
      ]);

      if (userTimeoutId) clearTimeout(userTimeoutId);

      console.log("[LOGIN] User data fetched:", userResponse.data);

      // ✅ Set the user data from /me endpoint
      if (userResponse.data) {
        setUser(userResponse.data);
      }

      setLoading(false);

      Alert.alert("Login Successful", `Welcome back, ${userResponse.data?.firstname || 'User'}!`, [
        {
          text: "Continue",
          onPress: () => {
            setUsername("");
            setPassword("");
            setErrors({ username: "", password: "" });

            setTimeout(() => {
              router.replace("/home");
            }, 100);
          },
        },
      ]);
    } catch (error: any) {
      // ✅ Clean up timeouts on error
      if (loginTimeoutId) clearTimeout(loginTimeoutId);
      if (userTimeoutId) clearTimeout(userTimeoutId);

      await new Promise(resolve => setTimeout(resolve, 500));

      setLoading(false);

      // ✅ Handle timeout errors
      if (error.message === "LOGIN_TIMEOUT" || error.message === "FETCH_USER_TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "The server is taking too long to respond. This might be due to:\n\n• Incorrect API URL\n• Server is down\n• Network issues\n\nPlease check your API configuration.",
          [
            {
              text: "Check API Settings",
              onPress: () => router.push("/next"),
            },
            {
              text: "Try Again",
              style: "cancel",
            },
          ]
        );
        return;
      }

      if (error.code === "ECONNABORTED") {
        Alert.alert(
          "Request Timeout",
          "The connection timed out. Please check:\n\n• Your API configuration\n• Your internet connection\n• If the server is running",
          [
            {
              text: "Check API Settings",
              onPress: () => router.push("/next"),
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
        return;
      }

      if (axios.isAxiosError(error) && error.response) {

        const errorMsg = error.response.data.error || error.response.data.message || "";

        if (errorMsg.toLowerCase().includes("username")) {
          Alert.alert("Username and Password Error", "Username and password not found. Please check and try again.");
        } else if (errorMsg.toLowerCase().includes("password")) {
          Alert.alert("Password Error", "Incorrect password. Please try again.");
        } else if (errorMsg.toLowerCase().includes("credentials") || errorMsg.toLowerCase().includes("invalid")) {
          Alert.alert("Login Failed", "Invalid username or password. Please try again.");
        } else {
          Alert.alert("Login Failed", errorMsg || "Invalid credentials");
        }
      } else if (error.message && error.message.includes("Network")) {
        Alert.alert(
          "Network Error",
          "Cannot connect to the server. Please check:\n\n• Your API configuration\n• Your internet connection\n• If the server is accessible",
          [
            {
              text: "Check API Settings",
              onPress: () => router.push("/next"),
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      } else {
        console.error("[LOGIN] Unexpected error:", error.message);
        Alert.alert(
          "Connection Error",
          "Could not connect to server. Please verify your API configuration.",
          [
            {
              text: "Check API Settings",
              onPress: () => router.push("/next"),
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      }
    }
  };
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    await performLogin(username, password);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Parse the QR code data
      const qrData = JSON.parse(data);

      // Check if it's a valid EBPLS login QR code
      if (qrData.type === "ebpls_login" && qrData.username && qrData.password) {
        setShowScanner(false);

        Alert.alert(
          "QR Code Detected",
          `Login as ${qrData.username}?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                setScanned(false);
              }
            },
            {
              text: "Login",
              onPress: async () => {
                // Auto-fill and login
                setUsername(qrData.username);
                setPassword(qrData.password);
                await performLogin(qrData.username, qrData.password);
              }
            }
          ]
        );
      } else {
        Alert.alert("Invalid QR Code", "This QR code is not a valid EBPLS login code.");
        setScanned(false);
      }
    } catch (error) {
      console.error("QR Parse error:", error);
      Alert.alert("Invalid QR Code", "Could not read QR code data. Please try again.");
      setScanned(false);
    }
  };

  const handleScan = async () => {
    if (hasPermission === null) {
      Alert.alert("Permission Required", "Requesting camera permission...");
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Camera permission is required to scan QR codes.");
        return;
      }
    }

    if (hasPermission === false) {
      Alert.alert("Permission Denied", "Camera permission is required to scan QR codes. Please enable it in settings.");
      return;
    }

    setShowScanner(true);
    setScanned(false);
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <LinearGradient
      colors={["#c850c0", "#4158d0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      {/* Loading Modal */}
      <Modal transparent visible={loading} animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View
            className="bg-white rounded-2xl p-6 items-center shadow-2xl"
            style={{
              minWidth: 220,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 10,
            }}
          >
            <Animated.View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ rotate: spin }],
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = (i * Math.PI) / 4;
                const x = 35 * Math.cos(angle);
                const y = 35 * Math.sin(angle);
                const size = i % 2 === 0 ? 10 : 8;

                return (
                  <Animated.View
                    key={i}
                    style={{
                      position: "absolute",
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor:
                        i % 2 === 0 ? "#2563eb" : "#60a5fa",
                      top: 45 - y - size / 2,
                      left: 45 + x - size / 2,
                      opacity: fadeAnim,
                    }}
                  />
                );
              })}
            </Animated.View>

            <Text className="text-gray-800 font-semibold text-lg mt-5">
              Connecting...
            </Text>
            <Text className="text-gray-500 text-sm mt-1">Please wait</Text>
          </View>
        </View>
      </Modal>


      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => {
          setShowScanner(false);
          setScanned(false);
        }}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 pt-12 pb-4 px-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-xl font-bold">Scan QR Code</Text>
              <Pressable
                onPress={() => {
                  setShowScanner(false);
                  setScanned(false);
                }}
                className="bg-white/20 rounded-full p-2"
              >
                <X color="#fff" size={24} />
              </Pressable>
            </View>
            <Text className="text-white/80 text-sm mt-2">Position the QR code within the frame</Text>
          </View>

          {/* Camera View */}
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            {/* Scanning Frame */}
            <View className="flex-1 items-center justify-center">
              <View
                className="border-4 border-white rounded-3xl"
                style={{ width: 250, height: 250 }}
              >
                {/* Corner decorations */}
                <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl" />
                <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl" />
                <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl" />
                <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl" />
              </View>
            </View>

            {/* Instructions */}
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-6">
              <View className="bg-white/10 rounded-xl p-4">
                <Text className="text-white text-center font-semibold text-base mb-2">
                  How to scan:
                </Text>
                <Text className="text-white/80 text-center text-sm">
                  1. Hold your phone steady{"\n"}
                  2. Align the QR code within the frame{"\n"}
                  3. Wait for automatic detection
                </Text>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: width * 0.05,
          paddingTop: height * 0.08,
          paddingBottom: height * 0.05
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View className="items-center" style={{ marginBottom: height * 0.02 }}>
          <View className="items-center">
            <Text className="text-white font-bold mt-6" style={{ fontSize: width * 0.09, marginBottom: 8 }}>
              WELCOME TO
            </Text>
            <Image
              source={require("../../assets/images/ebpls.png")}
              style={{
                width: width * 0.74,
                height: height * 0.40,
                maxWidth: 310,
                maxHeight: 100,
                marginBottom: 1
              }}
              resizeMode="contain"
            />
            <Text className="text-white font-semibold text-center -mt-8" style={{ fontSize: width * 0.03 }}>
              Electronic Business Permit and Licensing
            </Text>
          </View>
        </View>

        {/* LOGIN FORM */}
        <View className="w-full bg-white/10 rounded-2xl backdrop-blur" style={{
          padding: width * 0.05,
          maxWidth: 500,
          alignSelf: 'center'
        }}>

          {/* Scan to Login Header */}
          <View className="flex-row items-center justify-between" style={{ marginBottom: height * 0.02 }}>
            <Text className="text-white font-semibold" style={{ fontSize: width * 0.045 }}>
              Scan to Login
            </Text>
            <Pressable onPress={handleScan}>
              <View className="bg-white/20 rounded-full p-3 border-2 border-white/30">
                <QrCode color="#fff" size={width * 0.07} />
              </View>
            </Pressable>
          </View>

          {/* Username */}
          <InputField
            icon={<User color="#6b7280" size={20} />}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
          />

          {/* Password */}
          <InputField
            icon={<Lock color="#6b7280" size={20} />}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            error={errors.password}
            showPasswordToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {/* Password Info */}
          <View className="flex-row items-start mb-4 bg-white/5 rounded-lg p-2.5">
            <Info color="#fff" size={14} className="mt-0.5 mr-2" />
            <Text className="text-white/70 text-xs flex-1 leading-4">
              Having trouble logging in? Contact your administrator for assistance.
            </Text>
          </View>

          {/* Sign In Button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="w-full rounded-xl overflow-hidden mb-3 shadow-lg"
            style={{ minHeight: 52 }}
          >
            <LinearGradient
              colors={["#4f46e5", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center justify-center"
              style={{ minHeight: 52 }}
            >
              <Text className="text-center text-white text-lg font-bold">
                Sign In
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            className="w-full rounded-xl overflow-hidden shadow-lg"
            style={{ minHeight: 52 }}
          >
            <LinearGradient
              colors={["#34d399", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center justify-center"
              style={{ minHeight: 52 }}
            >
              <Text className="text-center text-white text-lg font-bold">
                Create New Account
              </Text>
            </LinearGradient>
          </Pressable>

        </View>
        {/* API Configuration Display */}
        {savedApiUrl && (
          <View
            className="w-full mt-6 bg-white/10 rounded-xl backdrop-blur border border-white/20"
            style={{
              padding: width * 0.04,
              maxWidth: 500,
              alignSelf: 'center'
            }}
          >
            {/* Header */}
            <View className="flex-row items-center mb-3">
              <View className="bg-white/20 rounded-full p-2 mr-2">
                <Settings2 size={16} color="#fff" />
              </View>
              <Text className="text-white font-semibold text-sm">
                API Configuration
              </Text>
            </View>

            {/* Municipality Info (if applicable) */}
            {selectedMunicipality && (
              <View className="mb-3">
                <Text className="text-white/70 text-xs mb-1">Municipality:</Text>
                <Text className="text-white font-medium text-sm">
                  {formatMunicipalityName(selectedMunicipality)}
                </Text>
              </View>
            )}

            {/* API URL */}
            <View className="mb-3">
              <Text className="text-white/70 text-xs mb-1">API Endpoint:</Text>
              <Text
                className="text-white font-mono text-xs"
                numberOfLines={2}
                ellipsizeMode="middle"
              >
                {savedApiUrl}
              </Text>
            </View>

            {/* Change Button */}
            <Pressable
              onPress={handleNavigateToConfig}
              className="flex-row items-center justify-center bg-white/10 rounded-lg py-2 active:bg-white/20"
            >
              <Settings2 size={14} color="#fff" />
              <Text className="text-white text-xs font-medium ml-2">
                Change Configuration
              </Text>
            </Pressable>
          </View>
        )}

        {/* Version Info */}
        <View className="items-center mt-4 mb-2">
          <Text className="text-white/50 text-xs">Version 0.1</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}