// src/theme/typography.ts
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
// Super basic proportional scaling based on iPhone 8 baseline (375 pixels wide)
const scale = (size: number) => (width / 375) * size;

export const Typography = {
  // Font Families
  fontPrimary:   'Inter',           // Body, labels, numbers
  fontDisplay:   'Inter Display',   // Hero numbers, balances
  fontMono:      'JetBrains Mono', // Addresses, hashes, hex values

  // Font Weights
  light:         '300' as const,
  regular:       '400' as const,
  medium:        '500' as const,
  semiBold:      '600' as const,
  bold:          '700' as const,
  extraBold:     '800' as const,

  // Font Sizes (Responsive — use scale() utility)
  xs:     scale(11),
  sm:     scale(13),
  base:   scale(15),
  md:     scale(17),
  lg:     scale(20),
  xl:     scale(24),
  '2xl':  scale(28),
  '3xl':  scale(34),
  '4xl':  scale(42),
  '5xl':  scale(52),    // Hero balance display
  hero:   scale(64),    // Splash / massive display numbers

  // Letter Spacing
  tightTracking:  -0.5,
  normalTracking:  0,
  wideTracking:    0.5,
  monoTracking:    1.2,  // For addresses
};
