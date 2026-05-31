package com.example.greenlegacy.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import com.example.greenlegacy.data.SupabaseService
import com.example.greenlegacy.theme.*
import com.example.greenlegacy.ui.components.GlassButton
import com.example.greenlegacy.ui.components.GlassCard
import kotlinx.coroutines.launch
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardCapitalization

data class OccasionItem(
    val title: String,
    val tagline: String,
    val icon: ImageVector,
    val accentColor: Color
)

data class StatItem(
    val value: String,
    val label: String,
    val icon: ImageVector,
    val tint: Color
)

data class TestimonialItem(
    val name: String,
    val role: String,
    val text: String,
    val rating: Int
)

@Composable
fun HomeScreen(
    onPlantTreeClick: () -> Unit,
    onProfileClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    var showVideoDialog by remember { mutableStateOf(false) }

    // Dynamic testimonials from shared Supabase database
    var testimonialsList by remember { mutableStateOf<List<TestimonialItem>>(emptyList()) }
    var isLoadingTestimonials by remember { mutableStateOf(true) }
    var showShareStoryDialog by remember { mutableStateOf(false) }
    var testimonialRefreshKey by remember { mutableStateOf(0) }

    val scope = rememberCoroutineScope()

    LaunchedEffect(testimonialRefreshKey) {
        val result = SupabaseService.fetchTestimonials()
        result.onSuccess { list ->
            testimonialsList = list.map {
                TestimonialItem(name = it.name, role = it.role, text = it.text, rating = it.rating)
            }
        }.onFailure {
            // Fallback to built-in testimonials if fetch fails
            testimonialsList = listOf(
                TestimonialItem(
                    name = "Priya Sharma",
                    role = "Individual Donor",
                    text = "I planted 10 trees for my parents\u2019 anniversary. The GPS certificate and growth updates made it the most meaningful gift I\u2019ve ever given.",
                    rating = 5
                ),
                TestimonialItem(
                    name = "Rajesh Kumar",
                    role = "CSR Head, TechCorp India",
                    text = "Green Legacy made our CSR initiative seamless. 500 trees planted, full documentation for compliance, and our employees loved the events.",
                    rating = 5
                )
            )
        }
        isLoadingTestimonials = false
    }

    // Share Your Story Dialog
    if (showShareStoryDialog) {
        ShareYourStoryDialog(
            onDismiss = { showShareStoryDialog = false },
            onSubmit = { name, role, text ->
                scope.launch {
                    isLoadingTestimonials = true
                    showShareStoryDialog = false
                    SupabaseService.submitTestimonial(name = name, role = role, text = text)
                    // Increment key to trigger LaunchedEffect re-run
                    testimonialRefreshKey++
                }
            }
        )
    }

    // Video modal dialog
    if (showVideoDialog) {
        androidx.compose.ui.window.Dialog(onDismissRequest = { showVideoDialog = false }) {
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                cornerRadius = 24.dp
            ) {
                Box(modifier = Modifier.fillMaxWidth()) {
                    IconButton(
                        onClick = { showVideoDialog = false },
                        modifier = Modifier.align(Alignment.TopEnd)
                    ) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                    }
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 24.dp, bottom = 12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .background(GreenPrimary.copy(alpha = 0.15f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = null,
                                tint = GreenDark,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Green Legacy Story",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Video coming soon!",
                            fontSize = 14.sp,
                            color = Color.Black.copy(alpha = 0.6f),
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Profile Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Circular avatar — tapping opens Profile, shows photo if saved
                val context = LocalContext.current
                val photoUriStr = SupabaseService.photoUriString
                val photoBitmap = remember(photoUriStr) {
                    photoUriStr?.let { uriStr ->
                        try {
                            val uri = Uri.parse(uriStr)
                            context.contentResolver.openInputStream(uri)?.use {
                                BitmapFactory.decodeStream(it)
                            }
                        } catch (e: Exception) { null }
                    }
                }
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(GreenPrimary.copy(alpha = 0.15f))
                        .border(1.5.dp, GreenPrimary, CircleShape)
                        .clickable { onProfileClick() },
                    contentAlignment = Alignment.Center
                ) {
                    if (photoBitmap != null) {
                        Image(
                            bitmap = photoBitmap.asImageBitmap(),
                            contentDescription = "Profile Photo",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Open Profile",
                            tint = GreenDark,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = SupabaseService.userName ?: "William Current",
                        fontSize = 12.sp,
                        color = Color.Black.copy(alpha = 0.6f),
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "Welcome Back 👋",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }

            // Notification Bell with Red Dot badge
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(1.dp, GlassBorderWhite, CircleShape)
                    .clickable { /* Notifications click */ },
                contentAlignment = Alignment.Center
            ) {
                Box(modifier = Modifier.size(22.dp)) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notifications",
                        tint = Color.Black,
                        modifier = Modifier.align(Alignment.Center).size(18.dp)
                    )
                    // Red Notification Badge Dot
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFEF4444))
                            .align(Alignment.TopEnd)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Pulsing State Chip / Badge
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .background(Color(0xFFF0FDF4), RoundedCornerShape(20.dp))
                .border(1.dp, Color(0xFF16A34A).copy(alpha = 0.2f), RoundedCornerShape(20.dp))
                .padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            val infiniteTransition = rememberInfiniteTransition(label = "PulseDot")
            val alpha by infiniteTransition.animateFloat(
                initialValue = 0.4f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(1000, easing = LinearEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "alpha"
            )
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .graphicsLayer { this.alpha = alpha }
                    .background(Color(0xFF84CC16), CircleShape)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Now planting across 18 states in India",
                fontSize = 12.sp,
                color = Color.Black.copy(alpha = 0.7f),
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Hero Title
        Text(
            text = buildAnnotatedString {
                append("Plant a Tree, \n")
                withStyle(SpanStyle(color = Color(0xFF16A34A), fontWeight = FontWeight.Bold)) {
                    append("Create a Legacy")
                }
            },
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            textAlign = TextAlign.Center,
            lineHeight = 40.sp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Hero Subtitle
        Text(
            text = "Transform special moments into lasting environmental impact. Every tree tells a story, every forest builds a future.",
            fontSize = 14.sp,
            color = Color.Black.copy(alpha = 0.6f),
            lineHeight = 20.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        // CTA Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            GlassButton(
                text = "Start Planting",
                onClick = onPlantTreeClick,
                accentMode = true,
                modifier = Modifier.weight(1.5f)
            )

            OutlinedButton(
                onClick = { showVideoDialog = true },
                shape = RoundedCornerShape(30.dp),
                border = BorderStroke(1.dp, GlassBorderWhite),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color.Black,
                    containerColor = Color.White
                ),
                modifier = Modifier
                    .weight(1.5f)
                    .height(48.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        tint = Color.Black,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Watch Our Story",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Philosophy Quote Card
        QuoteCard(
            quote = "The best time to plant a tree was 20 years ago. The second best time is now.",
            author = "Chinese Proverb"
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Stats Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            StatCard(
                value = "5,847+",
                label = "Trees Planted",
                icon = Icons.Default.Eco,
                tint = Color(0xFF16A34A),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                value = "42",
                label = "Partner Colleges",
                icon = Icons.Default.School,
                tint = Color(0xFF2563EB),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                value = "328 T",
                label = "CO2 Offset",
                icon = Icons.Default.Public,
                tint = Color(0xFF0891B2),
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(36.dp))

        // How It Works Section Header
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "SIMPLE PROCESS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF16A34A),
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Your Tree Journey in 3 Simple Steps",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "From your intention to a thriving tree - we make the entire process seamless and transparent.",
                fontSize = 13.sp,
                color = Color.Black.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // How It Works Steps
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            HowItWorksStepCard(
                stepNumber = 1,
                icon = Icons.Default.CalendarToday,
                title = "Choose & Personalize",
                description = "Select your occasion - birthdays, memorials, corporate events. Add a personal dedication message.",
                bullets = listOf(
                    "Pick the perfect occasion",
                    "Add a heartfelt message",
                    "Choose your tree species"
                )
            )

            HowItWorksStepCard(
                stepNumber = 2,
                icon = Icons.Default.Spa,
                title = "We Plant & Care",
                description = "Tree planted at partner agriculture colleges. Students gain real-world experience. Local NGOs ensure long-term care.",
                bullets = listOf(
                    "Planted by trained students",
                    "Nurtured by local NGOs",
                    "Monitored for 3 years"
                )
            )

            HowItWorksStepCard(
                stepNumber = 3,
                icon = Icons.Default.LocationOn,
                title = "Track Your Impact",
                description = "GPS-tagged digital certificate. Scan QR to see your tree's exact location. Watch your legacy grow.",
                bullets = listOf(
                    "GPS-tagged certificate",
                    "QR code for tracking",
                    "Real-time growth updates"
                )
            )
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Transparency Section Header
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "TRANSPARENCY",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF16A34A),
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Real Trees, Real Impact, Real Transparency",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Every tree planted is geotagged, monitored, and audited dynamically. Watch your impact grow with verified data.",
                fontSize = 13.sp,
                color = Color.Black.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Transparency Grid (4 stats)
        val transparencyStats = listOf(
            StatItem("5,847+", "Trees Planted", Icons.Default.Eco, Color(0xFF16A34A)),
            StatItem("328 T", "CO2 Offset", Icons.Default.Air, Color(0xFF0284C7)),
            StatItem("24M L", "Water Conserved", Icons.Default.Opacity, Color(0xFF6366F1)),
            StatItem("876 T", "Oxygen Produced", Icons.Default.WbSunny, Color(0xFFF59E0B))
        )

        for (i in transparencyStats.indices step 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val stat1 = transparencyStats[i]
                val stat2 = transparencyStats[i + 1]

                StatCard(
                    value = stat1.value,
                    label = stat1.label,
                    icon = stat1.icon,
                    tint = stat1.tint,
                    modifier = Modifier.weight(1f)
                )

                StatCard(
                    value = stat2.value,
                    label = stat2.label,
                    icon = stat2.icon,
                    tint = stat2.tint,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Occasions Section Header
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "OCCASIONS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF16A34A),
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Plant for Every Precious Moment",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Occasions Grid (8 Items)
        val occasions = listOf(
            OccasionItem("Birthdays", "Grow with your loved ones", Icons.Default.Cake, Color(0xFFEC4899)),
            OccasionItem("Anniversaries", "Roots as strong as your love", Icons.Default.Favorite, Color(0xFFEF4444)),
            OccasionItem("New Arrivals", "Welcome life with life", Icons.Default.ChildCare, Color(0xFF3B82F6)),
            OccasionItem("Graduations", "Plant seeds of success", Icons.Default.School, Color(0xFFF59E0B)),
            OccasionItem("Memorials", "Living tributes that endure", Icons.Default.LocalFlorist, Color(0xFF6366F1)),
            OccasionItem("Corporate CSR", "Scale your impact", Icons.Default.Business, Color(0xFF10B981)),
            OccasionItem("Weddings", "Together we grow", Icons.Default.Celebration, Color(0xFFF43F5E)),
            OccasionItem("Just Because", "Every day is Earth Day", Icons.Default.Eco, Color(0xFF22C55E))
        )

        for (i in occasions.indices step 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val item1 = occasions[i]
                val item2 = occasions[i + 1]

                OccasionCard(
                    title = item1.title,
                    tagline = item1.tagline,
                    icon = item1.icon,
                    accentColor = item1.accentColor,
                    onClick = onPlantTreeClick,
                    modifier = Modifier.weight(1f)
                )

                OccasionCard(
                    title = item2.title,
                    tagline = item2.tagline,
                    icon = item2.icon,
                    accentColor = item2.accentColor,
                    onClick = onPlantTreeClick,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Testimonials Section Header
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "TESTIMONIALS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF16A34A),
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Stories That Inspire",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Testimonials Horizontal Carousel (live from DB)
        if (isLoadingTestimonials) {
            Box(
                modifier = Modifier.fillMaxWidth().height(140.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    color = Color(0xFF16A34A),
                    modifier = Modifier.size(32.dp)
                )
            }
        } else {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                items(testimonialsList) { item ->
                    TestimonialCard(
                        name = item.name,
                        role = item.role,
                        text = item.text,
                        rating = item.rating,
                        modifier = Modifier.width(280.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Share Your Story CTA
        Button(
            onClick = { showShareStoryDialog = true },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF16A34A)
            )
        ) {
            Icon(
                imageVector = Icons.Default.Edit,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Share Your Story",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }

        Spacer(modifier = Modifier.height(36.dp))

        // ── PRICING SECTION ──────────────────────────────────────────────────

        // One-Time vs Subscription Explainer
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "PRICING",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF16A34A),
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Choose Your Impact Level",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Every plan creates real, measurable environmental impact. Start small or go big — every tree counts.",
                fontSize = 13.sp,
                color = Color.Black.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // One-Time vs Subscription Comparison Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
            elevation = CardDefaults.cardElevation(0.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(20.dp)) {
                Text(
                    text = "One-Time vs Subscription",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Spacer(modifier = Modifier.height(14.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // One-Time Column
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .background(Color.White, RoundedCornerShape(14.dp))
                            .border(1.dp, Color(0xFF16A34A).copy(alpha = 0.2f), RoundedCornerShape(14.dp))
                            .padding(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(Color(0xFF16A34A).copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.ShoppingCart, null, tint = Color(0xFF16A34A), modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("One-Time", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                        listOf("Pay once, own forever", "GPS certificate issued", "Perfect as a gift", "From ₹299").forEach { f ->
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                                Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF16A34A), modifier = Modifier.size(13.dp))
                                Spacer(Modifier.width(6.dp))
                                Text(f, fontSize = 11.sp, color = Color.Black.copy(alpha = 0.7f))
                            }
                        }
                    }

                    // Subscription Column
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .background(Color(0xFF16A34A), RoundedCornerShape(14.dp))
                            .padding(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Autorenew, null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Subscription", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Spacer(modifier = Modifier.height(8.dp))
                        listOf("Auto-plant monthly", "Bonus anniversary trees", "Tax receipts (80G)", "From ₹249/mo").forEach { f ->
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                                Icon(Icons.Default.CheckCircle, null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(13.dp))
                                Spacer(Modifier.width(6.dp))
                                Text(f, fontSize = 11.sp, color = Color.White.copy(alpha = 0.9f))
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Pricing Tab Toggle
        var selectedPricingTab by remember { mutableStateOf(0) } // 0 = one-time, 1 = subscription
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFF0FDF4), RoundedCornerShape(50.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf("One-Time", "Subscription").forEachIndexed { idx, label ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(
                            if (selectedPricingTab == idx) Color.White else Color.Transparent,
                            RoundedCornerShape(50.dp)
                        )
                        .clickable { selectedPricingTab = idx }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        fontSize = 13.sp,
                        fontWeight = if (selectedPricingTab == idx) FontWeight.Bold else FontWeight.Normal,
                        color = if (selectedPricingTab == idx) Color(0xFF16A34A) else Color.Black.copy(alpha = 0.5f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // One-Time Pricing Cards
        if (selectedPricingTab == 0) {
            data class PricePlan(val name: String, val price: String, val trees: Int, val points: Int, val desc: String, val features: List<String>, val popular: Boolean = false, val badge: String? = null)
            val oneTimePlans = listOf(
                PricePlan("Sprout", "₹299", 1, 100, "Perfect for individual impact",
                    listOf("1 Tree planted", "Digital GPS certificate", "100 Green Points", "Email updates")),
                PricePlan("Forest", "₹999", 5, 600, "Most popular for gifting",
                    listOf("5 Trees planted", "Planting video + photos", "Physical certificate", "600 Green Points", "Quarterly impact reports"),
                    popular = true, badge = "Most Popular"),
                PricePlan("Legacy", "₹4,999", 25, 3500, "For those who dream big",
                    listOf("25 Trees planted", "Site visit invitation", "Premium physical certificate", "3,500 Green Points", "Annual impact meeting"))
            )
            oneTimePlans.forEach { plan ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = if (plan.popular) Color(0xFF16A34A) else Color.White),
                    elevation = CardDefaults.cardElevation(if (plan.popular) 6.dp else 2.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth().padding(20.dp)) {
                        if (plan.badge != null) {
                            Box(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.25f), RoundedCornerShape(50.dp))
                                    .padding(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Text(plan.badge, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            Spacer(Modifier.height(10.dp))
                        }
                        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(plan.name, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color.Black)
                                Text(plan.desc, fontSize = 12.sp, color = if (plan.popular) Color.White.copy(0.8f) else Color.Black.copy(0.5f))
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(plan.price, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color.Black)
                                Text("one-time", fontSize = 11.sp, color = if (plan.popular) Color.White.copy(0.7f) else Color.Black.copy(0.4f))
                            }
                        }
                        Spacer(Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("🌳 ${plan.trees} trees", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color(0xFF16A34A))
                            Text("⭐ ${plan.points} pts", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color(0xFF16A34A))
                        }
                        Spacer(Modifier.height(14.dp))
                        plan.features.forEach { f ->
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                                Icon(Icons.Default.CheckCircle, null, tint = if (plan.popular) Color.White else Color(0xFF16A34A), modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(8.dp))
                                Text(f, fontSize = 12.sp, color = if (plan.popular) Color.White.copy(0.9f) else Color.Black.copy(0.7f))
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                        Button(
                            onClick = onPlantTreeClick,
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (plan.popular) Color.White else Color(0xFF16A34A)
                            )
                        ) {
                            Text("Plant ${plan.name}", color = if (plan.popular) Color(0xFF16A34A) else Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }
        } else {
            // Subscription Plans
            data class SubPlan(val name: String, val price: String, val treesPerYear: Int, val points: Int, val desc: String, val features: List<String>, val popular: Boolean = false, val badge: String? = null)
            val subPlans = listOf(
                SubPlan("Monthly Sapling", "₹249/mo", 12, 1200, "Plant & Chill",
                    listOf("1 tree per month (12/year)", "Monthly digital certificate", "1,200 points/year", "Cancel anytime"), badge = "Plant & Chill"),
                SubPlan("Quarterly Grove", "₹699/quarter", 16, 3000, "Forest Builder",
                    listOf("4 trees per quarter (16/year)", "Quarterly video updates", "3,000 points/year", "Personalized impact report"), badge = "Forest Builder"),
                SubPlan("Annual Forest", "₹2,499/year", 30, 8000, "Legacy Maker",
                    listOf("30 trees per year", "Site visit invitation", "8,000 points/year", "Premium certificate bundle", "Personal impact webpage"),
                    popular = true, badge = "Best Value")
            )
            subPlans.forEach { plan ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = if (plan.popular) Color(0xFF16A34A) else Color.White),
                    elevation = CardDefaults.cardElevation(if (plan.popular) 6.dp else 2.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth().padding(20.dp)) {
                        if (plan.badge != null) {
                            Box(
                                modifier = Modifier
                                    .background(if (plan.popular) Color.White.copy(0.25f) else Color(0xFF16A34A).copy(0.1f), RoundedCornerShape(50.dp))
                                    .padding(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Text(plan.badge, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color(0xFF16A34A))
                            }
                            Spacer(Modifier.height(10.dp))
                        }
                        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(plan.name, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color.Black)
                                Text(plan.desc, fontSize = 12.sp, color = if (plan.popular) Color.White.copy(0.8f) else Color.Black.copy(0.5f))
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(plan.price, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color.Black)
                            }
                        }
                        Spacer(Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("🌳 ${plan.treesPerYear}/year", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color(0xFF16A34A))
                            Text("⭐ ${plan.points} pts", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (plan.popular) Color.White else Color(0xFF16A34A))
                        }
                        Spacer(Modifier.height(14.dp))
                        plan.features.forEach { f ->
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                                Icon(Icons.Default.CheckCircle, null, tint = if (plan.popular) Color.White else Color(0xFF16A34A), modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(8.dp))
                                Text(f, fontSize = 12.sp, color = if (plan.popular) Color.White.copy(0.9f) else Color.Black.copy(0.7f))
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                        Button(
                            onClick = onPlantTreeClick,
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (plan.popular) Color.White else Color(0xFF16A34A)
                            )
                        ) {
                            Icon(Icons.Default.Autorenew, null, tint = if (plan.popular) Color(0xFF16A34A) else Color.White, modifier = Modifier.size(14.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Subscribe — ${plan.name}", color = if (plan.popular) Color(0xFF16A34A) else Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }
            // Corporate Banner
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                border = BorderStroke(1.dp, Color(0xFF16A34A).copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Business, null, tint = Color(0xFF16A34A), modifier = Modifier.size(28.dp))
                    Spacer(Modifier.height(8.dp))
                    Text("Corporate Subscription", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Custom plans for organizations — CSR reports, employee portal, dedicated account manager.",
                        fontSize = 12.sp, color = Color.Black.copy(0.6f), textAlign = TextAlign.Center
                    )
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(
                        onClick = onPlantTreeClick,
                        modifier = Modifier.fillMaxWidth().height(42.dp),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.5.dp, Color(0xFF16A34A))
                    ) {
                        Text("Contact for Custom Pricing", color = Color(0xFF16A34A), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // ── WHY CHOOSE GREEN LEGACY ──────────────────────────────────────────

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("WHY US", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A), letterSpacing = 1.5.sp)
            Spacer(modifier = Modifier.height(6.dp))
            Text("Why Choose Green Legacy?", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.Black, textAlign = TextAlign.Center)
            Spacer(modifier = Modifier.height(8.dp))
            Text("We're not just planting trees — we're building a transparent, accountable, and lasting green movement.", fontSize = 13.sp, color = Color.Black.copy(0.6f), textAlign = TextAlign.Center)
        }

        Spacer(modifier = Modifier.height(20.dp))

        data class WhyItem(val icon: ImageVector, val title: String, val desc: String, val color: Color)
        val whyItems = listOf(
            WhyItem(Icons.Default.Repeat, "Consistent Impact", "Automated monthly planting ensures continuous environmental contribution without any effort from you.", Color(0xFF16A34A)),
            WhyItem(Icons.Default.Receipt, "Tax Benefits (80G)", "Automatic tax deduction receipts emailed within 48 hours of every payment. Fully compliant.", Color(0xFF0284C7)),
            WhyItem(Icons.Default.Star, "Priority Planting", "Subscribers get priority access to premium planting locations at top agriculture colleges.", Color(0xFFF59E0B)),
            WhyItem(Icons.Default.CardGiftcard, "Bonus Trees", "Receive bonus anniversary trees on your subscription milestones. Your forest grows faster!", Color(0xFFEC4899)),
            WhyItem(Icons.Default.Groups, "Exclusive Events", "Invitations to subscriber-only planting drives and community events across India.", Color(0xFF6366F1)),
            WhyItem(Icons.Default.VerifiedUser, "Heritage Guarantee", "Every tree is GPS-tagged, monitored for 3 years, and audited annually by independent experts.", Color(0xFF10B981))
        )

        for (i in whyItems.indices step 2) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                val item1 = whyItems[i]
                val item2 = if (i + 1 < whyItems.size) whyItems[i + 1] else null
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                        Box(
                            modifier = Modifier.size(40.dp).background(item1.color.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(item1.icon, null, tint = item1.color, modifier = Modifier.size(20.dp))
                        }
                        Spacer(Modifier.height(10.dp))
                        Text(item1.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                        Spacer(Modifier.height(4.dp))
                        Text(item1.desc, fontSize = 11.sp, color = Color.Black.copy(0.6f), lineHeight = 15.sp)
                    }
                }
                if (item2 != null) {
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                            Box(
                                modifier = Modifier.size(40.dp).background(item2.color.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(item2.icon, null, tint = item2.color, modifier = Modifier.size(20.dp))
                            }
                            Spacer(Modifier.height(10.dp))
                            Text(item2.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                            Spacer(Modifier.height(4.dp))
                            Text(item2.desc, fontSize = 11.sp, color = Color.Black.copy(0.6f), lineHeight = 15.sp)
                        }
                    }
                } else {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        Spacer(modifier = Modifier.height(36.dp))

        // ── HERITAGE GUARANTEE ───────────────────────────────────────────────

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF052E16)),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(24.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Shield, null, tint = Color(0xFF4ADE80), modifier = Modifier.size(24.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Heritage Guarantee", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    "Every tree we plant comes with our 3-year Heritage Guarantee — GPS location, growth tracking, annual audit reports, and real photos & videos.",
                    fontSize = 13.sp, color = Color.White.copy(0.75f), lineHeight = 18.sp
                )
                Spacer(Modifier.height(20.dp))
                // 4 guarantee badges
                val guarantees = listOf(
                    Triple(Icons.Default.LocationOn, "GPS Tagged", "Exact coordinates"),
                    Triple(Icons.Default.Timeline, "3-Year Care", "Monitored & nurtured"),
                    Triple(Icons.Default.Assessment, "Audit Reports", "Annual verification"),
                    Triple(Icons.Default.PhotoCamera, "Real Photos", "Progress videos")
                )
                for (i in guarantees.indices step 2) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        guarantees.drop(i).take(2).forEach { (icon, title, sub) ->
                            Row(
                                modifier = Modifier.weight(1f).background(Color.White.copy(0.08f), RoundedCornerShape(12.dp)).padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(icon, null, tint = Color(0xFF4ADE80), modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text(title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    Text(sub, fontSize = 10.sp, color = Color.White.copy(0.6f))
                                }
                            }
                        }
                    }
                    if (i + 2 < guarantees.size) Spacer(Modifier.height(8.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // ── FAQ SECTION ──────────────────────────────────────────────────────

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("FAQ", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A), letterSpacing = 1.5.sp)
            Spacer(modifier = Modifier.height(6.dp))
            Text("Frequently Asked Questions", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.Black, textAlign = TextAlign.Center)
        }

        Spacer(modifier = Modifier.height(20.dp))

        var openFaqIndex by remember { mutableStateOf<Int?>(null) }
        val faqs = listOf(
            "Can I pause my subscription?" to "Yes! You can pause your subscription at any time from your account dashboard. Your trees planted so far remain yours forever, and you can resume whenever you're ready.",
            "What happens to my Green Points?" to "Green Points never expire. You can redeem them for merchandise, additional tree plantings, or donate them to community planting drives.",
            "Can I gift a subscription?" to "Absolutely! We offer gift subscriptions for all tiers. The recipient gets a beautiful digital certificate and can track their trees growing in real-time.",
            "How do I get my tax deduction receipt?" to "All donations are eligible for tax deductions under Section 80G. Receipts are automatically emailed within 48 hours of each payment.",
            "Can I visit my planted trees?" to "Yes! Forest and Legacy plan holders get site visit invitations. We organize quarterly plantation visits at partner colleges across India.",
            "Which tree species will be planted?" to "We plant native species best suited to each region — Neem, Peepal, Mango, Tamarind, and more. Our agriculture college partners guide the species selection.",
            "Is my donation tax-deductible?" to "Yes! Green Legacy is registered under Section 80G. You will receive a tax receipt for every payment automatically via email within 48 hours."
        )

        faqs.forEachIndexed { index, (question, answer) ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { openFaqIndex = if (openFaqIndex == index) null else index },
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(1.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(question, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Color.Black, modifier = Modifier.weight(1f))
                        Icon(
                            imageVector = if (openFaqIndex == index) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = null,
                            tint = Color(0xFF16A34A),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    if (openFaqIndex == index) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Divider(color = Color(0xFF16A34A).copy(alpha = 0.15f))
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(answer, fontSize = 12.sp, color = Color.Black.copy(0.65f), lineHeight = 18.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        Spacer(modifier = Modifier.height(36.dp))
    }
}


@Composable
fun QuoteCard(
    quote: String,
    author: String,
    modifier: Modifier = Modifier
) {
    GlassCard(
        modifier = modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
        elevation = 2.dp
    ) {
        Row(
            verticalAlignment = Alignment.Top,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = Icons.Default.FormatQuote,
                contentDescription = null,
                tint = Color(0xFF16A34A),
                modifier = Modifier
                    .size(36.dp)
                    .graphicsLayer { rotationZ = 180f }
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = quote,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    fontStyle = FontStyle.Italic,
                    color = Color.Black,
                    lineHeight = 22.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "— $author",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black.copy(alpha = 0.6f)
                )
            }
        }
    }
}

@Composable
fun TestimonialCard(
    name: String,
    role: String,
    text: String,
    rating: Int,
    modifier: Modifier = Modifier
) {
    GlassCard(
        modifier = modifier,
        cornerRadius = 20.dp,
        elevation = 2.dp
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(2.dp),
                modifier = Modifier.padding(bottom = 10.dp)
            ) {
                repeat(rating) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = Color(0xFFF59E0B),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            Text(
                text = "\"$text\"",
                fontSize = 13.sp,
                fontStyle = FontStyle.Italic,
                color = Color.Black.copy(alpha = 0.7f),
                lineHeight = 18.sp,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            Text(
                text = name,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Text(
                text = role,
                fontSize = 11.sp,
                color = Color.Black.copy(alpha = 0.5f)
            )
        }
    }
}

@Composable
fun StatCard(
    value: String,
    label: String,
    icon: ImageVector,
    tint: Color,
    modifier: Modifier = Modifier
) {
    GlassCard(
        modifier = modifier,
        cornerRadius = 16.dp,
        elevation = 2.dp
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(tint.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = tint,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = value,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                fontSize = 11.sp,
                color = Color.Black.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                lineHeight = 13.sp
            )
        }
    }
}

@Composable
fun HowItWorksStepCard(
    stepNumber: Int,
    icon: ImageVector,
    title: String,
    description: String,
    bullets: List<String>,
    modifier: Modifier = Modifier
) {
    GlassCard(
        modifier = modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
        elevation = 2.dp
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(Color(0xFFF0FDF4), RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFF16A34A).copy(alpha = 0.2f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = Color(0xFF16A34A),
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Step $stepNumber",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16A34A)
                    )
                    Text(
                        text = title,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = description,
                fontSize = 13.sp,
                color = Color.Black.copy(alpha = 0.7f),
                lineHeight = 18.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            bullets.forEach { bullet ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(Color(0xFF16A34A), CircleShape)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = bullet,
                        fontSize = 12.sp,
                        color = Color.Black.copy(alpha = 0.6f)
                    )
                }
            }
        }
    }
}

@Composable
fun OccasionCard(
    title: String,
    tagline: String,
    icon: ImageVector,
    accentColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    GlassCard(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable { onClick() },
        cornerRadius = 16.dp,
        elevation = 2.dp
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(accentColor.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = tagline,
                fontSize = 11.sp,
                color = Color.Black.copy(alpha = 0.6f),
                lineHeight = 14.sp
            )
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Share Your Story Dialog
// ──────────────────────────────────────────────────────────────────────────────
@Composable
fun ShareYourStoryDialog(
    onDismiss: () -> Unit,
    onSubmit: (name: String, role: String, text: String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("") }
    var text by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }

    androidx.compose.ui.window.Dialog(
        onDismissRequest = onDismiss,
        properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                // Header
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(Color(0xFF16A34A).copy(alpha = 0.12f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = null,
                            tint = Color(0xFF16A34A),
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Share Your Story",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Text(
                            text = "Inspire others with your experience",
                            fontSize = 12.sp,
                            color = Color.Black.copy(alpha = 0.5f)
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.Black.copy(alpha = 0.4f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Divider(color = Color(0xFF16A34A).copy(alpha = 0.15f))
                Spacer(modifier = Modifier.height(16.dp))

                // Fields
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Your Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF16A34A),
                        focusedLabelColor = Color(0xFF16A34A),
                        unfocusedBorderColor = GlassBorderWhite,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words)
                )
                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = role,
                    onValueChange = { role = it },
                    label = { Text("Your Role / Title") },
                    singleLine = true,
                    placeholder = { Text("e.g. CSR Manager, Tree Lover") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF16A34A),
                        focusedLabelColor = Color(0xFF16A34A),
                        unfocusedBorderColor = GlassBorderWhite,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words)
                )
                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    label = { Text("Your Story *") },
                    minLines = 3,
                    maxLines = 6,
                    placeholder = { Text("Tell us about your experience with Green Legacy...") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF16A34A),
                        focusedLabelColor = Color(0xFF16A34A),
                        unfocusedBorderColor = GlassBorderWhite,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences)
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Submit Button
                Button(
                    onClick = {
                        if (name.isNotBlank() && text.isNotBlank()) {
                            isSubmitting = true
                            onSubmit(name.trim(), role.trim(), text.trim())
                        }
                    },
                    enabled = name.isNotBlank() && text.isNotBlank() && !isSubmitting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A))
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Submit Story",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }
            }
        }
    }
}
