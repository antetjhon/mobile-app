import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const Fillup1 = () => {
  // Taxpayer Address States
  const [region, setRegion] = useState("VIII - Eastern Visayas");
  const [province, setProvince] = useState("Leyte");
  const [municipality, setMunicipality] = useState("Baybay City");
  const [barangay, setBarangay] = useState("Altavista");
  const [zipcode, setZipcode] = useState("6521");
  const [houseNo, setHouseNo] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [blockNo, setBlockNo] = useState("");
  const [street, setStreet] = useState("");
  const [subdivision, setSubdivision] = useState("");

  // Business Address States
  const [bizRegion, setBizRegion] = useState("VIII - Eastern Visayas");
  const [bizProvince, setBizProvince] = useState("Leyte");
  const [bizMunicipality, setBizMunicipality] = useState("Baybay City");
  const [bizBarangay, setBizBarangay] = useState("Altavista");
  const [bizZipcode, setBizZipcode] = useState("6521");
  const [bizHouseNo, setBizHouseNo] = useState("");
  const [bizBuildingName, setBizBuildingName] = useState("");
  const [bizLotNo, setBizLotNo] = useState("");
  const [bizBlockNo, setBizBlockNo] = useState("");
  const [bizStreet, setBizStreet] = useState("");
  const [bizSubdivision, setBizSubdivision] = useState("");
  const [sameAsMain, setSameAsMain] = useState(false);

  // Lease Information States
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [suffix, setSuffix] = useState("");
  const [leasedAmount, setLeasedAmount] = useState("");
  const [mobile, setMobile] = useState("");
  const [telephone, setTelephone] = useState("");

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center bg-red-600 p-4">
        <Pressable onPress={() => router.push("/fillup")} className=" mt-6 pr-3">
          <ArrowLeft size={24} color="white" />
        </Pressable>
        <View className="flex-1 items-center mt-6">
          <Text className="text-white text-lg font-bold">Address & Lease Information</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* --- Taxpayer Address --- */}
        <Text className="text-lg font-bold text-gray-800 mb-3"> Taxpayer Address </Text>

        <Text className="text-base font-semibold text-gray-700 mb-1"> Region </Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={region} onValueChange={setRegion}>
            <Picker.Item label="VIII - Eastern Visayas" value="VIII - Eastern Visayas" />
            <Picker.Item label="NCR" value="NCR" />
            <Picker.Item label="CAR" value="CAR" />
            <Picker.Item label="VII - Central Visayas" value="VII - Central Visayas" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1">Province</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={province} onValueChange={setProvince}>
            <Picker.Item label="Leyte" value="Leyte" />
            <Picker.Item label="Southern Leyte" value="Southern Leyte" />
            <Picker.Item label="Samar" value="Samar" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1"> Municipality </Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={municipality} onValueChange={setMunicipality}>
            <Picker.Item label="Baybay City" value="Baybay City" />
            <Picker.Item label="Ormoc City" value="Ormoc City" />
            <Picker.Item label="Tacloban City" value="Tacloban City" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1"> Barangay </Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={barangay} onValueChange={setBarangay}>
            <Picker.Item label="Altavista" value="Altavista" />
            <Picker.Item label="Poblacion" value="Poblacion" />
            <Picker.Item label="Cogon" value="Cogon" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1"> Zipcode </Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={zipcode} onValueChange={setZipcode}>
            <Picker.Item label="6521" value="6521" />
            <Picker.Item label="6500" value="6500" />
            <Picker.Item label="6510" value="6510" />
          </Picker>
        </View>

        <TextInput placeholder="House/Bldg. No." value={houseNo} onChangeText={setHouseNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Name of Building" value={buildingName} onChangeText={setBuildingName} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Lot No." value={lotNo} onChangeText={setLotNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Block No." value={blockNo} onChangeText={setBlockNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Street" value={street} onChangeText={setStreet} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Subdivision" value={subdivision} onChangeText={setSubdivision} className="border border-gray-400 rounded p-2 mb-6" />

        {/* --- Business Address --- */}
        <Text className="text-lg font-bold text-gray-800 mb-3"> Business Address </Text>

        {/* Same as Main Office */}
        <Pressable onPress={() => setSameAsMain(!sameAsMain)} className="flex-row items-center mb-4">
          <View className={`w-5 h-5 mr-2 border border-gray-500 rounded items-center justify-center ${sameAsMain ? "bg-red-500" : "bg-white"}`}>
            {sameAsMain && <Check size={14} color="white" strokeWidth={3} />}
          </View>
          <Text className="text-gray-700">Same as Taxpayer Address</Text>
        </Pressable>

        <Text className="text-base font-semibold text-gray-700 mb-1"> Region </Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={bizRegion} onValueChange={setBizRegion}>
            <Picker.Item label="VIII - Eastern Visayas" value="VIII - Eastern Visayas" />
            <Picker.Item label="NCR" value="NCR" />
            <Picker.Item label="CAR" value="CAR" />
            <Picker.Item label="VII - Central Visayas" value="VII - Central Visayas" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1">Province</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={bizProvince} onValueChange={setBizProvince}>
            <Picker.Item label="Leyte" value="Leyte" />
            <Picker.Item label="Southern Leyte" value="Southern Leyte" />
            <Picker.Item label="Samar" value="Samar" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1"> Municipality </Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={bizMunicipality} onValueChange={setBizMunicipality}>
            <Picker.Item label="Baybay City" value="Baybay City" />
            <Picker.Item label="Ormoc City" value="Ormoc City" />
            <Picker.Item label="Tacloban City" value="Tacloban City" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1"> Barangay </Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={bizBarangay} onValueChange={setBizBarangay}>
            <Picker.Item label="Altavista" value="Altavista" />
            <Picker.Item label="Poblacion" value="Poblacion" />
            <Picker.Item label="Cogon" value="Cogon" />
          </Picker>
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-1">Zipcode</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={bizZipcode} onValueChange={setBizZipcode}>
            <Picker.Item label="6521" value="6521" />
            <Picker.Item label="6500" value="6500" />
            <Picker.Item label="6510" value="6510" />
          </Picker>
        </View>

        <TextInput placeholder="House/Bldg. No." value={bizHouseNo} onChangeText={setBizHouseNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Name of Building" value={bizBuildingName} onChangeText={setBizBuildingName} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Lot No." value={bizLotNo} onChangeText={setBizLotNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Block No." value={bizBlockNo} onChangeText={setBizBlockNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Street" value={bizStreet} onChangeText={setBizStreet} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Subdivision" value={bizSubdivision} onChangeText={setBizSubdivision} className="border border-gray-400 rounded p-2 mb-6" />

        {/* --- Lease Information --- */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Lease Information</Text>

        <TextInput placeholder="Last Name" value={lastname} onChangeText={setLastname} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="First Name" value={firstname} onChangeText={setFirstname} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Middle Name" value={middlename} onChangeText={setMiddlename} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Suffix" value={suffix} onChangeText={setSuffix} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Leased Amount" value={leasedAmount} onChangeText={setLeasedAmount} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Telephone Number" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" className="border border-gray-400 rounded p-2 mb-6" />

        {/* Buttons */}
        <View className="flex-row justify-between mb-6">
          <Pressable
            className="border border-red-500 rounded p-3 w-[48%] items-center"
            onPress={() => router.push("/fillup")}
          >
            <Text className="text-red-500 font-semibold"> Back </Text>
          </Pressable>
          <Pressable
            className="bg-red-500 rounded p-3 w-[48%] items-center"
            onPress={() => router.push("/fillup2")}
          >
            <Text className="text-white font-semibold"> Next </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default Fillup1;
