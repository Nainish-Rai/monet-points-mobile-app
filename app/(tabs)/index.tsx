import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/authContext";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="p-4">
        <Text className="text-white text-2xl">Home</Text>
        <TouchableOpacity
          className="bg-red-500 p-4 rounded-lg mt-4"
          onPress={handleLogout}
        >
          <Text className="text-white text-center">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
