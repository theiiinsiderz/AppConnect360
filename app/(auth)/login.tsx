import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  radii,
  shadows,
  spacing,
  typography,
  useAppTheme,
} from "../../theme/theme";

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const isDark = theme.isDark;
  // Send OTP logic bypassed

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    router.push({ pathname: "/(auth)/otp", params: { phone } });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
          <LinearGradient
            colors={
              isDark
                ? [theme.bg, theme.bgElevated]
                : [theme.bg, theme.surfaceMuted]
            }
            style={StyleSheet.absoluteFillObject}
          />

          <View
            style={[
              styles.glowTop,
              {
                backgroundColor: theme.primaryMuted,
                borderColor: theme.border,
              },
            ]}
          />
          <View
            style={[
              styles.glowBottom,
              {
                backgroundColor: theme.primaryMuted,
                borderColor: theme.border,
              },
            ]}
          />

          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.contentInner}>
                <Animated.View
                  entering={FadeInDown.duration(800).springify()}
                  style={styles.header}
                >
                  <View
                    style={[
                      styles.brandPill,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.brandDot,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.brandPillText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      CONNECT360
                    </Text>
                  </View>

                  <Text style={[styles.title, { color: theme.text }]}>
                    Welcome
                  </Text>
                  <Text style={[styles.brandName, { color: theme.primary }]}>
                    Connect360
                  </Text>
                  <Text
                    style={[styles.subtitle, { color: theme.textSecondary }]}
                  >
                    Enter your phone number for secure OTP login
                  </Text>
                </Animated.View>

                <Animated.View
                  entering={FadeInUp.duration(800).delay(200).springify()}
                  style={[
                    styles.form,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      shadowColor: theme.shadow,
                    },
                  ]}
                >
                  <Input
                    label="Phone Number"
                    placeholder="9876543210"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ""));
                      if (error) setError("");
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    error={error}
                    leftIcon={
                      <View
                        style={[
                          styles.countryCodeChip,
                          { backgroundColor: theme.surfaceMuted },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countryCodeText,
                            { color: theme.text },
                          ]}
                        >
                          +91
                        </Text>
                      </View>
                    }
                    style={styles.input}
                  />

                  <Button
                    title="Send OTP"
                    onPress={handleSendOtp}
                    loading={loading}
                    style={styles.button}
                  />
                </Animated.View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  contentInner: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
  },
  glowTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 280,
    top: -120,
    right: -90,
    opacity: 0.55,
    borderWidth: 1,
  },
  glowBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    bottom: -80,
    left: -70,
    opacity: 0.4,
    borderWidth: 1,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  brandPillText: {
    ...typography.micro,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  brandName: {
    ...typography.display,
    fontWeight: "800",
    marginBottom: spacing.sm,
    letterSpacing: -0.7,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    fontWeight: "500",
    lineHeight: 24,
    maxWidth: 340,
    textAlign: "center",
    alignSelf: "center",
  },
  form: {
    gap: spacing.md,
    width: "100%",
    borderWidth: 1,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    ...shadows.elevated,
  },
  countryCodeChip: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  countryCodeText: {
    ...typography.body,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  input: {
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: "500",
  },
  button: {
    marginTop: spacing.xs,
    height: 54,
    borderRadius: radii.lg,
    ...shadows.elevated,
  },
});
