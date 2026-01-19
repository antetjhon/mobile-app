import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Globe, MapPin, Settings } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";

const SELECTED_OPTION_KEY = '@ebpls_config_option';
const MANUAL_API_KEY = '@ebpls_manual_api';
const SELECTED_MUNICIPALITY_KEY = '@ebpls_selected_municipality';

// Define municipality API mappings
const MUNICIPALITY_APIS = {
  abuyog: 'http://192.168.1.101:8080/ebpls/api/mobile',
  alangalang: 'http://192.168.1.102:8080/ebpls/api/mobile',
  albuera: 'http://192.168.1.103:8080/ebpls/api/mobile',
  babatngon: 'http://192.168.1.104:8080/ebpls/api/mobile',
  barugo: 'http://192.168.1.105:8080/ebpls/api/mobile',
  bato: 'http://192.168.1.106:8080/ebpls/api/mobile',
  baybay: 'http://192.168.0.180:8080/ebpls/api/mobile',
  burauen: 'http://192.168.1.108:8080/ebpls/api/mobile',
  calubian: 'http://192.168.1.109:8080/ebpls/api/mobile',
  capoocan: 'http://192.168.1.110:8080/ebpls/api/mobile',
  carigara: 'http://192.168.1.111:8080/ebpls/api/mobile',
  dagami: 'http://192.168.1.112:8080/ebpls/api/mobile',
  dulag: 'http://192.168.1.113:8080/ebpls/api/mobile',
  hilongos: 'http://192.168.1.114:8080/ebpls/api/mobile',
  hindang: 'http://192.168.1.115:8080/ebpls/api/mobile',
  inopacan: 'http://192.168.1.116:8080/ebpls/api/mobile',
  isabel: 'http://192.168.1.117:8080/ebpls/api/mobile',
  jaro: 'http://192.168.1.118:8080/ebpls/api/mobile',
  javier: 'http://192.168.1.119:8080/ebpls/api/mobile',
  julita: 'http://192.168.1.120:8080/ebpls/api/mobile',
  kananga: 'http://192.168.1.121:8080/ebpls/api/mobile',
  lapaz: 'http://192.168.1.122:8080/ebpls/api/mobile',
  leyte: 'http://192.168.1.123:8080/ebpls/api/mobile',
  macarthur: 'http://192.168.1.124:8080/ebpls/api/mobile',
  mahaplag: 'http://192.168.1.125:8080/ebpls/api/mobile',
  matagob: 'http://192.168.1.126:8080/ebpls/api/mobile',
  matalom: 'http://192.168.1.127:8080/ebpls/api/mobile',
  mayorga: 'http://192.168.1.128:8080/ebpls/api/mobile',
  merida: 'http://192.168.1.129:8080/ebpls/api/mobile',
  palo: 'http://192.168.1.130:8080/ebpls/api/mobile',
  palompon: 'http://192.168.1.131:8080/ebpls/api/mobile',
  pastrana: 'http://192.168.1.132:8080/ebpls/api/mobile',
  sanisidro: 'http://192.168.1.133:8080/ebpls/api/mobile',
  sanmiguel: 'http://192.168.1.134:8080/ebpls/api/mobile',
  santafe: 'http://192.168.1.135:8080/ebpls/api/mobile',
  tabango: 'http://192.168.1.136:8080/ebpls/api/mobile',
  tanauan: 'http://192.168.1.137:8080/ebpls/api/mobile',
  tolosa: 'http://192.168.1.138:8080/ebpls/api/mobile',
  tunga: 'http://192.168.1.139:8080/ebpls/api/mobile',
  villaba: 'http://192.168.1.140:8080/ebpls/api/mobile',
};

export default function NextScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [showManualConfig, setShowManualConfig] = useState(false);
  const [manualApiUrl, setManualApiUrl] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Responsive calculations
  const isSmallDevice = windowWidth < 375;
  const isMediumDevice = windowWidth >= 375 && windowWidth < 768;
  const isLargeDevice = windowWidth >= 768;

  const getResponsiveSize = (small: number, medium: number, large: number) => {
    if (isSmallDevice) return small;
    if (isMediumDevice) return medium;
    return large;
  };

  const logoSize = getResponsiveSize(80, 100, 130);
  const titleSize = getResponsiveSize(20, 24, 32);
  const subtitleSize = getResponsiveSize(12, 14, 16);
  const iconSize = getResponsiveSize(32, 40, 48);
  const smallIconSize = getResponsiveSize(16, 20, 24);
  const buttonHeight = getResponsiveSize(48, 54, 60);
  const containerPadding = getResponsiveSize(16, 24, 32);
  const verticalPadding = getResponsiveSize(40, 60, 80);

  useEffect(() => {
    loadExistingConfig();
  }, []);

  const loadExistingConfig = async () => {
    try {
      const option = await AsyncStorage.getItem(SELECTED_OPTION_KEY);
      const manualApi = await AsyncStorage.getItem(MANUAL_API_KEY);
      const municipality = await AsyncStorage.getItem(SELECTED_MUNICIPALITY_KEY);

      if (option === 'manual' && manualApi) {
        setManualApiUrl(manualApi);
        setShowManualConfig(true);
      } else if (municipality) {
        setSelectedMunicipality(municipality);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleManualSave = async () => {
    if (!manualApiUrl.trim()) {
      Alert.alert("Error", "Please enter an API URL");
      return;
    }

    if (!validateUrl(manualApiUrl)) {
      Alert.alert(
        "Invalid URL",
        "Please enter a valid URL starting with http:// or https://\n\nExample: http://192.168.1.100:8080/ebpls/api/mobile"
      );
      return;
    }

    try {
      setSaving(true);
      await AsyncStorage.setItem(SELECTED_OPTION_KEY, 'manual');
      await AsyncStorage.setItem(MANUAL_API_KEY, manualApiUrl.trim());
      await AsyncStorage.setItem("API_URL", manualApiUrl.trim());
      await AsyncStorage.removeItem(SELECTED_MUNICIPALITY_KEY);

      console.log("[SETUP] Manual API saved:", manualApiUrl.trim());

      Alert.alert(
        "Success",
        "API URL configured successfully!",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/"),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving manual API:", error);
      Alert.alert("Error", "Failed to save API URL. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleMunicipalitySave = async () => {
    if (!selectedMunicipality) {
      Alert.alert("Error", "Please select a municipality");
      return;
    }

    try {
      setSaving(true);
      const apiUrl = MUNICIPALITY_APIS[selectedMunicipality as keyof typeof MUNICIPALITY_APIS];

      await AsyncStorage.setItem(SELECTED_OPTION_KEY, 'municipality');
      await AsyncStorage.setItem(SELECTED_MUNICIPALITY_KEY, selectedMunicipality);
      await AsyncStorage.setItem("API_URL", apiUrl);
      await AsyncStorage.removeItem(MANUAL_API_KEY);

      console.log("[SETUP] Municipality saved:", selectedMunicipality);
      console.log("[SETUP] Associated API:", apiUrl);

      Alert.alert(
        "Success",
        `Configuration saved!\n\nMunicipality: ${selectedMunicipality.charAt(0).toUpperCase() + selectedMunicipality.slice(1)}`,
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/"),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving municipality:", error);
      Alert.alert("Error", "Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Configuration",
      "Are you sure you want to reset all configuration?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(SELECTED_OPTION_KEY);
              await AsyncStorage.removeItem(MANUAL_API_KEY);
              await AsyncStorage.removeItem(SELECTED_MUNICIPALITY_KEY);
              await AsyncStorage.removeItem("API_URL");
              setShowManualConfig(false);
              setManualApiUrl("");
              setSelectedMunicipality("");
              Alert.alert("Success", "Configuration has been reset");
            } catch (error) {
              Alert.alert("Error", "Failed to reset configuration");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#c850c0", "#4158d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4" style={{ fontSize: getResponsiveSize(12, 14, 16) }}>
          Loading...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#c850c0", "#4158d0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: containerPadding,
          paddingTop: verticalPadding
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center">
          {/* Logo */}
          <Image
            source={require("../../assets/images/leyte-logo.png")}
            style={{
              width: logoSize,
              height: logoSize,
              marginBottom: getResponsiveSize(12, 16, 20)
            }}
            resizeMode="contain"
          />

          {!showManualConfig ? (
            /* Municipality Selection Screen (Default) */
            <View className="w-full" style={{ maxWidth: isLargeDevice ? 600 : 500 }}>
              {/* Title */}
              <View className="items-center" style={{ marginBottom: getResponsiveSize(20, 24, 32) }}>

                <View
                  className="flex-row items-center justify-center"
                  style={{ marginBottom: getResponsiveSize(8, 10, 12) }}
                >
                  <View
                    className="rounded-full mb-3"
                    style={{
                      padding: getResponsiveSize(8, 10, 12),
                    }}
                  >
                    <MapPin color="#fff" size={iconSize} />
                  </View>
                  <Text
                    className="font-bold text-white  text-center"
                    style={{ fontSize: titleSize }}
                  >
                    Select Municipality
                  </Text>
                </View>
                <Text
                  className="text-white/80 text-center"
                  style={{
                    fontSize: subtitleSize,
                    paddingHorizontal: containerPadding
                  }}
                >
                  Choose your municipality to automatically configure your connection
                </Text>
              </View>

              {/* Municipality Picker */}
              <View className="w-full" style={{ marginBottom: getResponsiveSize(20, 24, 32) }}>
                <View
                  className="flex-row items-center border-2 border-white/30 rounded-xl bg-white/10 px-4"
                  style={{ minHeight: buttonHeight }}
                >
                  <MapPin color="#fff" size={smallIconSize} />
                  <Picker
                    selectedValue={selectedMunicipality}
                    onValueChange={(itemValue) => setSelectedMunicipality(itemValue)}
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      color: '#fff',
                      fontSize: getResponsiveSize(12, 14, 16)
                    }}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item label="Select Municipality" value="" />
                    <Picker.Item label="Abuyog" value="abuyog" />
                    <Picker.Item label="Alangalang" value="alangalang" />
                    <Picker.Item label="Albuera" value="albuera" />
                    <Picker.Item label="Babatngon" value="babatngon" />
                    <Picker.Item label="Barugo" value="barugo" />
                    <Picker.Item label="Bato" value="bato" />
                    <Picker.Item label="Baybay City" value="baybay" />
                    <Picker.Item label="Burauen" value="burauen" />
                    <Picker.Item label="Calubian" value="calubian" />
                    <Picker.Item label="Capoocan" value="capoocan" />
                    <Picker.Item label="Carigara" value="carigara" />
                    <Picker.Item label="Dagami" value="dagami" />
                    <Picker.Item label="Dulag" value="dulag" />
                    <Picker.Item label="Hilongos" value="hilongos" />
                    <Picker.Item label="Hindang" value="hindang" />
                    <Picker.Item label="Inopacan" value="inopacan" />
                    <Picker.Item label="Isabel" value="isabel" />
                    <Picker.Item label="Jaro" value="jaro" />
                    <Picker.Item label="Javier" value="javier" />
                    <Picker.Item label="Julita" value="julita" />
                    <Picker.Item label="Kananga" value="kananga" />
                    <Picker.Item label="La Paz" value="lapaz" />
                    <Picker.Item label="Leyte" value="leyte" />
                    <Picker.Item label="MacArthur" value="macarthur" />
                    <Picker.Item label="Mahaplag" value="mahaplag" />
                    <Picker.Item label="Matag-ob" value="matagob" />
                    <Picker.Item label="Matalom" value="matalom" />
                    <Picker.Item label="Mayorga" value="mayorga" />
                    <Picker.Item label="Merida" value="merida" />
                    <Picker.Item label="Palo" value="palo" />
                    <Picker.Item label="Palompon" value="palompon" />
                    <Picker.Item label="Pastrana" value="pastrana" />
                    <Picker.Item label="San Isidro" value="sanisidro" />
                    <Picker.Item label="San Miguel" value="sanmiguel" />
                    <Picker.Item label="Santa Fe" value="stafe" />
                    <Picker.Item label="Tabango" value="tabango" />
                    <Picker.Item label="Tanauan" value="tanauan" />
                    <Picker.Item label="Tolosa" value="tolosa" />
                    <Picker.Item label="Tunga" value="tunga" />
                    <Picker.Item label="Villaba" value="villaba" />
                  </Picker>
                </View>

                {/* Show Associated API */}
                {selectedMunicipality && (
                  <View
                    className="bg-white/10 rounded-lg mt-3"
                    style={{ padding: getResponsiveSize(12, 16, 20) }}
                  >
                    <Text
                      className="text-white/70 mb-2"
                      style={{ fontSize: getResponsiveSize(10, 11, 12) }}
                    >
                      Selected:
                    </Text>
                    <Text
                      className="text-white font-semibold capitalize mb-3"
                      style={{ fontSize: getResponsiveSize(14, 16, 18) }}
                    >
                      {selectedMunicipality === 'baybay' ? 'Baybay City' :
                        selectedMunicipality === 'ormoc' ? 'Ormoc City' :
                          selectedMunicipality === 'tacloban' ? 'Tacloban City' :
                            selectedMunicipality.charAt(0).toUpperCase() + selectedMunicipality.slice(1)}
                    </Text>
                    <Text
                      className="text-white/70 mb-1"
                      style={{ fontSize: getResponsiveSize(10, 11, 12) }}
                    >
                      API Endpoint:
                    </Text>
                    <Text
                      className="text-white font-mono"
                      style={{ fontSize: getResponsiveSize(9, 10, 11) }}
                      numberOfLines={2}
                    >
                      {MUNICIPALITY_APIS[selectedMunicipality as keyof typeof MUNICIPALITY_APIS]}
                    </Text>
                  </View>
                )}
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleMunicipalitySave}
                disabled={saving || !selectedMunicipality}
                className={`w-full rounded-xl overflow-hidden shadow-lg ${!selectedMunicipality ? 'opacity-50' : ''}`}
                style={{
                  minHeight: buttonHeight,
                  marginBottom: getResponsiveSize(12, 16, 20)
                }}
              >
                <LinearGradient
                  colors={["#34d399", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center justify-center"
                  style={{ minHeight: buttonHeight }}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      className="text-white font-semibold"
                      style={{ fontSize: getResponsiveSize(14, 16, 18) }}
                    >
                      Continue to Login
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Divider */}
              <View
                className="flex-row items-center"
                style={{ marginVertical: getResponsiveSize(20, 24, 32) }}
              >
                <View className="flex-1 h-px bg-white/30" />
                <Text
                  className="text-white/70 mx-4"
                  style={{ fontSize: getResponsiveSize(12, 14, 16) }}
                >
                  OR
                </Text>
                <View className="flex-1 h-px bg-white/30" />
              </View>

              {/* Navigate to Manual Config */}
              <Pressable
                onPress={() => setShowManualConfig(true)}
                disabled={saving}
                className="w-full bg-white/10 rounded-xl border-2 border-white/30 active:bg-white/20"
                style={{
                  padding: getResponsiveSize(12, 16, 20),
                  marginBottom: getResponsiveSize(12, 16, 20)
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="bg-white/20 rounded-full mr-3"
                      style={{ padding: getResponsiveSize(8, 10, 12) }}
                    >
                      <Settings color="#fff" size={smallIconSize} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-white font-semibold mb-1"
                        style={{ fontSize: getResponsiveSize(14, 16, 18) }}
                      >
                        Advanced Configuration
                      </Text>
                      <Text
                        className="text-white/70"
                        style={{ fontSize: getResponsiveSize(10, 11, 12) }}
                      >
                        Enter custom API URL manually
                      </Text>
                    </View>
                  </View>
                  <Globe color="#fff" size={smallIconSize} />
                </View>
              </Pressable>

              {/* Reset Button */}
              {(selectedMunicipality || manualApiUrl) && (
                <Pressable
                  onPress={handleReset}
                  disabled={saving}
                  className="w-full bg-red-500/20 border-2 border-red-500/50 rounded-xl active:bg-red-500/30"
                  style={{
                    paddingVertical: getResponsiveSize(10, 12, 14),
                    marginBottom: getResponsiveSize(12, 16, 20)
                  }}
                >
                  <Text
                    className="text-center text-white font-semibold"
                    style={{ fontSize: getResponsiveSize(12, 13, 14) }}
                  >
                    Reset Configuration
                  </Text>
                </Pressable>
              )}

              {/* Info Box */}
              <View
                className="w-full bg-white/10 rounded-lg"
                style={{
                  padding: getResponsiveSize(12, 16, 20),
                  marginTop: getResponsiveSize(12, 16, 20)
                }}
              >
                <Text
                  className="text-white/90"
                  style={{
                    fontSize: getResponsiveSize(10, 11, 12),
                    lineHeight: getResponsiveSize(16, 18, 20)
                  }}
                >
                  📍 <Text className="font-semibold">Quick Setup:</Text> Select your municipality for automatic configuration, or use advanced settings for custom API.
                </Text>
              </View>
            </View>
          ) : (
            /* Manual API Configuration Screen */
            <View className="w-full" style={{ maxWidth: isLargeDevice ? 600 : 500 }}>
              {/* Title */}
              <View className="items-center" style={{ marginBottom: getResponsiveSize(20, 24, 32) }}>

                <Text
                  className="font-bold text-white mb-2 text-center"
                  style={{ fontSize: titleSize }}
                >
                  Advanced Configuration
                </Text>
                <Text
                  className="text-white/80 text-center"
                  style={{
                    fontSize: subtitleSize,
                    paddingHorizontal: containerPadding
                  }}
                >
                  Enter your custom API endpoint URL
                </Text>
              </View>

              {/* API URL Input */}
              <View className="w-full" style={{ marginBottom: getResponsiveSize(20, 24, 32) }}>
                <View
                  className="flex-row items-center border-2 border-white/30 rounded-xl bg-white/10 px-4 mb-2"
                  style={{ paddingVertical: getResponsiveSize(10, 12, 14) }}
                >
                  <Globe color="#fff" size={smallIconSize} />
                  <TextInput
                    value={manualApiUrl}
                    onChangeText={setManualApiUrl}
                    placeholder="http://192.168.1.100:8080/ebpls/api/mobile"
                    placeholderTextColor="#fff9"
                    className="flex-1 ml-3 text-white"
                    style={{ fontSize: getResponsiveSize(12, 14, 16) }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>

                <Text
                  className="text-white/70 px-2"
                  style={{ fontSize: getResponsiveSize(10, 11, 12) }}
                >
                  Example: http://192.168.1.100:8080/ebpls/api/mobile
                </Text>
              </View>

              {/* Current URL Display */}
              {manualApiUrl && (
                <View
                  className="w-full bg-white/10 rounded-lg"
                  style={{
                    padding: getResponsiveSize(12, 16, 20),
                    marginBottom: getResponsiveSize(20, 24, 32)
                  }}
                >
                  <Text
                    className="text-white/70 mb-1"
                    style={{ fontSize: getResponsiveSize(10, 11, 12) }}
                  >
                    Current API URL:
                  </Text>
                  <Text
                    className="text-white font-medium"
                    style={{ fontSize: getResponsiveSize(12, 13, 14) }}
                    numberOfLines={2}
                  >
                    {manualApiUrl}
                  </Text>
                </View>
              )}

              {/* Save Button */}
              <Pressable
                onPress={handleManualSave}
                disabled={saving || !manualApiUrl}
                className={`w-full rounded-xl overflow-hidden shadow-lg ${!manualApiUrl ? 'opacity-50' : ''}`}
                style={{
                  minHeight: buttonHeight,
                  marginBottom: getResponsiveSize(12, 16, 20)
                }}
              >
                <LinearGradient
                  colors={["#34d399", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center justify-center"
                  style={{ minHeight: buttonHeight }}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      className="text-white font-semibold"
                      style={{ fontSize: getResponsiveSize(14, 16, 18) }}
                    >
                      Save & Continue
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Back Button */}
              <Pressable
                onPress={() => setShowManualConfig(false)}
                disabled={saving}
                className="w-full bg-white/20 rounded-xl active:bg-white/30"
                style={{
                  paddingVertical: getResponsiveSize(12, 14, 16),
                  marginBottom: getResponsiveSize(12, 16, 20)
                }}
              >
                <View className="flex-row items-center justify-center">
                  <ArrowLeft color="#fff" size={smallIconSize} />
                  <Text
                    className="text-white font-semibold ml-2"
                    style={{ fontSize: getResponsiveSize(13, 15, 16) }}
                  >
                    Back to Municipality
                  </Text>
                </View>
              </Pressable>

              {/* Reset Button */}
              <Pressable
                onPress={handleReset}
                disabled={saving}
                className="w-full bg-red-500/20 border-2 border-red-500/50 rounded-xl active:bg-red-500/30"
                style={{
                  paddingVertical: getResponsiveSize(10, 12, 14),
                  marginBottom: getResponsiveSize(12, 16, 20)
                }}
              >
                <Text
                  className="text-center text-white font-semibold"
                  style={{ fontSize: getResponsiveSize(12, 13, 14) }}
                >
                  Reset Configuration
                </Text>
              </Pressable>

              {/* Info Box */}
              <View
                className="w-full bg-white/10 rounded-lg"
                style={{ padding: getResponsiveSize(12, 16, 20) }}
              >
                <Text
                  className="text-white/90"
                  style={{
                    fontSize: getResponsiveSize(10, 11, 12),
                    lineHeight: getResponsiveSize(16, 18, 20)
                  }}
                >
                  💡 <Text className="font-semibold">Note:</Text> Contact your system administrator for the correct API URL if you don't have it.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}