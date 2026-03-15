import 'dart:ui';
import 'package:flutter/material.dart';

class KortanaTextStyles {
  // Display — Balance & Hero Numbers
  static const TextStyle displayXXL = TextStyle(
    fontFamily: 'ClashDisplay', fontSize: 52,
    fontWeight: FontWeight.w800, letterSpacing: -1.5,
    fontFeatures: [FontFeature.tabularFigures()],
  );
  static const TextStyle displayXL = TextStyle(
    fontFamily: 'ClashDisplay', fontSize: 40,
    fontWeight: FontWeight.w700, letterSpacing: -1.0,
  );
  static const TextStyle displayLG = TextStyle(
    fontFamily: 'ClashDisplay', fontSize: 30,
    fontWeight: FontWeight.w700, letterSpacing: -0.5,
  );

  // Headings — Screen & Section Titles
  static const TextStyle headingXL  = TextStyle(fontSize: 24, fontWeight: FontWeight.w700);
  static const TextStyle headingLG  = TextStyle(fontSize: 20, fontWeight: FontWeight.w600);
  static const TextStyle headingMD  = TextStyle(fontSize: 18, fontWeight: FontWeight.w600);

  // Body — UI Text
  static const TextStyle bodyLG     = TextStyle(fontSize: 16, fontWeight: FontWeight.w500);
  static const TextStyle bodyMD     = TextStyle(fontSize: 14, fontWeight: FontWeight.w400);
  static const TextStyle bodySM     = TextStyle(fontSize: 12, fontWeight: FontWeight.w400);

  // Monospace — Addresses, Hashes
  static const TextStyle monoMD = TextStyle(
    fontFamily: 'JetBrainsMono', fontSize: 14,
    fontWeight: FontWeight.w500, letterSpacing: 0.3,
  );
  static const TextStyle monoSM = TextStyle(
    fontFamily: 'JetBrainsMono', fontSize: 12,
    fontWeight: FontWeight.w400, letterSpacing: 0.2,
  );
}
