import 'package:flutter/material.dart';
import 'package:kortana_wallet/core/theme/text_styles.dart';

class AppTheme {
  // ─── Core Colors ────────────────────────────────────────────────
  static const Color kortanaBlue       = Color(0xFF0066FF);
  static const Color deepOcean         = Color(0xFF003FCC);
  static const Color electricBlue      = Color(0xFF1A8CFF);
  static const Color neonAzure         = Color(0xFF00AAFF);
  static const Color abyssBlack        = Color(0xFF010817);
  static const Color deepMidnight      = Color(0xFF020D24);
  static const Color darkSapphire      = Color(0xFF050F2E);
  static const Color charcoalNavy      = Color(0xFF0A1628);
  static const Color cardDark          = Color(0xFF0D1F3C);
  static const Color elevatedCard      = Color(0xFF112040);
  static const Color pureWhite         = Color(0xFFFFFFFF);
  static const Color ghostWhite        = Color(0xFFF8FAFF);
  static const Color pearlWhite        = Color(0xFFEAF1FF);
  static const Color successTeal       = Color(0xFF00D4A3);
  static const Color warningAmber      = Color(0xFFFFB800);
  static const Color errorRed          = Color(0xFFFF3B5C);
  static const Color pendingViolet     = Color(0xFF9B6DFF);

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary:          kortanaBlue,
      onPrimary:        pureWhite,
      secondary:        electricBlue,
      onSecondary:      pureWhite,
      surface:          cardDark,
      onSurface:        pureWhite,
      background:       abyssBlack,
      onBackground:     pureWhite,
      error:            errorRed,
      onError:          pureWhite,
      outline:          Color(0xFF1A3A6B),
    ),
    scaffoldBackgroundColor: abyssBlack,
    fontFamily: 'PlusJakartaSans',
    textTheme: _buildTextTheme(Brightness.dark),
    cardTheme: _buildCardTheme(),
    elevatedButtonTheme: _buildElevatedButtonTheme(),
    inputDecorationTheme: _buildInputTheme(),
    bottomNavigationBarTheme: _buildBottomNavTheme(),
    appBarTheme: _buildAppBarTheme(),
    dividerTheme: const DividerThemeData(color: Color(0x1A0066FF), thickness: 1),
  );

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary:      kortanaBlue,
      onPrimary:    pureWhite,
      secondary:    electricBlue,
      surface:      ghostWhite,
      background:   Color(0xFFF0F5FF),
      onBackground: Color(0xFF020D24),
    ),
    scaffoldBackgroundColor: const Color(0xFFF0F5FF),
    fontFamily: 'PlusJakartaSans',
    textTheme: _buildTextTheme(Brightness.light),
  );

  static TextTheme _buildTextTheme(Brightness brightness) {
    final color = brightness == Brightness.dark ? pureWhite : Color(0xFF020D24);
    return TextTheme(
      displayLarge:  KortanaTextStyles.displayXXL.copyWith(color: color),
      displayMedium: KortanaTextStyles.displayXL.copyWith(color: color),
      displaySmall:  KortanaTextStyles.displayLG.copyWith(color: color),
      headlineLarge: KortanaTextStyles.headingXL.copyWith(color: color),
      headlineMedium: KortanaTextStyles.headingLG.copyWith(color: color),
      headlineSmall: KortanaTextStyles.headingMD.copyWith(color: color),
      bodyLarge:     KortanaTextStyles.bodyLG.copyWith(color: color),
      bodyMedium:    KortanaTextStyles.bodyMD.copyWith(color: color),
      bodySmall:     KortanaTextStyles.bodySM.copyWith(color: color),
    );
  }

  static CardThemeData _buildCardTheme() => CardThemeData(
    color: cardDark,
    elevation: 0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    clipBehavior: Clip.antiAlias,
  );

  static ElevatedButtonThemeData _buildElevatedButtonTheme() => ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: kortanaBlue,
      foregroundColor: pureWhite,
      minimumSize: const Size(double.infinity, 56),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      textStyle: KortanaTextStyles.bodyLG.copyWith(fontWeight: FontWeight.w700),
      elevation: 0,
    ),
  );

  static InputDecorationTheme _buildInputTheme() => InputDecorationTheme(
    filled: true,
    fillColor: const Color(0xFF0F1C38),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide.none,
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    hintStyle: KortanaTextStyles.bodyMD.copyWith(color: pureWhite.withOpacity(0.4)),
    labelStyle: KortanaTextStyles.bodyMD,
  );

  static BottomNavigationBarThemeData _buildBottomNavTheme() => const BottomNavigationBarThemeData(
    backgroundColor: Colors.transparent,
    selectedItemColor: kortanaBlue,
    unselectedItemColor: Color(0x66FFFFFF),
    type: BottomNavigationBarType.fixed,
    elevation: 0,
  );

  static AppBarTheme _buildAppBarTheme() => const AppBarTheme(
    backgroundColor: Colors.transparent,
    elevation: 0,
    centerTitle: true,
    iconTheme: IconThemeData(color: pureWhite),
    titleTextStyle: TextStyle(
      fontSize: 18,
      fontWeight: FontWeight.w600,
      color: pureWhite,
    ),
  );
}
