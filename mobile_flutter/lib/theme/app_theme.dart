import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Palette
  static const Color brandGold = Color(0xFFD97706);
  static const Color brandGoldLight = Color(0xFFFBBF24);
  static const Color brandPrimary = Color(0xFF1C64F2);
  static const Color brandRose = Color(0xFFFF6B6B);
  static const Color creamGold = Color(0xFFE5CC82);

  // Light Theme (Cream)
  static const Color creamBg = Color(0xFFF6F1E3);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightText = Color(0xFF1A1A1A);
  static const Color lightTextMuted = Color(0xFF8E8B82);

  // Dark Theme (Deep)
  static const Color darkBg = Color(0xFF05050A);
  static const Color darkSurface = Color(0xFF0A0A14);
  static const Color darkBorder = Color(0xFF1A1A2E);
  static const Color darkText = Colors.white;
  static const Color darkTextMuted = Color(0xFF94A3B8);

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: creamBg,
      primaryColor: brandGold,
      colorScheme: const ColorScheme.light(
        primary: brandGold,
        secondary: brandPrimary,
        surface: lightSurface,
      ),
      textTheme: GoogleFonts.outfitTextTheme(
        const TextTheme(
          displayLarge: TextStyle(color: lightText, fontWeight: FontWeight.w900, fontSize: 32, letterSpacing: -0.5),
          titleLarge: TextStyle(color: lightText, fontWeight: FontWeight.bold, fontSize: 22, letterSpacing: -0.5),
          bodyLarge: TextStyle(color: lightText, fontSize: 16),
          bodyMedium: TextStyle(color: lightTextMuted, fontSize: 14),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: creamBg,
        elevation: 0,
        iconTheme: IconThemeData(color: lightText),
        titleTextStyle: TextStyle(color: lightText, fontWeight: FontWeight.w900, fontSize: 20, letterSpacing: -1),
      ),
      cardTheme: CardThemeData(
        color: lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0x0D000000))),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBg,
      primaryColor: brandGold,
      colorScheme: const ColorScheme.dark(
        primary: brandGold,
        secondary: brandPrimary,
        surface: darkSurface,
      ),
      textTheme: GoogleFonts.outfitTextTheme(
        const TextTheme(
          displayLarge: TextStyle(color: darkText, fontWeight: FontWeight.w900, fontSize: 32, letterSpacing: -0.5),
          titleLarge: TextStyle(color: darkText, fontWeight: FontWeight.bold, fontSize: 22, letterSpacing: -0.5),
          bodyLarge: TextStyle(color: darkText, fontSize: 16),
          bodyMedium: TextStyle(color: darkTextMuted, fontSize: 14),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBg,
        elevation: 0,
        titleTextStyle: TextStyle(color: darkText, fontWeight: FontWeight.w900, fontSize: 20, letterSpacing: -1),
      ),
      cardTheme: CardThemeData(
        color: darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: darkBorder)),
      ),
    );
  }

  static ThemeData get theme => darkTheme; // Defaulting to Dark for that 'Premium' feel
}


// Build verification patch on 11/24/2025, 12:57:00 PM
