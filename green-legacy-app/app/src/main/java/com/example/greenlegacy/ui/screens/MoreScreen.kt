package com.example.greenlegacy.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Eco
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.ui.components.GlassCard
import com.example.greenlegacy.ui.components.GlassButton
import com.example.greenlegacy.ui.components.GlassTextField
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.TealAccent
import com.example.greenlegacy.theme.AmberAccent
import com.example.greenlegacy.theme.GlassBorderWhite
import com.example.greenlegacy.theme.GreenDark
import com.example.greenlegacy.theme.getPastelColor
import com.example.greenlegacy.data.SupabaseService

enum class MoreScreenSubTab {
    MENU,
    VOLUNTEER_DRIVES
}

@Composable
fun MoreScreen(
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    var subTab by remember { mutableStateOf(MoreScreenSubTab.MENU) }

    Crossfade(targetState = subTab, label = "MoreScreenTransition") { currentSubTab ->
        when (currentSubTab) {
            MoreScreenSubTab.MENU -> {
                MoreMenuContent(
                    onLogout = onLogout,
                    onNavigateToDrives = { subTab = MoreScreenSubTab.VOLUNTEER_DRIVES },
                    modifier = modifier
                )
            }
            MoreScreenSubTab.VOLUNTEER_DRIVES -> {
                VolunteerDrivesContent(
                    onBackClick = { subTab = MoreScreenSubTab.MENU },
                    modifier = modifier
                )
            }
        }
    }
}

@Composable
fun MoreMenuContent(
    onLogout: () -> Unit,
    onNavigateToDrives: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(scrollState)
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 16.dp, vertical = 16.dp)
        ) {
            Text(
                text = "More",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
        }
        Divider(color = GlassBorderWhite)

        Column(modifier = Modifier.padding(16.dp)) {

            // ── About Green Legacy card ───────────────────────────────────────
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF052E16)),
                elevation = CardDefaults.cardElevation(4.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(22.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .background(Color(0xFF4ADE80).copy(0.2f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Outlined.Eco, null, tint = Color(0xFF4ADE80), modifier = Modifier.size(30.dp))
                    }
                    Spacer(Modifier.height(12.dp))
                    Text("Green Legacy", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Spacer(Modifier.height(4.dp))
                    Text("Version 1.0.0", fontSize = 11.sp, color = Color.White.copy(0.5f))
                    Spacer(Modifier.height(10.dp))
                    Text(
                        "We plant trees at top agriculture colleges across India, bridging CSR donors with a transparent, GPS-verified green movement.",
                        fontSize = 12.sp,
                        color = Color.White.copy(0.75f),
                        textAlign = TextAlign.Center,
                        lineHeight = 17.sp
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Beautiful rotating environmental quote card
            val moreQuotes = remember {
                listOf(
                    "\"The best time to plant a tree was 20 years ago. The second best time is now.\" — Chinese Proverb",
                    "\"Someone is sitting in the shade today because someone planted a tree a long time ago.\" — Warren Buffett",
                    "\"To plant a garden is to believe in tomorrow.\" — Audrey Hepburn",
                    "\"He that plants trees loves others besides himself.\" — Thomas Fuller",
                    "\"Trees are poems that the earth writes upon the sky.\" — Kahlil Gibran"
                )
            }
            var quoteIndex by remember { mutableStateOf(0) }
            LaunchedEffect(Unit) {
                while (true) {
                    kotlinx.coroutines.delay(6500)
                    quoteIndex = (quoteIndex + 1) % moreQuotes.size
                }
            }

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFFDCFCE7), RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Eco,
                        contentDescription = null,
                        tint = Color(0xFF16A34A),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Crossfade(targetState = moreQuotes[quoteIndex], label = "MoreQuoteFade") { quote ->
                        Text(
                            text = quote,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                            color = Color(0xFF047857),
                            lineHeight = 15.sp
                        )
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            // ── Quick Links ───────────────────────────────────────────────────
            Text("QUICK LINKS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A), letterSpacing = 1.5.sp)
            Spacer(Modifier.height(10.dp))

            data class MenuLink(val icon: ImageVector, val title: String, val subtitle: String, val color: Color, val action: () -> Unit)
            val links = listOf(
                MenuLink(Icons.Default.People, "Volunteer Drives", "Join upcoming tree planting campaigns", Color(0xFF16A34A)) { onNavigateToDrives() },
                MenuLink(Icons.Default.Call, "Contact Us", "Get in touch with the Green Legacy team", Color(0xFF0284C7)) {
                    val intent = android.content.Intent(android.content.Intent.ACTION_DIAL, android.net.Uri.parse("tel:+919999999999"))
                    context.startActivity(intent)
                },
                MenuLink(Icons.Default.Email, "Email Support", "support@greenlegacy.in", Color(0xFF6366F1)) {
                    val intent = android.content.Intent(android.content.Intent.ACTION_SENDTO, android.net.Uri.parse("mailto:support@greenlegacy.in"))
                    context.startActivity(intent)
                },
                MenuLink(Icons.Default.Chat, "WhatsApp", "Chat with us for corporate queries", Color(0xFF16A34A)) {
                    val uri = android.net.Uri.parse("https://api.whatsapp.com/send?phone=+919999999999&text=${android.net.Uri.encode("Hi Green Legacy, I want to know more.")}")
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, uri)
                    context.startActivity(intent)
                }
            )

            links.forEach { link ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { link.action() },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier.size(40.dp).background(link.color.copy(0.1f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(link.icon, null, tint = link.color, modifier = Modifier.size(20.dp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(link.title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.Black)
                            Text(link.subtitle, fontSize = 11.sp, color = Color.Black.copy(0.5f))
                        }
                        Icon(Icons.Default.ChevronRight, null, tint = Color.Black.copy(0.3f), modifier = Modifier.size(18.dp))
                    }
                }
                Spacer(Modifier.height(8.dp))
            }

            Spacer(Modifier.height(12.dp))

            // ── Legal ─────────────────────────────────────────────────────────
            Text("LEGAL", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A), letterSpacing = 1.5.sp)
            Spacer(Modifier.height(10.dp))

            data class LegalItem(val icon: ImageVector, val title: String, val url: String)
            val legalItems = listOf(
                LegalItem(Icons.Default.Description, "Terms & Conditions", "https://greenlegacy.in/terms"),
                LegalItem(Icons.Default.PrivacyTip, "Privacy Policy", "https://greenlegacy.in/privacy"),
                LegalItem(Icons.Default.ReceiptLong, "Refund Policy", "https://greenlegacy.in/refund"),
                LegalItem(Icons.Default.Gavel, "Cookie Policy", "https://greenlegacy.in/cookies")
            )

            legalItems.forEach { item ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(item.url))
                            context.startActivity(intent)
                        },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier.size(40.dp).background(Color(0xFF6366F1).copy(0.08f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(item.icon, null, tint = Color(0xFF6366F1), modifier = Modifier.size(20.dp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Text(item.title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.Black, modifier = Modifier.weight(1f))
                        Icon(Icons.Default.OpenInNew, null, tint = Color.Black.copy(0.3f), modifier = Modifier.size(16.dp))
                    }
                }
                Spacer(Modifier.height(8.dp))
            }

            Spacer(Modifier.height(12.dp))

            // ── App info footer ───────────────────────────────────────────────
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("🌳 Green Legacy App", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Black.copy(0.7f))
                    Spacer(Modifier.height(4.dp))
                    Text("Made with ❤️ for a greener India", fontSize = 11.sp, color = Color.Black.copy(0.4f))
                    Spacer(Modifier.height(2.dp))
                    Text("© 2025 Green Legacy. All rights reserved.", fontSize = 10.sp, color = Color.Black.copy(0.3f))
                }
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}


@Composable
fun VolunteerDrivesContent(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Re-use logic from VolunteerScreen
    var drives by remember {
        mutableStateOf(
            listOf(
                VolunteerDrive("1", "GKVK Bangalore Campus Drive", "GKVK Agriculture College, Bangalore", "Sunday, June 14, 2026", "08:00 AM - 12:00 PM", 124),
                VolunteerDrive("2", "Pune Green Campus Drive", "College of Agriculture, Pune", "Saturday, June 27, 2026", "07:30 AM - 11:30 AM", 88),
                VolunteerDrive("3", "Chennai Coast Afforestation", "TNAU Research Center, Chennai", "Sunday, July 12, 2026", "09:00 AM - 01:00 PM", 42)
            )
        )
    }

    var selectedDriveIndexForRegistration by remember { mutableStateOf<Int?>(null) }
    var volunteerName by remember { mutableStateOf("") }
    var volunteerPhone by remember { mutableStateOf("") }
    var selectedSize by remember { mutableStateOf("M") }
    val sizes = listOf("S", "M", "L", "XL")
    var errorMessage by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 12.dp)
        ) {
            IconButton(onClick = onBackClick) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.Black)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Volunteer Drives",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
        }

        Text(
            text = "Join students and local NGOs in our upcoming tree planting campaigns to restore campus green cover.",
            fontSize = 13.sp,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            itemsIndexed(drives) { index, drive ->
                DriveCard(
                    drive = drive,
                    index = index,
                    onRegisterClick = {
                        if (!drive.registered) {
                            selectedDriveIndexForRegistration = index
                        }
                    }
                )
            }
        }
    }

    // Registration Form Dialog
    selectedDriveIndexForRegistration?.let { index ->
        val drive = drives[index]
        AlertDialog(
            onDismissRequest = {
                selectedDriveIndexForRegistration = null
                volunteerName = ""
                volunteerPhone = ""
                errorMessage = ""
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (volunteerName.isBlank() || volunteerPhone.isBlank()) {
                            errorMessage = "Please fill in all fields"
                        } else {
                            errorMessage = ""
                            // Update registered status and increment count
                            val updatedDrives = drives.toMutableList()
                            updatedDrives[index] = drive.copy(
                                registered = true,
                                initialVolunteers = drive.initialVolunteers + 1
                            )
                            drives = updatedDrives
                            selectedDriveIndexForRegistration = null
                            volunteerName = ""
                            volunteerPhone = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text("Confirm Registration", color = Color.White)
                }
            },
            dismissButton = {
                Button(
                    onClick = {
                        selectedDriveIndexForRegistration = null
                        volunteerName = ""
                        volunteerPhone = ""
                        errorMessage = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    modifier = Modifier.border(1.dp, GlassBorderWhite, RoundedCornerShape(20.dp))
                ) {
                    Text("Cancel", color = MaterialTheme.colorScheme.onBackground)
                }
            },
            title = {
                Text(text = "Register for ${drive.title}", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "We will provide tools, gloves, and free lunch/refreshments at the campus.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    GlassTextField(
                        value = volunteerName,
                        onValueChange = { volunteerName = it },
                        label = "Your Name",
                        leadingIcon = Icons.Default.Person,
                        modifier = Modifier.padding(bottom = 10.dp)
                    )

                    GlassTextField(
                        value = volunteerPhone,
                        onValueChange = { volunteerPhone = it },
                        label = "Mobile Number",
                        leadingIcon = Icons.Default.Info, // Placeholders
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    Text(
                        text = "Select T-Shirt Size (Free Volunteer Kit)",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)
                    ) {
                        sizes.forEach { size ->
                            val isSelected = selectedSize == size
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .border(
                                        width = 1.dp,
                                        color = if (isSelected) GreenPrimary else GlassBorderWhite,
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .clickable { selectedSize = size }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = size,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) GreenPrimary else MaterialTheme.colorScheme.onBackground
                                )
                            }
                        }
                    }

                    if (errorMessage.isNotEmpty()) {
                        Text(
                            text = errorMessage,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }
                }
            },
            shape = RoundedCornerShape(24.dp)
        )
    }
}

data class PlanterBadge(
    val title: String,
    val desc: String,
    val icon: ImageVector,
    val color: Color,
    val unlocked: Boolean
)

@Composable
fun InteractiveBadgeItem(
    badge: PlanterBadge,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var pressed by remember { mutableStateOf(false) }
    
    val scale by animateFloatAsState(
        targetValue = if (pressed) 1.15f else 1f,
        animationSpec = spring(stiffness = androidx.compose.animation.core.Spring.StiffnessMedium),
        label = "BadgeScale"
    )

    val opacity = if (badge.unlocked) 1f else 0.35f
    val borderColor = if (badge.unlocked) badge.color else GlassBorderWhite

    GlassCard(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clickable { 
                pressed = true
                onClick()
                pressed = false
            },
        cornerRadius = 16.dp,
        elevation = 2.dp
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth().graphicsLayer { alpha = opacity }
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(badge.color.copy(alpha = 0.12f))
                    .border(1.dp, borderColor, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = badge.icon,
                    contentDescription = null,
                    tint = if (badge.unlocked) badge.color else MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f),
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = badge.title,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center,
                lineHeight = 11.sp
            )
        }
    }
}
