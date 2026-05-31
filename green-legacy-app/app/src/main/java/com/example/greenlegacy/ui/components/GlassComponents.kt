package com.example.greenlegacy.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.theme.*

/**
 * A beautiful background with slow-pulsing radial gradients of emerald, teal, and soft gold.
 * Perfect for showing through frosted glass panels.
 */
@Composable
fun GlassBackground(
    content: @Composable BoxScope.() -> Unit
) {
    val isDark = false
    val configuration = LocalConfiguration.current
    val screenHeight = configuration.screenHeightDp.dp
    val screenWidth = configuration.screenWidthDp.dp

    // Animation values for moving spots
    val infiniteTransition = rememberInfiniteTransition(label = "BgAnimation")
    
    val pulseAnim1 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(15000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "spot1"
    )

    val pulseAnim2 by infiniteTransition.animateFloat(
        initialValue = 360f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(20000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "spot2"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                if (isDark) {
                    Brush.verticalGradient(
                        colors = listOf(BgGradientStartDark, BgGradientCenterDark, BgGradientEndDark)
                    )
                } else {
                    Brush.verticalGradient(
                        colors = listOf(BgGradientStartLight, BgGradientCenterLight, BgGradientEndLight)
                    )
                }
            )
    ) {
        if (isDark) {
            // Glowing organic spots in the background
            val spot1Color = GreenDark.copy(alpha = 0.3f)
            val spot2Color = TealAccent.copy(alpha = 0.25f)
            val spot3Color = AmberAccent.copy(alpha = 0.15f)

            // Radial gradients generated dynamically
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        translationX = (Math.sin(Math.toRadians(pulseAnim1.toDouble())) * 100).toFloat()
                        translationY = (Math.cos(Math.toRadians(pulseAnim1.toDouble())) * 150).toFloat()
                    }
            ) {
                Box(
                    modifier = Modifier
                        .size(screenWidth * 1.2f)
                        .align(Alignment.TopStart)
                        .blur(100.dp)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(spot1Color, Color.Transparent),
                                radius = 600f
                            )
                        )
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        translationX = (Math.cos(Math.toRadians(pulseAnim2.toDouble())) * 120).toFloat()
                        translationY = (Math.sin(Math.toRadians(pulseAnim2.toDouble())) * 100).toFloat()
                    }
            ) {
                Box(
                    modifier = Modifier
                        .size(screenWidth * 1.1f)
                        .align(Alignment.BottomEnd)
                        .blur(90.dp)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(spot2Color, Color.Transparent),
                                radius = 500f
                            )
                        )
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        translationX = (Math.cos(Math.toRadians((pulseAnim1 + 180).toDouble())) * 80).toFloat()
                        translationY = (Math.sin(Math.toRadians((pulseAnim1 + 90).toDouble())) * 80).toFloat()
                    }
            ) {
                Box(
                    modifier = Modifier
                        .size(screenWidth * 0.7f)
                        .align(Alignment.Center)
                        .blur(80.dp)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(spot3Color, Color.Transparent),
                                radius = 400f
                            )
                        )
                )
            }

            // Falling Leaf Particles
            FloatingLeaves()
        }

        // Overlay layout content
        Box(
            modifier = Modifier.fillMaxSize(),
            content = content
        )
    }
}

/**
 * A beautiful glass card container with transparent background and glass border stroke.
 */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 24.dp,
    borderWidth: Dp = 1.dp,
    elevation: Dp = 8.dp,
    containerColor: Color? = null,
    contentColor: Color? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val isDark = isSystemInDarkTheme()
    val bgColor = containerColor ?: (if (isDark) GlassBgWhiteDark else GlassBgWhite)
    val borderColor = if (containerColor != null) Color.Transparent else (if (isDark) GlassBorderWhiteDark else GlassBorderWhite)

    Column(
        modifier = modifier
            .shadow(
                elevation = elevation,
                shape = RoundedCornerShape(cornerRadius),
                clip = false,
                ambientColor = Color.Black.copy(alpha = 0.05f),
                spotColor = Color.Black.copy(alpha = 0.1f)
            )
            .background(
                color = bgColor,
                shape = RoundedCornerShape(cornerRadius)
            )
            .border(
                width = borderWidth,
                color = borderColor,
                shape = RoundedCornerShape(cornerRadius)
            )
            .padding(20.dp)
    ) {
        if (contentColor != null) {
            CompositionLocalProvider(LocalContentColor provides contentColor) {
                Column(modifier = Modifier.fillMaxWidth(), content = content)
            }
        } else {
            Column(modifier = Modifier.fillMaxWidth(), content = content)
        }
    }
}

/**
 * Interactive glassmorphic button with click animations and premium gradients.
 */
@Composable
fun GlassButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    accentMode: Boolean = false
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    // Smooth hover/press scaling
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        animationSpec = spring(stiffness = Spring.StiffnessMedium),
        label = "buttonScale"
    )

    // Breathing glow animation
    val infiniteTransition = rememberInfiniteTransition(label = "ButtonGlow")
    val glowProgress by infiniteTransition.animateFloat(
        initialValue = 4.dp.value,
        targetValue = 12.dp.value,
        animationSpec = infiniteRepeatable(
            animation = tween(1800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glow"
    )

    val gradientColors = if (accentMode) {
        listOf(TealAccent, GreenPrimary)
    } else {
        listOf(GreenPrimary, GreenDark)
    }

    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .shadow(
                elevation = if (enabled) glowProgress.dp else 2.dp,
                shape = RoundedCornerShape(30.dp),
                ambientColor = GreenPrimary.copy(alpha = 0.25f),
                spotColor = GreenPrimary.copy(alpha = 0.45f)
            )
            .background(
                brush = Brush.horizontalGradient(colors = gradientColors),
                shape = RoundedCornerShape(30.dp)
            )
            .clip(RoundedCornerShape(30.dp))
            .clickable(
                enabled = enabled,
                onClick = onClick
            )
            .padding(vertical = 14.dp, horizontal = 28.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
    }
}

/**
 * Text field styled with a premium glass card aesthetic.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GlassTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    leadingIcon: ImageVector? = null,
    visualTransformation: androidx.compose.ui.text.input.VisualTransformation = androidx.compose.ui.text.input.VisualTransformation.None,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    singleLine: Boolean = true
) {
    val isDark = isSystemInDarkTheme()
    val bgColor = if (isDark) GlassBgWhiteDark else GlassBgWhite
    val borderColor = if (isDark) GlassBorderWhiteDark else GlassBorderWhite
    val focusedBorderColor = GreenPrimary

    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)) },
        leadingIcon = leadingIcon?.let {
            { Icon(imageVector = it, contentDescription = null, tint = GreenPrimary) }
        },
        visualTransformation = visualTransformation,
        keyboardOptions = keyboardOptions,
        singleLine = singleLine,
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
            .fillMaxWidth()
            .background(
                color = bgColor,
                shape = RoundedCornerShape(16.dp)
            ),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = focusedBorderColor,
            unfocusedBorderColor = borderColor,
            cursorColor = GreenPrimary,
            focusedLabelColor = GreenPrimary,
            unfocusedLabelColor = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
            focusedTextColor = MaterialTheme.colorScheme.onBackground,
            unfocusedTextColor = MaterialTheme.colorScheme.onBackground
        )
    )
}
