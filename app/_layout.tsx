import { Stack } from "expo-router";
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";


export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen 
          name="(tabs)"
          options={{ headerShown: false}}
        />
        <Stack.Screen 
          name="movie/[id]"
          options={{ headerShown: false}}
        />
      </Stack>
    </AuthProvider>
  );
}