package com.example.greenlegacy.ui.components

import androidx.compose.runtime.withFrameMillis
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.dp
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.TealAccent
import kotlinx.coroutines.isActive
import kotlin.random.Random

data class LeafParticle(
    var x: Float,
    var y: Float,
    val speedX: Float,
    val speedY: Float,
    val size: Float,
    var angle: Float,
    val rotationSpeed: Float,
    val color: Color
)

/**
 * Renders a high-performance falling leaf particle system on a canvas.
 * Slow-floating, organic, and perfectly optimized.
 */
@Composable
fun FloatingLeaves(modifier: Modifier = Modifier) {
    val configuration = LocalConfiguration.current
    val screenWidthPx = with(androidx.compose.ui.platform.LocalDensity.current) { configuration.screenWidthDp.dp.toPx() }
    val screenHeightPx = with(androidx.compose.ui.platform.LocalDensity.current) { configuration.screenHeightDp.dp.toPx() }

    // State list of particles
    val particles = remember {
        mutableStateListOf<LeafParticle>().apply {
            // Spawn 15 random leaf particles
            repeat(15) {
                add(
                    createRandomParticle(
                        width = screenWidthPx,
                        height = screenHeightPx,
                        randomizeY = true
                    )
                )
            }
        }
    }

    // High performance game-loop frame ticker
    LaunchedEffect(key1 = screenWidthPx, key2 = screenHeightPx) {
        var lastTime = withFrameMillis { it }
        while (isActive) {
            withFrameMillis { time ->
                val delta = (time - lastTime) / 1000f
                lastTime = time

                // Update particles
                for (i in particles.indices) {
                    val p = particles[i]
                    p.x += p.speedX * delta * 50f
                    p.y += p.speedY * delta * 50f
                    p.angle += p.rotationSpeed * delta * 50f

                    // Reset if out of bounds
                    if (p.y > screenHeightPx + 50 || p.x > screenWidthPx + 50 || p.x < -50) {
                        particles[i] = createRandomParticle(
                            width = screenWidthPx,
                            height = screenHeightPx,
                            randomizeY = false
                        )
                    }
                }
            }
        }
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        particles.forEach { p ->
            val path = Path().apply {
                // Draw a beautiful leaf shape outline
                moveTo(0f, -p.size / 2f)
                // Left curve
                quadraticTo(-p.size * 0.4f, -p.size * 0.1f, 0f, p.size / 2f)
                // Right curve
                quadraticTo(p.size * 0.4f, -p.size * 0.1f, 0f, -p.size / 2f)
                close()
            }

            rotate(degrees = p.angle, pivot = androidx.compose.ui.geometry.Offset(p.x, p.y)) {
                // Shift draw to particle center
                drawContext.canvas.translate(p.x, p.y)
                drawPath(
                    path = path,
                    color = p.color
                )
                // Draw leaf center vein
                drawLine(
                    color = p.color.copy(alpha = p.color.alpha + 0.1f),
                    start = androidx.compose.ui.geometry.Offset(0f, -p.size / 2f),
                    end = androidx.compose.ui.geometry.Offset(0f, p.size * 0.4f),
                    strokeWidth = 2f
                )
                drawContext.canvas.translate(-p.x, -p.y)
            }
        }
    }
}

private fun createRandomParticle(width: Float, height: Float, randomizeY: Boolean): LeafParticle {
    val size = Random.nextFloat() * 15f + 15f // 15 to 30 px
    val startX = Random.nextFloat() * width
    val startY = if (randomizeY) Random.nextFloat() * height else -50f
    
    val speedX = Random.nextFloat() * 0.4f - 0.2f // drift sideways
    val speedY = Random.nextFloat() * 0.5f + 0.4f // fall speed
    
    val angle = Random.nextFloat() * 360f
    val rotationSpeed = Random.nextFloat() * 2f - 1f // slow spin
    
    val baseColor = if (Random.nextBoolean()) GreenPrimary else TealAccent
    val opacity = Random.nextFloat() * 0.15f + 0.08f // very subtle overlay
    val color = baseColor.copy(alpha = opacity)

    return LeafParticle(
        x = startX,
        y = startY,
        speedX = speedX,
        speedY = speedY,
        size = size,
        angle = angle,
        rotationSpeed = rotationSpeed,
        color = color
    )
}
