import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View, } from "react-native";

const Fillup3 = ({ navigation }: any) => {
  // Business Lines
  const [businessLines, setBusinessLines] = useState<{ code: string; description: string }[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [businessModalVisible, setBusinessModalVisible] = useState(false);

  // Example list
  const sampleBusinesses = [
    { code: "001", description: "Sari-sari Store" },
    { code: "002", description: "Billiards" },
    { code: "003", description: "Hotel" },
  ];

  const addBusinessLine = (item: { code: string; description: string }) => {
    setBusinessLines([...businessLines, item]);
    setBusinessModalVisible(false);
    setSearchQuery("");
  };

  // Inputs
  const [capital, setCapital] = useState("");
  const [essential, setEssential] = useState("");
  const [nonEssential, setNonEssential] = useState("");

  // Measure Modal
  const [measureModalVisible, setMeasureModalVisible] = useState(false);
  const [units, setUnits] = useState("");
  const [capacity, setCapacity] = useState("");
  const [measure, setMeasure] = useState("");
  const [lineBusiness, setLineBusiness] = useState("");

  // Measures state
  const [measures, setMeasures] = useState<{ units: string; capacity: string; measure: string; lineBusiness: string }[]>([]);

  // Documents
  const [documents, setDocuments] = useState<{
    barangay?: string;
    fire?: string;
    mayor?: string;
    sanitary?: string;
  }>({});

  const pickDocument = async (field: keyof typeof documents) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setDocuments({ ...documents, [field]: file.name });
      }
    } catch (error) {
      console.error("DocumentPicker error:", error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center bg-red-600 p-4">
        <Pressable onPress={() => router.push("/fillup1")} className="mt-6 pr-3">
          <ArrowLeft size={24} color="white" />
        </Pressable>
        <View className="flex-1 items-center mt-6">
          <Text className="text-white text-lg font-bold">Business Activity/Requirements</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Line of Business */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Line of Business</Text>

        <Pressable className="flex-row items-center bg-red-500 p-3 rounded mb-4" onPress={() => setBusinessModalVisible(true)}>
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Business Line</Text>
        </Pressable>

        {businessLines.map((item, idx) => (
          <View key={idx} className="border p-3 mb-3 rounded bg-gray-50 relative">
            <Text className="text-gray-700 mb-1">Code</Text>
            <TextInput value={item.code} editable={false} className="border border-gray-300 rounded p-2 mb-2 bg-gray-200" />
            <Text className="text-gray-700 mb-1">Description</Text>
            <TextInput value={item.description} editable={false} className="border border-gray-300 rounded p-2 mb-2 bg-gray-200" />
            <Text className="text-gray-700 mb-1">Capital</Text>
            <TextInput placeholder="Capital" value={capital} onChangeText={setCapital} className="border border-gray-400 rounded bg-white p-2 mb-3" keyboardType="numeric" />
            <Text className="text-gray-700 mb-1">Essential</Text>
            <TextInput placeholder="Essential" value={essential} onChangeText={setEssential} className="border border-gray-400 rounded bg-white p-2 mb-3" keyboardType="numeric" />
            <Text className="text-gray-700 mb-1">Non-Essential</Text>
            <TextInput placeholder="Non-Essential" value={nonEssential} onChangeText={setNonEssential} className="border border-gray-400 rounded bg-white p-2 mb-3" keyboardType="numeric" />
            <Pressable className="absolute top-2 right-2" onPress={() => setBusinessLines(businessLines.filter((_, i) => i !== idx))}>
              <Trash2 size={20} color="red" />
            </Pressable>
          </View>
        ))}

        {/* Add Measure & Pax */}
        <Text className="text-lg font-bold text-gray-800 mt-4 mb-3">Measure and Pax</Text>
        <Pressable className={`flex-row items-center p-3 rounded mb-4 ${businessLines.length === 0 ? "bg-gray-300" : "bg-red-500"}`}
          disabled={businessLines.length === 0}
          onPress={() => setMeasureModalVisible(true)}>
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Measure and Pax</Text>
        </Pressable>

        {/* List of Measures */}
        {measures.map((m, idx) => (
          <View key={idx} className="border p-3 mb-3 rounded bg-gray-50 relative">

            <Text className="text-gray-700 mb-1">Units</Text>
            <TextInput value={m.units} onChangeText={(text) => {
              const updated = [...measures]; updated[idx].units = text; setMeasures(updated);
            }}
              className="border border-gray-300 rounded p-2 mb-2 bg-white" keyboardType="numeric" />

            <Text className="text-gray-700 mb-1">Capacity</Text>
            <TextInput value={m.capacity} onChangeText={(text) => {
              const updated = [...measures]; updated[idx].capacity = text; setMeasures(updated);
            }}
              className="border border-gray-300 rounded p-2 mb-2 bg-white" keyboardType="numeric" />

            <Text className="text-gray-700 mb-1">Measure</Text>
            <TextInput value={m.measure} editable={false} className="border border-gray-300 rounded p-2 mb-2 bg-gray-200" />
            <Text className="text-gray-700 mb-1">Line of Business</Text>
            <TextInput value={m.lineBusiness} editable={false} className="border border-gray-300 rounded p-2 mb-2 bg-gray-200" />
            <Pressable className="absolute top-2 right-2" onPress={() =>
              setMeasures(measures.filter((_, i) => i !== idx))}>
              <Trash2 size={20} color="red" />
            </Pressable>
          </View>
        ))}

        {/* Documentary Requirements */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Documentary Requirements</Text>
        {[
          { field: "barangay", label: "Barangay Certificate" },
          { field: "fire", label: "Fire Safety Inspection Certificate" },
          { field: "mayor", label: "Old Mayor's Permit" },
          { field: "sanitary", label: "Sanitary Permit" },
        ].map((doc) => (
          <Pressable key={doc.field} className="border border-gray-400 rounded p-3 mb-3 flex-row justify-between items-center" onPress={() =>
            pickDocument(doc.field as keyof typeof documents)}>
            <Text>{doc.label}</Text>
            <Text className="text-gray-500">
              {documents[doc.field as keyof typeof documents] || "Upload"}
            </Text>
          </Pressable>
        ))}

        {/* Buttons */}
        <View className="flex-row justify-between mt-6 mb-10">
          <Pressable className="border border-red-500 rounded p-3 w-[48%] items-center" onPress={() => router.push("/fillup2")}>
            <Text className="text-red-500 font-semibold">Back</Text>
          </Pressable>
          <Pressable className="bg-red-500 rounded p-3 w-[48%] items-center" onPress={() => router.push("/home")}>
            <Text className="text-white font-semibold">Next</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal for Search Business Line */}
      <Modal visible={businessModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-[90%] p-4 rounded-lg">
            <Text className="text-lg font-bold mb-3">Search Business Line</Text>
            <TextInput placeholder="Search code or description..." value={searchQuery} onChangeText={setSearchQuery} className="border border-gray-400 rounded p-2 mb-3" />

            <FlatList data={sampleBusinesses.filter((b) =>
              b.code.includes(searchQuery) || b.description.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyExtractor={(item) => item.code} renderItem={({ item }) => (
                <Pressable className="p-3 border-b border-gray-200" onPress={() => addBusinessLine(item)}>
                  <Text className="font-bold">{item.code}</Text>
                  <Text>{item.description}</Text>
                </Pressable>
              )} />

            <Pressable className="bg-red-500 p-3 rounded mt-3 items-center" onPress={() => setBusinessModalVisible(false)}>
              <Text className="text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal for Add Measure & Pax */}
      <Modal visible={measureModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-[90%] p-4 rounded-lg">
            <Text className="text-lg font-bold mb-3">Add Measure and Pax</Text>

            <TextInput placeholder="Number of Units" value={units} onChangeText={setUnits} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />
            <TextInput placeholder="Capacity" value={capacity} onChangeText={setCapacity} keyboardType="numeric" className="border border-gray-400 rounded p-2 mb-3" />

            {/* Dropdown Measure/Pax */}
            <Picker selectedValue={measure} onValueChange={(itemValue) => setMeasure(itemValue)} style={{ marginBottom: 15 }}>
              <Picker.Item label="Select Measure or Pax" value="" />
              <Picker.Item label="Complete set of weights" value="weights" />
              <Picker.Item label="Computer" value="computer" />
              <Picker.Item label="Delivery truck" value="truck" />
              <Picker.Item label="Linear metric" value="linear" />
            </Picker>

            {/* Dropdown from Business Lines */}
            <Picker selectedValue={lineBusiness} onValueChange={(itemValue) => setLineBusiness(itemValue)} style={{ marginBottom: 15 }}>
              <Picker.Item label="Select Line of Business" value="" />
              {businessLines.map((line, idx) => (
                <Picker.Item key={idx}
                  label={`${line.code} - ${line.description}`}
                  value={`${line.code} - ${line.description}`}
                />
              ))}
            </Picker>

            {/* Save + Close */}
            <View className="flex-row justify-between">
              <Pressable className="bg-gray-300 p-3 rounded w-[48%] items-center" onPress={() => setMeasureModalVisible(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable className="bg-red-500 p-3 rounded w-[48%] items-center" onPress={() => {
                if (units && capacity && measure && lineBusiness) {
                  setMeasures([
                    ...measures,
                    { units, capacity, measure, lineBusiness },
                  ]);
                  setUnits("");
                  setCapacity("");
                  setMeasure("");
                  setLineBusiness("");
                  setMeasureModalVisible(false);
                }
              }}
              >
                <Text className="text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Fillup3;
