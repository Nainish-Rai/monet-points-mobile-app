import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";

interface LoginFormProps {
  isLoading?: boolean;
  error?: string;
  onSuccess: (data: { mobileNumber: string }) => void;
}

const LoginForm = ({ isLoading, error, onSuccess }: LoginFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  const onSelectCountry = (country: any) => {
    setCountryCode(country.cca2);
    setSelectedCountry(country);
    setCountryPickerVisible(false);
  };

  const handleSubmit = () => {
    if (phoneNumber) {
      onSuccess({ mobileNumber: phoneNumber });
    }
  };

  const isValidPhoneNumber = phoneNumber.length >= 10;

  return (
    <View className="flex  gap-4">
      {/* <PhoneInput
        value={phoneNumber}
        layout="first"
        onChangeText={(set) => setPhoneNumber(set)}
        onChangeCountry={(country) => setRegCode(country.callingCode[0])}
        withDarkTheme
        withShadow={false}
        autoFocus={false}
        placeholder="Enter phone number"
        containerStyle={{
          backgroundColor: "#1f1f1f",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#333333",
          width: "100%",
        }}
        textContainerStyle={{ backgroundColor: "#2c2c2c" }}
        textInputStyle={{ color: "#ffffff" }}
        codeTextStyle={{ color: "#ffffff" }}
        textInputProps={{
          placeholderTextColor: "#666",
        }}
        countryPickerButtonStyle={{ backgroundColor: "#2c2c2c" }}
        disabled={isLoading}
      /> */}
      {/* <CountryPicker
        withFilter={true}
        withFlagButton={false}
        withCountryNameButton={false}
        onSelect={onSelectCountry}
        onClose={() => setCountryPickerVisible(false)}
        visible={countryPickerVisible}
        containerButtonStyle={styles.countryPickerButton}
        countryCode="IN"
      /> */}
      <TextInput
        className="bg-black border border-neutral-800 p-4 text-white rounded-2xl"
        placeholder="Enter phone number"
        placeholderTextColor="#666"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        maxLength={10}
        editable={!isLoading}
      />

      {error && <Text className="text-red-500 text-sm">{error}</Text>}
      <TouchableOpacity
        className={`${
          isValidPhoneNumber ? "bg-yellow-500/90" : "bg-neutral-800/50"
        } p-4 rounded-2xl transition-colors`}
        onPress={handleSubmit}
        disabled={!isValidPhoneNumber || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={isValidPhoneNumber ? "#000" : "#666"} />
        ) : (
          <Text
            className={`text-center font-bold  text-lg ${
              isValidPhoneNumber ? "text-black" : "text-neutral-500"
            }`}
          >
            Send OTP
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  phoneInput: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  countryButton: {
    marginBottom: 20,
  },
  countryPickerButton: {
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  countryPickerCloseButton: {
    width: 20,
    height: 20,
  },
  submitButton: {
    width: "100%",
  },
});
