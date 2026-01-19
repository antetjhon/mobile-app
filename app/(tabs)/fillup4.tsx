import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const Fillup = () => {
  const router = useRouter();


  const [applicationType, setApplicationType] = useState("new");
  const [paymentMode, setPaymentMode] = useState("annual");
  const [gender, setGender] = useState("male");

  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [suffix, setSuffix] = useState("");
  const [mobile, setMobile] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [hotline, setHotline] = useState("");


  const [businessName, setBusinessName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [businessType, setBusinessType] = useState("sole proprietorship");
  const [registrationNo, setRegistrationNo] = useState("");
  const [tin, setTin] = useState("");

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center bg-red-600 p-4">
        <Pressable onPress={() => router.replace("/(tabs)/home")} className="mt-6 pr-3">
          <ArrowLeft size={24} color="white" />
        </Pressable>
        <View className="flex-1 items-center mt-6">
          <Text className="text-white text-lg font-bold">Business Information and Registration</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* --- Step 1: Taxpayer Info --- */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Taxpayer Information</Text>

        {/* Application Type */}
        <Text className="text-base font-semibold text-gray-700 mb-2">Application Type:</Text>
        <View className="flex-row mb-4">
          <Pressable className="flex-row items-center mr-6" onPress={() => setApplicationType("new")}>
            <View className={`w-5 h-5 mr-2 border-2 border-gray-500 rounded items-center justify-center ${applicationType === "new" ? "bg-red-500 border-red-500" : "border-gray-400"}`}>
              {applicationType && <Check size={14} color="white" strokeWidth={3} />}
            </View>
            <Text>New</Text>
          </Pressable>
          <Pressable className="flex-row items-center" onPress={() => setApplicationType("renew")}>
            <View className={`w-5 h-5 mr-2 border-2 border-gray-500  rounded items-center justify-center ${applicationType === "renew" ? "bg-red-500 border-red-500" : "border-gray-400"}`}>
              {applicationType && <Check size={14} color="white" strokeWidth={3} />}
            </View>
            <Text>Renew</Text>
          </Pressable>
        </View>
        <TextInput placeholder="Business ID" value={lastname} onChangeText={setLastname} className="border border-gray-400 rounded p-2 mb-2" />

        {/* Payment Mode */}
        <Text className="text-base font-semibold text-gray-700 mb-2">Payment Mode:</Text>
        <View className="border border-gray-400 rounded mb-4">
          <Picker selectedValue={paymentMode} onValueChange={(val) => setPaymentMode(val)}>
            <Picker.Item label="Annual" value="annual" />
            <Picker.Item label="Bi-Annual" value="bi-annual" />
            <Picker.Item label="Quarterly" value="quarterly" />
          </Picker>
        </View>

        {/* Taxpayer Fields */}
        <TextInput placeholder="Lastname" value={lastname} onChangeText={setLastname} className="border border-gray-400 rounded p-2 mb-2" />
        <TextInput placeholder="Firstname" value={firstname} onChangeText={setFirstname} className="border border-gray-400 rounded p-2 mb-2" />
        <TextInput placeholder="Middlename" value={middlename} onChangeText={setMiddlename} className="border border-gray-400 rounded p-2 mb-2" />
        <TextInput placeholder="Suffix" value={suffix} onChangeText={setSuffix} className="border border-gray-400 rounded p-2 mb-2" />
        <TextInput placeholder="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" className="border border-gray-400 rounded p-2 mb-2" />
        <TextInput placeholder="Telephone Number" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" className="border border-gray-400 rounded p-2 mb-2" />
        <TextInput placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" className="border border-gray-400 rounded p-2 mb-2" />
        <TextInput placeholder="Hotline Number" value={hotline} onChangeText={setHotline} keyboardType="phone-pad" className="border border-gray-400 rounded p-2 mb-4" />

        {/* Gender */}
        <Text className="text-base font-semibold text-gray-700 mb-2">Gender:</Text>
        <View className="flex-row mb-6">
          <Pressable className="flex-row items-center mr-6" onPress={() => setGender("male")}>
            <View className={`w-5 h-5 mr-2 border-2 border-gray-500 rounded items-center justify-center ${gender === "male" ? "bg-red-500 border-red-500" : "border-gray-400"}`}>
              {gender && <Check size={14} color="white" strokeWidth={3} />}
            </View>
            <Text>Male</Text>
          </Pressable>
          <Pressable className="flex-row items-center" onPress={() => setGender("female")}>
            <View className={`w-5 h-5 mr-2 border-2 border-gray-500 rounded items-center justify-center ${gender === "female" ? "bg-red-500 border-red-500" : "border-gray-400"}`}>
              {gender && <Check size={14} color="white" strokeWidth={3} />}
            </View>
            <Text>Female</Text>
          </Pressable>
        </View>

        {/* --- Step 2: Business Info --- */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Business Information</Text>

        <TextInput placeholder="Business Name" value={businessName} onChangeText={setBusinessName} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Trade Name" value={tradeName} onChangeText={setTradeName} className="border border-gray-400 rounded p-2 mb-3" />

        <Text className="text-base font-semibold text-gray-700 mb-2">Type of Business:</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={businessType} onValueChange={(val) => setBusinessType(val)}>
            <Picker.Item label="Sole Proprietorship" value="sole proprietorship" />
            <Picker.Item label="Partnership" value="partnership" />
            <Picker.Item label="Corporation" value="corporation" />
            <Picker.Item label="Cooperative" value="cooperative" />
            <Picker.Item label="One Person Corporation" value="one person corporation" />
            <Picker.Item label="Association" value="association" />
          </Picker>
        </View>

        <TextInput placeholder="DTI/SEC/CDA Registration No." value={registrationNo} onChangeText={setRegistrationNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Tax Identification Number (TIN)" value={tin} onChangeText={setTin} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-6" />

        {/* Buttons */}
        <View className="flex-row justify-between mb-10">
          <Pressable className="border border-red-500 rounded p-3 w-[48%] items-center" onPress={() => router.replace("/(tabs)/home")}>
            <Text className="text-red-500 font-semibold">Cancel</Text>
          </Pressable>
          <Pressable className="bg-red-500 rounded p-3 w-[48%] items-center" onPress={() => router.push("/fillup1")}>
            <Text className="text-white font-semibold">Next</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default Fillup;
