import { Tabs } from "expo-router";
import { FilePenLine } from "lucide-react-native";
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const _Layout = () => {
  return (
    <>
     <StatusBar 
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={['left', 'right', 'bottom']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "gray",
          tabBarShowLabel: true,
        }}
      >
        <Tabs.Screen
          name="next"
          options={{
            title: "select",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size }) => <TextSelectIcon color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Login",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="signup"
          options={{
            title: "signup",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: "home",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size}) => <SaveIcon color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="fillup"
          options={{
            title: "fillup",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size}) => <FilePenLine color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="fillup1"
          options={{
            title: "fillup1",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FilePenLine color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="fillup2"
          options={{
            title: "fillup2",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FilePenLine color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="fillup3"
          options={{
            title: "fillup3",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FilePenLine color={color} size={size} />
            ),
          }}
        />
         <Tabs.Screen
          name="transaction"
          options={{
            title: "transaction",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size}) => <User2 color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: "about",
            headerShown: false,
            tabBarStyle: { display: "none" },
            //tabBarIcon: ({ color, size}) => <User2 color={color} size={size} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
    </>
  );
};

export default _Layout;
