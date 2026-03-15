import 'package:flutter/material.dart';

class KortanaRadius {
  static const double xs    = 4.0;   // Tags, badges
  static const double sm    = 8.0;   // Inputs, small buttons
  static const double md    = 12.0;  // Inner card elements
  static const double lg    = 16.0;  // Cards, containers
  static const double xl    = 20.0;  // Primary cards
  static const double xxl   = 24.0;  // Bottom sheets, modals
  static const double xxxl  = 32.0;  // Hero cards
  static const double full  = 999.0; // Pills, avatars, circular

  static BorderRadius get cardRadius  => BorderRadius.circular(lg);
  static BorderRadius get heroRadius  => BorderRadius.circular(xxxl);
  static BorderRadius get pillRadius  => BorderRadius.circular(full);
  static BorderRadius get sheetRadius => const BorderRadius.vertical(
    top: Radius.circular(xxl),
  );
}
