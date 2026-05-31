package com.example.greenlegacy.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.TealAccent
import com.example.greenlegacy.theme.GlassBorderWhite

/**
 * A beautiful, hardware-accelerated animated circular progress ring.
 * Used to display carbon offset and environmental points metrics.
 */
@Composable
fun SustainabilityRingChart(
    percentage: Float, // 0f to 1f
    valueText: String,
    labelText: String,
    modifier: Modifier = Modifier,
    colorGradient: List<Color> = listOf(GreenPrimary, TealAccent)
) {
    // Animation triggers when component is composed
    var targetValue by remember { mutableStateOf(0f) }
    
    val animatedProgress by animateFloatAsState(
        targetValue = targetValue,
        animationSpec = tween(durationMillis = 1500, easing = androidx.compose.animation.core.FastOutSlowInEasing),
        label = "RingProgress"
    )

    LaunchedEffect(key1 = percentage) {
        targetValue = percentage
    }

    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val strokeWidth = 24f
            val diameter = size.minDimension - strokeWidth
            
            // Draw background track
            drawCircle(
                color = GlassBorderWhite.copy(alpha = 0.15f),
                radius = diameter / 2f,
                style = Stroke(width = strokeWidth)
            )
            
            // Draw animated progress arc
            drawArc(
                brush = Brush.sweepGradient(colors = colorGradient),
                startAngle = -90f,
                sweepAngle = animatedProgress * 360f,
                useCenter = false,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
        }

        // Central text values
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = valueText,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = androidx.compose.material3.MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = labelText,
                fontSize = 11.sp,
                color = androidx.compose.material3.MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )
        }
    }
}

/**
 * An animated linear progress indicator with premium gradient styling.
 */
@Composable
fun SustainabilityProgressBar(
    percentage: Float, // 0f to 1f
    labelText: String,
    modifier: Modifier = Modifier
) {
    var targetValue by remember { mutableStateOf(0f) }
    val animatedProgress by animateFloatAsState(
        targetValue = targetValue,
        animationSpec = tween(durationMillis = 1200),
        label = "BarProgress"
    )

    LaunchedEffect(key1 = percentage) {
        targetValue = percentage
    }

    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = labelText,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = androidx.compose.material3.MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
            )
            Text(
                text = "${(percentage * 100).toInt()}%",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = GreenPrimary
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
        ) {
            val h = size.height
            val w = size.width
            
            // Background bar
            drawRoundRect(
                color = GlassBorderWhite.copy(alpha = 0.15f),
                size = androidx.compose.ui.geometry.Size(w, h),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(h / 2f)
            )
            
            // Progress bar
            drawRoundRect(
                brush = Brush.horizontalGradient(listOf(GreenPrimary, TealAccent)),
                size = androidx.compose.ui.geometry.Size(w * animatedProgress, h),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(h / 2f)
            )
        }
    }
}
