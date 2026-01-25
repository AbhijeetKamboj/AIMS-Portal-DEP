import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

export default function LoadingButton({
  loading,
  onClick,
  children,
  variant = "primary",
  style,
  disabled,
  ...props
}) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onClick}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant] || styles.primary,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === "secondary" ? "#111" : "#fff"}
            style={styles.spinner}
          />
        )}
        <Text
          style={[
            styles.text,
            variant === "secondary" && styles.textSecondary,
          ]}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  textSecondary: {
    color: "#111",
  },

  spinner: {
    marginRight: 6,
  },

  disabled: {
    opacity: 0.5,
  },

  /* Variants */
  primary: {
    backgroundColor: "#000",
  },

  secondary: {
    backgroundColor: "#e5e7eb",
  },

  accent: {
    backgroundColor: "#6366f1",
  },

  success: {
    backgroundColor: "#16a34a",
  },

  danger: {
    backgroundColor: "#dc2626",
  },
});
