import { View, Text } from "react-native";
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

  // Add authentication check effect with AsyncStorage
  useEffect(() => {
    const checkTokens = async () => {
      try {
        const storedAccessToken = await AsyncStorage.getItem("accessToken");
        if (storedAccessToken) {
          setAccessToken(JSON.parse(storedAccessToken));
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking stored tokens:", error);
      }
    };

    checkTokens();
  }, []);

  useEffect(() => {
    if (loginData) {
      setCurrentView("otp");
    }

    if (verifyOtpData) {
      // Redirect to dashboard
      const { id, tokens } = verifyOtpData;
      const { access, refresh } = tokens;

      // Store tokens in AsyncStorage
      const storeTokens = async () => {
        try {
          await AsyncStorage.setItem("accessToken", JSON.stringify(access));
          await AsyncStorage.setItem("refreshToken", JSON.stringify(refresh));
          await AsyncStorage.setItem("consumerId", id);
        } catch (error) {
          console.error("Error storing tokens:", error);
        }
      };

      storeTokens();
      setAccessToken(access);
      setRefreshToken(refresh);
      setConsumerId(id);
      router.push("/(tabs)");
      setCurrentView("login");
    }
  }, [loginData, verifyOtpData]);

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
        // router.push({
        //   pathname: "/otp",
        //   params: {
        //     requestId: result.requestId,
        //     phone: data.mobileNumber,
        //   },
        // });
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

        // Store tokens in AsyncStorage
        await AsyncStorage.setItem("accessToken", JSON.stringify(access));
        await AsyncStorage.setItem("refreshToken", JSON.stringify(refresh));
        await AsyncStorage.setItem("consumerId", result.id);

        setAccessToken(access);
        setRefreshToken(refresh);
        setConsumerId(result.id);
        router.replace("/(tabs)");
        setCurrentView("login");
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
      <View className="min-h-screen bg-black flex  justify-center px-4">
        <View className="space-y-6  pt-12">
          <View className="space-y-2 mb-4">
            <Text className="text-white text-3xl font-bold">Welcome Back</Text>
            <Text className="text-neutral-400">
              Sign in using your mobile number
            </Text>
          </View>

          {currentView === "login" && (
            <LoginForm
              isLoading={isLoading}
              error={error}
              onSuccess={(data) => {
                // handleConsumerLogin("+91", data.mobileNumber);
                handleLogin(data);
              }}
            />
          )}

          {currentView === "otp" && (
            <OtpVerificationForm
              error={errorMessage}
              onSuccess={(data) => {
                // handleLoginVerifyOtp(data.otp);
                handleOtp(data);
              }}
            />
          )}

          <View className="mt-4">
            <Text className="text-neutral-500 text-center text-sm">
              By continuing, you agree to our{" "}
              <Text className="text-yellow-500">Terms of Service</Text> and{" "}
              <Text className="text-yellow-500">Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default LoginScreen;
