package com.example.greenlegacy.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.GreenDark

// Design Tokens themed with Neon colors
private val CanvasDark = GreenPrimary
private val CanvasLight = GreenDark
private val TextOnDark = GreenDark
private val TextOnLight = Color.White

private val OnboardingTextStyle = TextStyle(
    fontFamily = FontFamily.SansSerif,
    fontWeight = FontWeight.Bold,
    fontSize = 34.sp,
    letterSpacing = (-1.5).sp,
    lineHeight = 44.sp
)

enum class OnboardingStep {
    STEP_ONE,
    STEP_TWO,
    STEP_THREE
}

@Composable
fun RhythmicOnboardingScreen(onOnboardingComplete: () -> Unit) {
    var currentStep by remember { mutableStateOf(OnboardingStep.STEP_ONE) }

    // Auto-advance every 2.5 seconds with smooth animation
    LaunchedEffect(currentStep) {
        kotlinx.coroutines.delay(2500)
        when (currentStep) {
            OnboardingStep.STEP_ONE -> currentStep = OnboardingStep.STEP_TWO
            OnboardingStep.STEP_TWO -> currentStep = OnboardingStep.STEP_THREE
            OnboardingStep.STEP_THREE -> onOnboardingComplete()
        }
    }


    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasDark)
            .padding(horizontal = 28.dp, vertical = 40.dp)
    ) {
        // Smooth sequential text transitions with horizontal slide and fade
        AnimatedContent(
            targetState = currentStep,
            transitionSpec = {
                if (targetState.ordinal > initialState.ordinal) {
                    (slideInHorizontally(animationSpec = tween(500)) { width -> width } + fadeIn(animationSpec = tween(500))) togetherWith
                            (slideOutHorizontally(animationSpec = tween(500)) { width -> -width } + fadeOut(animationSpec = tween(500)))
                } else {
                    (slideInHorizontally(animationSpec = tween(500)) { width -> -width } + fadeIn(animationSpec = tween(500))) togetherWith
                            (slideOutHorizontally(animationSpec = tween(500)) { width -> width } + fadeOut(animationSpec = tween(500)))
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.Center)
        ) { step ->
            when (step) {
                OnboardingStep.STEP_ONE -> {
                    Text(
                        text = "Every tree has their own unique ⚡ energy rhythm...",
                        style = OnboardingTextStyle,
                        color = TextOnDark
                    )
                }
                OnboardingStep.STEP_TWO -> {
                    Text(
                        text = "Every tree has its own growth rhythm ⚡.  And it's not random—it's predictable biology tracked by software.",
                        style = OnboardingTextStyle,
                        color = TextOnDark
                    )
                }
                OnboardingStep.STEP_THREE -> {
                    Text(
                        text = "Build a green legacy. Track your tree's growth, watch your carbon offset, and heal the planet.",
                        style = OnboardingTextStyle,
                        color = TextOnDark
                    )
                }
            }
        }

        // Action controls
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .align(Alignment.BottomCenter)
        ) {
            // Skip button on the left (only if not on the last step)
            if (currentStep != OnboardingStep.STEP_THREE) {
                Button(
                    onClick = onOnboardingComplete,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    modifier = Modifier.align(Alignment.CenterStart)
                ) {
                    Text(
                        text = "Skip",
                        color = TextOnDark.copy(alpha = 0.6f),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Main CTA Button
            Button(
                onClick = {
                    when (currentStep) {
                        OnboardingStep.STEP_ONE -> currentStep = OnboardingStep.STEP_TWO
                        OnboardingStep.STEP_TWO -> currentStep = OnboardingStep.STEP_THREE
                        OnboardingStep.STEP_THREE -> onOnboardingComplete()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = CanvasLight),
                shape = RectangleShape,
                modifier = Modifier
                    .width(140.dp)
                    .height(56.dp)
                    .align(Alignment.CenterEnd)
            ) {
                Text(
                    text = if (currentStep == OnboardingStep.STEP_THREE) "Unlock" else "Next",
                    color = TextOnLight,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = (-0.5).sp
                )
            }
        }
    }
}
