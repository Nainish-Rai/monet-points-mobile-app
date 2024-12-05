import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useAuth } from "@/auth/authContext";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    // Add your authentication logic here
    login();
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 justify-center p-6 bg-black">
      <Text className="text-white text-3xl mb-8 text-center">Login</Text>
      <TextInput
        className="bg-gray-800 text-white p-4 rounded-lg mb-4"
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="bg-gray-800 text-white p-4 rounded-lg mb-6"
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg"
        onPress={handleLogin}
      >
        <Text className="text-white text-center text-lg">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
