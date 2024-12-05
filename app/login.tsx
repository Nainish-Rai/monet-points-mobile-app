import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Animated,
} from "react-native";

import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginForm from "../components/forms/login-form";

import { router } from "expo-router";
import endpoints from "@/config/endpoints";
import { useConsumerLogin } from "@/hooks/apis/useConsumerLogin";
import { useTokenStore } from "@/store/tokenStore";
import OtpVerificationForm from "@/components/forms/otp-verification-form";
import { Token } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLoginStore from "@/store/useLoginStore";
import { useAuth } from "@/auth/authContext";

type Tokens = {
  access: Token;
  refresh: Token;
};

interface OtpResponse {
  message: string;
  tokens: Tokens;
  id: string;
}

function LoginScreen() {
  const [isLoading, setIsLoading] = React.useState(false);

  const [error, setError] = React.useState<string>();

  const { setAccessToken, setConsumerId, setRefreshToken } = useTokenStore();

  const {
    isLoggingIn,
    isVerifyingOtp,
    errorMessage,
    handleLogin: handleConsumerLogin,
    loginData,
    handleVerifyOtp: handleLoginVerifyOtp,
    verifyOtpData,
  } = useConsumerLogin();

  const {
    mobileNumber,
    setMobileNumber,
    currentView,
    setCurrentView,
    setRequestId,
    requestId,
  } = useLoginStore();

  const { login } = useAuth();

  const loginFadeAnim = React.useRef(new Animated.Value(1)).current;
  const otpFadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loginData) {
      setCurrentView("otp");
    }

    if (verifyOtpData) {
      const { tokens } = verifyOtpData;
      const { access, refresh } = tokens;

      login({
        accessToken: access.token,
        refreshToken: refresh.token,
      });

      router.replace("/(tabs)");
      setCurrentView("login");
    }
  }, [loginData, verifyOtpData]);

  useEffect(() => {
    if (currentView === "otp") {
      Animated.parallel([
        Animated.timing(loginFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(otpFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(loginFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(otpFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentView]);

  const handleLogin = async (data: { mobileNumber: string }) => {
    try {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch(endpoints.auth.consumerLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryCode: "+91",
          mobileNumber: data.mobileNumber.replace(/[^0-9]/g, ""),
        }),
      });

      if (!response.ok) {
        setError("Failed to send OTP. Please try again.");
        throw new Error("Failed to send OTP");
      }

      const result: { requestId: string; message: string } =
        await response.json();

      if (result.requestId) {
        setMobileNumber(data.mobileNumber);
        setCurrentView("otp");
        setRequestId(result.requestId);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtp = async (data: { otp: string }) => {
    try {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch(endpoints.auth.consumerLoginVerifyOtp, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestId,
          otp: data.otp,
          countryCode: "+91",
          mobileNumber: mobileNumber.replace(/[^0-9]/g, ""),
        }),
      });

      if (!response.ok) {
        setError("Failed to verify OTP. Please try again.");
        throw new Error("Failed to verify OTP");
      }

      const result: OtpResponse = await response.json();

      if (result.id) {
        const { access, refresh } = result.tokens;

        await AsyncStorage.setItem("accessToken", JSON.stringify(access));
        await AsyncStorage.setItem("refreshToken", JSON.stringify(refresh));
        await AsyncStorage.setItem("consumerId", result.id);

        setAccessToken(access);
        setRefreshToken(refresh);
        setConsumerId(result.id);
        setCurrentView("login");
        router.replace("/(tabs)");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="min-h-screen bg-black flex pt-[52%]  px-4">
            <View className="space-y-6  pt-12">
              <Animated.View
                style={{
                  opacity: loginFadeAnim,
                  display: currentView === "login" ? "flex" : "none",
                }}
              >
                <View className="space-y-2 mb-4">
                  <Text className="text-white text-3xl font-bold">
                    Welcome Back
                  </Text>
                  <Text className="text-neutral-400">
                    Sign in using your mobile number
                  </Text>
                </View>
                <LoginForm
                  isLoading={isLoading}
                  error={error}
                  onSuccess={(data) => {
                    handleLogin(data);
                  }}
                />
              </Animated.View>

              <Animated.View
                style={{
                  opacity: otpFadeAnim,
                  display: currentView === "otp" ? "flex" : "none",
                }}
              >
                <View className="space-y-2 mb-4">
                  <View>
                    <TouchableOpacity onPress={() => setCurrentView("login")}>
                      <Text className="text-yellow-500">Back</Text>
                    </TouchableOpacity>
                    <Text className="text-white text-3xl font-bold">
                      Verify OTP
                    </Text>
                  </View>
                  <Text className="text-neutral-400">
                    Enter the OTP sent to your mobile number
                  </Text>
                </View>
                <OtpVerificationForm
                  error={errorMessage}
                  isLoading={isLoading}
                  onSuccess={(data) => {
                    handleOtp(data);
                  }}
                />
              </Animated.View>

              <View className="mt-4">
                <Text className="text-neutral-500 text-center text-sm">
                  By continuing, you agree to our{" "}
                  <Text className="text-yellow-500">Terms of Service</Text> and{" "}
                  <Text className="text-yellow-500">Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default LoginScreen;
