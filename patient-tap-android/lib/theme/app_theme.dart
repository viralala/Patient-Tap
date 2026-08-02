// The Material theme, tuned so stock widgets (dialogs, pickers, ripples,
// text selection) inherit the same dark "field equipment" palette as the
// hand-built components.

import 'package:flutter/material.dart';

import 'tokens.dart';
import 'type.dart';

ThemeData buildAppTheme() {
  const ColorScheme scheme = ColorScheme.dark(
    primary: C.accent,
    onPrimary: C.accentInk,
    secondary: C.info,
    onSecondary: C.accentInk,
    error: C.danger,
    onError: Color(0xFF2B0A07),
    surface: C.surface,
    onSurface: C.textPrimary,
    surfaceContainerHighest: C.surface2,
    outline: C.border,
  );

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: scheme,
    scaffoldBackgroundColor: C.background,
    canvasColor: C.background,
    fontFamily: F.sans,
    splashFactory: InkSparkle.splashFactory,
    highlightColor: Colors.transparent,

    textTheme: TextTheme(
      bodyLarge: T.body,
      bodyMedium: T.body,
      bodySmall: T.caption(),
      titleLarge: T.largeTitle,
      titleMedium: T.headline,
      labelLarge: T.button(),
    ),

    // Text selection / cursor pick up the accent instead of Material purple.
    textSelectionTheme: const TextSelectionThemeData(
      cursorColor: C.accent,
      selectionColor: Color(0x553EC9A7),
      selectionHandleColor: C.accent,
    ),

    dialogTheme: DialogThemeData(
      backgroundColor: C.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: R.cardR),
      titleTextStyle: T.headline,
      contentTextStyle: T.caption(),
    ),

    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
    ),

    timePickerTheme: TimePickerThemeData(
      backgroundColor: C.surface,
      dialBackgroundColor: C.surfaceAlt,
      hourMinuteColor: C.surface2,
      hourMinuteTextColor: C.textPrimary,
      dayPeriodColor: C.accentSoft,
      dayPeriodTextColor: C.accent,
      shape: RoundedRectangleBorder(borderRadius: R.cardR),
    ),

    snackBarTheme: SnackBarThemeData(
      backgroundColor: C.surface2,
      contentTextStyle: T.body,
      shape: RoundedRectangleBorder(borderRadius: R.rowR),
      behavior: SnackBarBehavior.floating,
    ),

    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: C.accent,
      linearTrackColor: C.surface2,
      circularTrackColor: Colors.transparent,
    ),

    dividerTheme: const DividerThemeData(
      color: C.border,
      thickness: 1,
      space: 1,
    ),

    // The custom Screen widget owns padding; keep the stock scrollbar hidden
    // to match the web build's `scrollbar-width: none`.
    scrollbarTheme: const ScrollbarThemeData(
      thumbVisibility: WidgetStatePropertyAll<bool>(false),
    ),
  );
}
