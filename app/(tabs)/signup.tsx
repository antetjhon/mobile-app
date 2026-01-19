
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { Check, Download, Info, Key, Lock, Mail, Shield, User, UserCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, Text, TextInput, View, } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { getApiUrl } from "../utils/api";

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  optional = false,
  error = "",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  optional?: boolean;
  error?: string;
}) => (
  <View className="mb-4">
    <View
      className={`flex-row items-center border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl bg-white/95 px-4 shadow-sm`}
      style={{ minHeight: 56 }}
    >
      <View className="mr-3">
        {icon}
      </View>
      <TextInput
        placeholder={placeholder + (optional ? " (Optional)" : "")}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        className="flex-1 text-gray-800 text-base"
        placeholderTextColor="#9ca3af"
        style={{ paddingVertical: 16 }}
      />
    </View>
    {error ? (
      <Text className="text-red-300 text-xs mt-1 ml-2">{error}</Text>
    ) : null}
  </View>
);

const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <View className="mb-4 mt-2">
    <View className="flex-row items-center mb-1">
      {icon}
      <Text className="text-white font-bold text-xl ml-2">{title}</Text>
    </View>
    {subtitle && (
      <Text className="text-white/70 text-sm ml-8">{subtitle}</Text>
    )}
  </View>
);

export default function SignUp() {
  const router = useRouter();

  // Function to clear all form data
  const clearAllFormData = () => {
    setFirstname("");
    setLastname("");
    setMiddlename("");
    setSuffix("");
    setEmail("");
    setUsername("");
    setPassword("");
    setRetypePassword("");
    setSecurityQuestion("");
    setSecurityAnswer("");
    setAcceptTerms(false);
    setErrors({
      lastname: "",
      firstname: "",
      email: "",
      username: "",
      password: "",
      retypePassword: "",
      securityQuestion: "",
      securityAnswer: "",
    });
    setQrData("");
  };

  // Personal Info
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");

  // Login Info
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // QR Code Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState("");
  const [qrSvgRef, setQrSvgRef] = useState<any>(null);

  // Error states
  const [errors, setErrors] = useState({
    lastname: "",
    firstname: "",
    email: "",
    username: "",
    password: "",
    retypePassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Cancel Registration?",
        "Are you sure you want to go back? Your progress will be lost.",
        [
          {
            text: "Stay",
            onPress: () => null,
            style: "cancel"
          },
          {
            text: "Leave",
            onPress: () => {
              clearAllFormData();
              router.replace("/");
            },
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

    return () => {
      backHandler.remove();
      console.log("Component unmounting - cleaning up");
    };
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log("SignUp component unmounting - clearing form data");
      clearAllFormData();
    };
  }, []);

  const validateForm = () => {
    const newErrors = {
      lastname: "",
      firstname: "",
      email: "",
      username: "",
      password: "",
      retypePassword: "",
      securityQuestion: "",
      securityAnswer: "",
    };

    if (!firstname.trim()) newErrors.firstname = "First name is required";
    if (!lastname.trim()) newErrors.lastname = "Last name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/])/.test(password)) {
      newErrors.password = "Password must include uppercase, lowercase, number, and special character";
    }

    if (password !== retypePassword) newErrors.retypePassword = "Passwords do not match";
    if (!securityQuestion) newErrors.securityQuestion = "Please select a security question";
    if (!securityAnswer.trim()) newErrors.securityAnswer = "Security answer is required";

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleDownloadQR = async () => {
    try {
      if (!qrSvgRef) {
        Alert.alert("Error", "QR code not ready. Please try again.");
        return;
      }

      qrSvgRef.toDataURL(async (data: string) => {
        try {
          const filename = `${FileSystem.cacheDirectory}${username}_qr_code.png`;

          await FileSystem.writeAsStringAsync(filename, data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          try {
            const asset = await MediaLibrary.createAssetAsync(filename);

            try {
              const album = await MediaLibrary.getAlbumAsync("EBPLS");
              if (album) {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              } else {
                await MediaLibrary.createAlbumAsync("EBPLS", asset, false);
              }
            } catch (albumError) {
              console.log("Album creation skipped, image saved to gallery");
            }

            try {
              await FileSystem.deleteAsync(filename, { idempotent: true });
            } catch (deleteError) {
              console.log("Cleanup skipped");
            }

            Alert.alert(
              "Success",
              "QR code saved to your gallery!",
              [{ text: "OK" }]
            );
          } catch (mediaError: any) {
            console.error("Media library error:", mediaError);

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
              await Sharing.shareAsync(filename, {
                mimeType: 'image/png',
                dialogTitle: 'Save QR Code'
              });
            } else {
              throw new Error("Unable to save QR code");
            }
          }

        } catch (saveError) {
          console.error("Save error:", saveError);
          Alert.alert(
            "Error",
            "Failed to save QR code. Please check your device settings."
          );
        }
      });
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again."
      );
    }
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `EBPLS Login Credentials\nUsername: ${username}\n\nScan the QR code to login quickly!`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleCreateAccount = async () => {
    if (!acceptTerms) {
      return Alert.alert("Terms Required", "Please accept the terms and conditions to continue.");
    }

    if (!validateForm()) {
      return Alert.alert("Validation Error", "Please check the form for errors.");
    }

    try {
      setLoading(true);

      const payload = {
        firstname: firstname.trim(),
        middlename: middlename.trim(),
        lastname: lastname.trim(),
        suffix: suffix.trim(),
        username: username.trim(),
        password: password.trim(),
        retype: retypePassword.trim(),
        email: email.trim(),
        question: securityQuestion,
        answer: securityAnswer.trim(),
      };
      const API_URL = await getApiUrl();
      const response = await axios.post(`${API_URL}/register1`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const qrCredentials = JSON.stringify({
        username: username.trim(),
        password: password.trim(),
        type: "ebpls_login"
      });

      setQrData(qrCredentials);
      setShowQRModal(true);

    } catch (err: any) {

      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        const errorMsg = errorData?.error || errorData?.message || "";

        if (errorMsg.toLowerCase().includes("username") && errorMsg.toLowerCase().includes("exist")) {
          Alert.alert("Username Already Exists", "This username is already taken. Please choose a different username.");
        } else if (errorMsg.toLowerCase().includes("email") && errorMsg.toLowerCase().includes("exist")) {
          Alert.alert("Email Already Exists", "This email is already registered. Please use a different email or try logging in.");
        } else if (errorMsg.toLowerCase().includes("username")) {
          Alert.alert("Username Error", errorMsg);
        } else if (errorMsg.toLowerCase().includes("email")) {
          Alert.alert("Email Error", errorMsg);
        } else {
          Alert.alert("Registration Failed", errorMsg || "Unable to create account. Please try again.");
        }
      } else {
        Alert.alert("Connection Error", "Unable to connect to server. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    clearAllFormData();
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <LinearGradient
        colors={["#c850c0", "#4158d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 40,
          }}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <View className="bg-white/20 rounded-full p-4 mb-4">
              <UserCircle color="#fff" size={48} />
            </View>
            <Text className="text-3xl font-bold text-white mb-2 text-center">
              Create Your Account
            </Text>
            <Text className="text-white/80 text-center text-base">
              EBPLS Leyte Registration Portal
            </Text>
          </View>

          <View className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur">
            <SectionHeader
              icon={<User color="#fff" size={24} />}
              title="Personal Details"
              subtitle="Enter your basic information"
            />

            <InputField
              icon={<User color="#6b7280" size={20} />}
              placeholder="Last Name"
              value={lastname}
              onChangeText={setLastname}
              error={errors.lastname}
            />
            <InputField
              icon={<User color="#6b7280" size={20} />}
              placeholder="First Name"
              value={firstname}
              onChangeText={setFirstname}
              error={errors.firstname}
            />
            <InputField
              icon={<User color="#6b7280" size={20} />}
              placeholder="Middle Name"
              value={middlename}
              onChangeText={setMiddlename}
              optional
            />
            <InputField
              icon={<User color="#6b7280" size={20} />}
              placeholder="Suffix (Jr., Sr., III)"
              value={suffix}
              onChangeText={setSuffix}
              optional
            />
            <InputField
              icon={<Mail color="#6b7280" size={20} />}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />
          </View>

          <View className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur">
            <SectionHeader
              icon={<Lock color="#fff" size={24} />}
              title="Login Credentials"
              subtitle="Secure your account"
            />

            <InputField
              icon={<User color="#6b7280" size={20} />}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
            />

            <View className="mb-4">
              <View
                className={`flex-row items-center border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl bg-white/95 px-4 shadow-sm`}
                style={{ minHeight: 56 }}
              >
                <View className="mr-3">
                  <Lock color="#6b7280" size={20} />
                </View>
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="flex-1 text-gray-800 text-base"
                  placeholderTextColor="#9ca3af"
                  style={{ paddingVertical: 16 }}
                />
              </View>

              <View className="flex-row items-start mt-2 bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                <Info color="#60a5fa" size={16} className="mt-0.5 mr-2" />
                <Text className="text-blue-100 text-xs flex-1 leading-5">
                  Password must be at least 8 characters with uppercase, lowercase, number & special character (e.g., Sample@2025)
                </Text>
              </View>

              {errors.password ? (
                <Text className="text-red-300 text-xs mt-1 ml-2">{errors.password}</Text>
              ) : null}
            </View>
            <InputField
              icon={<Lock color="#6b7280" size={20} />}
              placeholder="Confirm Password"
              value={retypePassword}
              onChangeText={setRetypePassword}
              secureTextEntry
              error={errors.retypePassword}
            />
          </View>

          <View className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur">
            <SectionHeader
              icon={<Shield color="#fff" size={24} />}
              title="Account Recovery"
              subtitle="For password reset verification"
            />

            <View className="mb-4">
              <View
                className={`border ${errors.securityQuestion ? 'border-red-400' : 'border-gray-200'} rounded-xl bg-white/95 px-4 shadow-sm overflow-hidden`}
                style={{ minHeight: 56 }}
              >
                <Picker
                  selectedValue={securityQuestion}
                  onValueChange={setSecurityQuestion}
                  style={{ height: 56 }}
                  dropdownIconColor="#6b7280"
                >
                  <Picker.Item label="Select Security Question" value="" />
                  <Picker.Item label="What is the name of your first pet?" value="dog" />
                  <Picker.Item label="What is your mother's maiden name?" value="mother" />
                  <Picker.Item label="What is your favorite color?" value="color" />
                </Picker>
              </View>
              {errors.securityQuestion ? (
                <Text className="text-red-300 text-xs mt-1 ml-2">{errors.securityQuestion}</Text>
              ) : null}
            </View>

            <InputField
              icon={<Key color="#6b7280" size={20} />}
              placeholder="Your Answer"
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              error={errors.securityAnswer}
            />
          </View>

          <View className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur">
            <Pressable
              onPress={() => setAcceptTerms(!acceptTerms)}
              className="flex-row items-start"
            >
              <View className="w-6 h-6 mr-3 border-2 border-white rounded-lg items-center justify-center bg-white/20 mt-0.5">
                {acceptTerms && (
                  <Check color="#fff" size={18} strokeWidth={3} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white text-base leading-6">
                  I agree to the{" "}
                  <Text className="font-semibold underline">Terms and Conditions</Text>
                  {" "}and{" "}
                  <Text className="font-semibold underline">Privacy Policy</Text>
                </Text>
              </View>
            </Pressable>

            <View className="flex-row items-start mt-4 bg-white/5 rounded-lg p-3">
              <Info color="#fff" size={16} className="mt-0.5 mr-2" />
              <Text className="text-white/70 text-xs flex-1 leading-5">
                Your personal information will be securely stored and used only for EBPLS Leyte services.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleCreateAccount}
            disabled={loading}
            className="rounded-2xl overflow-hidden mb-6 shadow-lg"
            style={{ minHeight: 56 }}
          >
            <LinearGradient
              colors={acceptTerms ? ["#34d399", "#059669"] : ["#9ca3af", "#6b7280"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row justify-center items-center"
              style={{ minHeight: 56 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text className="text-center text-white font-bold text-lg mr-2">
                    Register Now
                  </Text>
                  <Check color="#fff" size={20} />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text className="text-white/60 text-center text-sm mb-4">
            Already have an account?{" "}
            <Text
              className="text-white font-semibold underline"
              onPress={() => {
                clearAllFormData();
                router.push("/");
              }}
            >
              Sign In
            </Text>
          </Text>
        </ScrollView>

        <Modal
          visible={showQRModal}
          transparent
          animationType="fade"
        >
          <View className="flex-1 bg-black/80 justify-center items-center px-6">
            <View className="bg-white rounded-3xl p-8 w-full max-w-md">
              <View className="items-center mb-6">
                <View className="bg-green-500 rounded-full p-4 mb-4">
                  <Check color="#fff" size={32} strokeWidth={3} />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  Registration Successful!
                </Text>
                <Text className="text-gray-600 text-center">
                  Your account has been created. Save your QR code for quick login.
                </Text>
              </View>

              <View className="items-center bg-gray-50 rounded-2xl p-6 mb-6">
                <QRCode
                  value={qrData}
                  size={200}
                  getRef={setQrSvgRef}
                />
                <Text className="text-gray-700 font-semibold mt-4 text-center">
                  {username}
                </Text>
                <Text className="text-gray-500 text-xs mt-1 text-center">
                  Scan this code to login
                </Text>
              </View>

              <View className="space-y-3">
                <Pressable
                  onPress={handleDownloadQR}
                  className="bg-blue-500 rounded-xl py-4 flex-row items-center justify-center"
                >
                  <Download color="#fff" size={20} />
                  <Text className="text-white font-semibold text-base ml-2">
                    Save QR Code
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleCloseQRModal}
                  className="bg-green-500 rounded-xl py-4 flex-row items-center justify-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Continue to Login
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-start mt-4 bg-amber-50 rounded-lg p-3">
                <Info color="#f59e0b" size={16} className="mt-0.5 mr-2" />
                <Text className="text-amber-800 text-xs flex-1 leading-5">
                  Keep your QR code secure. Anyone with access to it can login to your account.
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}