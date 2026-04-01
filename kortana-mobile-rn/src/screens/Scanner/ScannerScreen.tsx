// src/screens/Scanner/ScannerScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width, height } = Dimensions.get('window');

export const ScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const navigation = useNavigation<any>();
  const device = useCameraDevice('back');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        ReactNativeHapticFeedback.trigger('notificationSuccess');
        const scannedValue = codes[0].value;
        // Basic check if it's an address
        if (scannedValue.startsWith('0x')) {
            navigation.navigate('SendAmount', { recipientAddress: scannedValue });
        } else if (scannedValue.startsWith('wc:')) {
            // Handle WalletConnect URI
            navigation.navigate('WalletConnect', { uri: scannedValue });
        } else {
            Alert.alert('Invalid QR', 'This does not appear to be a valid wallet address or WalletConnect URI.');
        }
      }
    },
  });

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {hasPermission ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Camera permission not granted</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Scan QR Code</Text>
            <View style={{ width: 44 }} />
        </View>

        <View style={styles.finderBoundary}>
            <View style={styles.finder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.hint}>Align QR code within the frame</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 20,
    color: 'white',
  },
  title: {
    color: 'white',
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  finderBoundary: {
    alignItems: 'center',
  },
  finder: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 0,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.electricBlue,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: Radius.lg,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: Radius.lg,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: Radius.lg,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: Radius.lg,
  },
  hint: {
    color: 'white',
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    marginTop: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
});
