package com.example.greenlegacy.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.R
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.GreenLight
import com.example.greenlegacy.theme.GreenDark
import com.example.greenlegacy.theme.GlassBorderWhite
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import kotlinx.coroutines.delay
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.animation.Crossfade
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Eco

data class WelcomeSlide(
    val imageRes: Int,
    val title: String,
    val description: String
)

@Composable
fun WelcomeScreen(
    onContinueWithEmail: () -> Unit,
    onContinueAsGuest: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    
    val slides = remember {
        listOf(
            WelcomeSlide(
                R.drawable.illustration_welcome,
                "Green Legacy",
                "Transform your special moments into lasting environmental impact. Track growth, get coordinates, and earn carbon offsets."
            ),
            WelcomeSlide(
                R.drawable.illustration_plant,
                "Plant & Dedicate",
                "Sponsor and plant trees for birthdays, anniversaries, or in memory of loved ones. Leave a living footprint on campuses."
            ),
            WelcomeSlide(
                R.drawable.illustration_track,
                "Track & Offset",
                "View live satellite coordinates, monitor growth logs, and calculate real carbon offset metrics for your forest."
            )
        )
    }

    val pagerState = rememberPagerState(pageCount = { slides.size })

    // Auto-scroll loop: checks if not being dragged to keep transitions perfectly smooth
    LaunchedEffect(Unit) {
        while (true) {
            delay(3500)
            if (!pagerState.isScrollInProgress) {
                val nextPage = (pagerState.currentPage + 1) % slides.size
                pagerState.animateScrollToPage(nextPage)
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .safeDrawingPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(vertical = 20.dp), // No horizontal padding on parent Column
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // Carousel Section (Spans full edge-to-edge screen width!)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f) // Let it fill all remaining vertical space dynamically
                ) { page ->
                    val slide = slides[page]
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp) // Pad slide elements so text stays safe from edges
                    ) {
                        // Top Illustration with light green circle background highlight
                        Box(
                            modifier = Modifier.size(260.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(200.dp)
                                    .clip(CircleShape)
                                    .background(GreenPrimary.copy(alpha = 0.15f))
                            )
                            Image(
                                painter = painterResource(id = slide.imageRes),
                                contentDescription = slide.title,
                                modifier = Modifier.size(240.dp),
                                contentScale = ContentScale.Fit
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = slide.title,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = GreenDark,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = slide.description,
                            fontSize = 13.sp,
                            color = Color.Black.copy(alpha = 0.5f),
                            textAlign = TextAlign.Center,
                            lineHeight = 18.sp,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Pager dots indicator
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    repeat(slides.size) { index ->
                        val isSelected = pagerState.currentPage == index
                        val color = if (isSelected) GreenLight else GlassBorderWhite
                        val width = if (isSelected) 36.dp else 12.dp
                        Box(
                            modifier = Modifier
                                .width(width)
                                .height(5.dp)
                                .clip(RoundedCornerShape(2.5.dp))
                                .background(color)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Beautiful rotating environmental quote banner
            val welcomeQuotes = remember {
                listOf(
                    "\"The best time to plant a tree was 20 years ago. The second best time is now.\" — Chinese Proverb",
                    "\"Someone is sitting in the shade today because someone planted a tree a long time ago.\" — Warren Buffett",
                    "\"To plant a garden is to believe in tomorrow.\" — Audrey Hepburn",
                    "\"He that plants trees loves others besides himself.\" — Thomas Fuller"
                )
            }
            var quoteIndex by remember { mutableStateOf(0) }
            LaunchedEffect(Unit) {
                while (true) {
                    delay(6000)
                    quoteIndex = (quoteIndex + 1) % welcomeQuotes.size
                }
            }

            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .border(1.dp, Color(0xFFDCFCE7), RoundedCornerShape(12.dp))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Eco,
                        contentDescription = null,
                        tint = Color(0xFF16A34A),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Crossfade(targetState = welcomeQuotes[quoteIndex], label = "WelcomeQuoteFade") { quote ->
                        Text(
                            text = quote,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            fontStyle = FontStyle.Italic,
                            color = Color(0xFF047857),
                            lineHeight = 15.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Buttons Section (Padded to keep screen alignment clean)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                WelcomeSocialButton(
                    text = "Continue with Google",
                    iconRes = R.drawable.ic_google,
                    containerColor = Color.White,
                    textColor = Color(0xFF1E293B),
                    onClick = { com.example.greenlegacy.data.SupabaseService.launchGoogleSignIn(context) }
                )

                WelcomeSocialButton(
                    text = "Continue with Apple",
                    iconRes = R.drawable.ic_apple,
                    containerColor = GreenPrimary,
                    textColor = Color(0xFF0F1210),
                    onClick = onContinueWithEmail,
                    iconTint = Color(0xFF0F1210)
                )

                WelcomeSocialButton(
                    text = "Continue with Email ID",
                    iconRes = R.drawable.ic_mail,
                    containerColor = Color.White,
                    textColor = Color(0xFF1E293B),
                    onClick = onContinueWithEmail,
                    iconTint = Color(0xFF1E293B)
                )

                WelcomeSocialButton(
                    text = "Continue As Guest",
                    iconRes = R.drawable.ic_guest,
                    containerColor = Color(0xFFF0FDF4),
                    textColor = Color(0xFF0F1210),
                    onClick = onContinueAsGuest,
                    iconTint = Color(0xFF0F1210)
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Clickable bottom login link
                val loginText = buildAnnotatedString {
                    append("Already have an account? ")
                    withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = GreenPrimary)) {
                        append("Log in")
                    }
                }
                
                Text(
                    text = loginText,
                    fontSize = 14.sp,
                    color = Color.Black.copy(alpha = 0.5f),
                    modifier = Modifier.clickable { onContinueWithEmail() }
                )
            }
        }
    }
}

@Composable
fun WelcomeSocialButton(
    text: String,
    iconRes: Int,
    containerColor: Color,
    textColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    iconTint: Color? = null
) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = containerColor),
        shape = RoundedCornerShape(24.dp),
        border = if (containerColor == Color.White) BorderStroke(1.dp, GlassBorderWhite) else null,
        modifier = modifier
            .fillMaxWidth(0.9f)
            .height(50.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                tint = iconTint ?: Color.Unspecified,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = text,
                color = textColor,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
