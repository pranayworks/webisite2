package com.example.greenlegacy.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = GreenPrimary,
    secondary = TealAccent,
    tertiary = AmberAccent,
    background = BgGradientEndDark,
    surface = GlassBgWhiteDark,
    onPrimary = Color(0xFF0F1210), // Dark text/icons on neon green
    onSecondary = Color(0xFF0F1210),
    onTertiary = Color.Black,
    onBackground = Color(0xFFF3F5F2), // Warm organic off-white
    onSurface = Color(0xFFE5E9E4) // Light organic slate
)

private val LightColorScheme = lightColorScheme(
    primary = GreenPrimary,
    secondary = TealAccent,
    tertiary = AmberAccent,
    background = BgGradientEndLight,
    surface = GlassBgWhite,
    onPrimary = Color(0xFF0F1210), // Dark text/icons on neon green
    onSecondary = Color(0xFF0F1210),
    onTertiary = Color.Black,
    onBackground = Color(0xFF1C221A), // Deep warm organic charcoal
    onSurface = Color(0xFF2C352A) // Dark charcoal olive
)

@Composable
fun GreenLegacyTheme(
    darkTheme: Boolean = false, // Forced to false to always render the requested light mint colors
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
