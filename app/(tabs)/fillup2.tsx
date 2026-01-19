import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const Fillup2 = () => {
  // Business Information States
  const [activity, setActivity] = useState("Main Office");
  const [businessArea, setBusinessArea] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [femaleEmployees, setFemaleEmployees] = useState("");
  const [maleEmployees, setMaleEmployees] = useState("");
  const [employeesLGU, setEmployeesLGU] = useState("");
  const [deliveryVans, setDeliveryVans] = useState("");
  const [deliveryMC, setDeliveryMC] = useState("");
  const [taxDecNo, setTaxDecNo] = useState("");
  const [pin, setPin] = useState("");

  // Checkboxes (with Yes/No)
  const [owned, setOwned] = useState<"Yes" | "No" | null>(null);
  const [taxIncentive, setTaxIncentive] = useState<"Yes" | "No" | null>(null);
  const [sameAsMain, setSameAsMain] = useState(false);

  // Business Location Address States
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

  return (
     <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center bg-red-600 p-4">
            <Pressable onPress={() => router.push("/fillup1")} className=" mt-6 pr-3">
              <ArrowLeft size={24} color="white" />
            </Pressable>
            <View className="flex-1 items-center mt-6">
              <Text className="text-white text-lg font-bold">Business Operations</Text>
            </View>
          </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Business Information */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Business Informations</Text>

        {/* Business Activity */}
        <Text className="text-base font-semibold text-gray-700 mb-1">Business Activity</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={activity} onValueChange={setActivity}>
            <Picker.Item label="Main Office" value="Main Office" />
            <Picker.Item label="Branch Office" value="Branch Office" />
            <Picker.Item label="Admin Office Only" value="Admin Office Only" />
            <Picker.Item label="Warehouse" value="Warehouse" />
            <Picker.Item label="Others" value="Others" />
          </Picker>
        </View>

        {/* Numeric Inputs */}
        <TextInput placeholder="Business Area (in sq. m)" value={businessArea} onChangeText={setBusinessArea} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3"/>
        <TextInput placeholder="Total Floor Area" value={floorArea} onChangeText={setFloorArea} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3"/>
        <TextInput placeholder="No. of Female Employees in Establishment" value={femaleEmployees} onChangeText={setFemaleEmployees} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput  placeholder="No. of Male Employees in Establishment" value={maleEmployees} onChangeText={setMaleEmployees} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="No. of Employees Residing in LGU" value={employeesLGU} onChangeText={setEmployeesLGU} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="No. of Delivery Van/Truck" value={deliveryVans} onChangeText={setDeliveryVans} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="No. of Delivery Motorcycle" value={deliveryMC} onChangeText={setDeliveryMC} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Tax Declaration No. *" value={taxDecNo} onChangeText={setTaxDecNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Property Index Number (PIN)" value={pin} onChangeText={setPin} className="border border-gray-400 rounded p-2 mb-3" />

        {/* Owned? Yes/No */}
        <Text className="text-base font-semibold text-gray-700 mb-1">Owned?</Text>
        <View className="flex-row mb-3">
          {["Yes", "No"].map((option) => (
            <Pressable key={option} onPress={() => setOwned(option as "Yes" | "No")} className="flex-row items-center mr-6">
              <View  className={`w-5 h-5 mr-2 border border-gray-500 rounded-full items-center justify-center ${ owned === option ? "bg-red-500" : "bg-white" }`}>
                {owned && <Check size={14} color="white" strokeWidth={3}/>}
              </View>
              <Text>{option}</Text>
            </Pressable>
          ))}
        </View>

        {/* Tax Incentive? Yes/No */}
        <Text className="text-base font-semibold text-gray-700 mb-1"> Enjoying tax incentive from any Government Entity? </Text>
        <View className="flex-row mb-3">
          {["Yes", "No"].map((option) => (
            <Pressable key={option} onPress={() => setTaxIncentive(option as "Yes" | "No")}className="flex-row items-center mr-6">
              <View className={`w-5 h-5 mr-2 border border-gray-500  rounded-full items-center justify-center ${ taxIncentive === option ? "bg-red-500" : "bg-white" }`}>
                {taxIncentive && <Check size={14} color="white" strokeWidth={3}/>}
              </View>
              <Text>{option}</Text>
            </Pressable>
          ))}
        </View>

        {/* Business Location Address */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-3 ">Business Location Address</Text>

      {/* Same as Business Address */}
       <Pressable onPress={() => setSameAsMain(!sameAsMain)} className="flex-row items-center mb-4">
         <View className={`w-5 h-5 mr-2 border border-gray-500 rounded items-center justify-center ${sameAsMain ? "bg-red-500" : "bg-white"}`}>
           {sameAsMain && <Check size={14} color="white" strokeWidth={3} />}
         </View>
            <Text className="text-gray-700">Same as Business Address</Text>
      </Pressable>

        {/* Region */}
        <Text className="text-base font-semibold text-gray-700 mb-1">Region</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={region} onValueChange={setRegion}>
            <Picker.Item label="VIII - Eastern Visayas" value="VIII - Eastern Visayas" />
            <Picker.Item label="NCR" value="NCR" />
            <Picker.Item label="CAR" value="CAR" />
            <Picker.Item label="VII - Central Visayas" value="VII - Central Visayas" />
          </Picker>
        </View>

        {/* Province */}
        <Text className="text-base font-semibold text-gray-700 mb-1">Province</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={province} onValueChange={setProvince}>
            <Picker.Item label="Leyte" value="Leyte" />
            <Picker.Item label="Southern Leyte" value="Southern Leyte" />
            <Picker.Item label="Samar" value="Samar" />
          </Picker>
        </View>

        {/* Municipality */}
        <Text className="text-base font-semibold text-gray-700 mb-1">Municipality</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={municipality} onValueChange={setMunicipality}>
            <Picker.Item label="Baybay City" value="Baybay City" />
            <Picker.Item label="Ormoc City" value="Ormoc City" />
            <Picker.Item label="Tacloban City" value="Tacloban City" />
          </Picker>
        </View>

        {/* Barangay */}
        <Text className="text-base font-semibold text-gray-700 mb-1">Barangay</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={barangay} onValueChange={setBarangay}>
            <Picker.Item label="Altavista" value="Altavista" />
            <Picker.Item label="Poblacion" value="Poblacion" />
            <Picker.Item label="Cogon" value="Cogon" />
          </Picker>
        </View>

        {/* Zipcode */}
        <Text className="text-base font-semibold text-gray-700 mb-1">Zipcode</Text>
        <View className="border border-gray-400 rounded mb-3">
          <Picker selectedValue={zipcode} onValueChange={setZipcode}>
            <Picker.Item label="6521" value="6521" />
            <Picker.Item label="6500" value="6500" />
            <Picker.Item label="6510" value="6510" />
          </Picker>
        </View>

        {/* Address Inputs */}
        <TextInput placeholder="House/Bldg. No." value={houseNo} onChangeText={setHouseNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Name of Building" value={buildingName} onChangeText={setBuildingName} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Lot No." value={lotNo} onChangeText={setLotNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Block No." value={blockNo} onChangeText={setBlockNo} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Street" value={street} onChangeText={setStreet} className="border border-gray-400 rounded p-2 mb-3" />
        <TextInput placeholder="Subdivision" value={subdivision} onChangeText={setSubdivision} className="border border-gray-400 rounded p-2 mb-6" />

        {/* Buttons */}
        <View className="flex-row justify-between mb-6">
          <Pressable className="border border-red-500 rounded p-3 w-[48%] items-center" onPress={() => router.push("/fillup1")}>
            <Text className="text-red-500 font-semibold">Back</Text>
          </Pressable>
          <Pressable className="bg-red-500 rounded p-3 w-[48%] items-center" onPress={() => router.push("/fillup3")}>
            <Text className="text-white font-semibold">Next</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default Fillup2;
