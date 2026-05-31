package com.example.greenlegacy.theme

import androidx.compose.ui.graphics.Color

val GreenPrimary = Color(0xFFC5F22C) // Neon Lime Green Accent
val GreenDark = Color(0xFF0F1210) // Deep Charcoal / Black
val GreenLight = Color(0xFFD9FF66) // Vibrant Neon Lime
val TealAccent = Color(0xFFD2E3FC) // Pastel Blue
val AmberAccent = Color(0xFFFEE8D6) // Pastel Peach

// Pastel colors for multicolor cards
val PastelColors = listOf(
    Color(0xFFD5F26D), // Pastel Lime-Green
    Color(0xFFD2E3FC), // Pastel Lavender-Blue
    Color(0xFFFEE8D6), // Pastel Peach
    Color(0xFFE3D6FE), // Pastel Purple
    Color(0xFFD1F5EA), // Pastel Mint
    Color(0xFFFFF2D2)  // Pastel Yellow
)

fun getPastelColor(index: Int): Color = PastelColors[index % PastelColors.size]

// Backgrounds for gradients
val BgGradientStartDark = Color(0xFF101311) // Dark charcoal green-black
val BgGradientCenterDark = Color(0xFF0A0D0B) // Near pure black
val BgGradientEndDark = Color(0xFF050605) // Absolute black

val BgGradientStartLight = Color.White
val BgGradientCenterLight = Color.White
val BgGradientEndLight = Color.White

// Glassmorphism overlays
val GlassBgWhite = Color(0xFFFFFFFF) // Solid white card backgrounds from screenshot
val GlassBgWhiteDark = Color(0x24151D14) // 14% organic dark overlay
val GlassBgGreen = Color(0x22C5F22C) // 13% neon lime overlay
val GlassBorderWhite = Color(0xFFD1FAE5) // Beautiful soft emerald/mint green border instead of gray
val GlassBorderGreen = Color(0x80C5F22C) // 50% neon lime border
val GlassBorderWhiteDark = Color(0x3DFFFFFF) // 24% white border
