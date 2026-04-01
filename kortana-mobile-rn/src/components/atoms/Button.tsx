// src/components/atoms/Button.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Radius, Spacing, Shadow } from '@theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      ReactNativeHapticFeedback.trigger('impactLight');
      onPress();
    }
  };

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const Container = isPrimary ? LinearGradient : TouchableOpacity;
  const containerProps = isPrimary 
    ? { colors: Colors.gradientPrimary, start: { x: 0, y: 0 }, end: { x: 1, y: 0 } } 
    : {};

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        isOutline && styles.outline,
        disabled && styles.disabled,
        style
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={disabled ? [Colors.grey500, Colors.grey600] : Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, style]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={[styles.text, styles.primaryText, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      ) : (
        <>
          {loading ? (
            <ActivityIndicator color={isOutline ? Colors.electricBlue : Colors.white} />
          ) : (
            <Text style={[
              styles.text, 
              isOutline ? styles.outlineText : styles.ghostText,
              textStyle
            ]}>
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  outline: {
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
  },
  text: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
  },
  primaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.white,
  },
  ghostText: {
    color: Colors.skyBlue,
  },
  disabled: {
    opacity: 0.6,
  },
});
