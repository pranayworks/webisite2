package com.example.greenlegacy.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.data.SupabaseService
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.GreenDark
import com.example.greenlegacy.theme.GlassBorderWhite
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun PlantTreeScreen(
    onOrderPlaced: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val scope = rememberCoroutineScope()

    // ── STATE VARIABLES ──────────────────────────────────────────────────────
    var selectedTier by remember { mutableStateOf("Sapling") }
    var selectedOccasion by remember { mutableStateOf("Birthday") }
    var isGift by remember { mutableStateOf(false) }

    // Recipient details (if Gift)
    var recipientName by remember { mutableStateOf("") }
    var recipientEmail by remember { mutableStateOf("") }
    var giftMessage by remember { mutableStateOf("") }

    // Checkout UI States
    var selectedPaymentMethod by remember { mutableStateOf("UPI") }
    var isPaying by remember { mutableStateOf(false) }
    var paymentStatusText by remember { mutableStateOf("") }
    var showSuccessDialog by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    // Calculated fields
    val packagePrice = when (selectedTier) {
        "Seedling" -> 299
        "Sapling" -> 599
        else -> 1999
    }
    val gstAmount = (packagePrice * 0.05).toInt()
    val totalAmount = packagePrice + gstAmount
    val selectedSpecies = when (selectedTier) {
        "Seedling" -> "Tulsi (Ocimum tenuiflorum)"
        "Sapling" -> "Neem (Azadirachta indica)"
        else -> "Sandalwood (Santalum album)"
    }

    val occasions = listOf("Birthday", "Anniversary", "Graduation", "Memorial", "Corporate CSR")

    // Inspiring tree quotes
    val quotes = listOf(
        "\"The best time to plant a tree was 20 years ago. The second best time is now.\" - Chinese Proverb",
        "\"He who plants a tree plants a hope.\" - Lucy Larcom",
        "\"To plant a garden is to believe in tomorrow.\" - Audrey Hepburn",
        "\"A nation that destroys its soils destroys itself. Forests are the lungs of our land.\" - Franklin D. Roosevelt"
    )
    val randomQuote = remember { quotes.random() }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC)) // Ultra-light grey-blue background for contrast
            .verticalScroll(scrollState)
            .padding(bottom = 32.dp)
    ) {
        // ── 1. HERO HEADER ───────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFF064E3B), Color(0xFF022C22)) // Forest Green Gradient
                    )
                )
                .padding(horizontal = 20.dp, vertical = 32.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Sponsor a Tree Legacy",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Join our mission to plant native species on verified campuses.",
                    fontSize = 13.sp,
                    color = Color.White.copy(0.7f)
                )
                Spacer(Modifier.height(16.dp))

                // Beautiful motivational quote card inside header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White.copy(0.08f), RoundedCornerShape(12.dp))
                        .border(1.dp, Color.White.copy(0.15f), RoundedCornerShape(12.dp))
                        .padding(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🌱", fontSize = 20.sp)
                        Spacer(Modifier.width(10.dp))
                        Text(
                            text = randomQuote,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White.copy(0.9f),
                            lineHeight = 16.sp,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        Column(modifier = Modifier.padding(16.dp)) {
            // ── 2. STEP 1: CHOOSE PACKAGE ─────────────────────────────────────
            SectionHeader(stepNum = "1", title = "Select Sponsorship Package")
            Spacer(Modifier.height(10.dp))

            // Seedling Card (₹299)
            PackageCard(
                name = "Seedling",
                price = "₹299",
                species = "Tulsi (Ocimum tenuiflorum)",
                co2Offset = "Offsets ~50kg CO₂ / year",
                badge = null,
                selected = selectedTier == "Seedling",
                onClick = { selectedTier = "Seedling" }
            )
            Spacer(Modifier.height(10.dp))

            // Sapling Card (₹599) - BEST VALUE
            PackageCard(
                name = "Sapling",
                price = "₹599",
                species = "Neem (Azadirachta indica)",
                co2Offset = "Offsets ~120kg CO₂ / year",
                badge = "BEST VALUE",
                selected = selectedTier == "Sapling",
                onClick = { selectedTier = "Sapling" }
            )
            Spacer(Modifier.height(10.dp))

            // Legacy Card (₹1,999) - PREMIUM
            PackageCard(
                name = "Legacy",
                price = "₹1,999",
                species = "Sandalwood (Santalum album)",
                co2Offset = "Offsets ~500kg CO₂ / year",
                badge = "CSR FAVORITE",
                selected = selectedTier == "Legacy",
                onClick = { selectedTier = "Legacy" }
            )

            Spacer(Modifier.height(24.dp))

            // ── 3. STEP 2: OCCASION & DEDICATION ──────────────────────────────
            SectionHeader(stepNum = "2", title = "Occasion & Dedication")
            Spacer(Modifier.height(10.dp))

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Occasion selection header
                    Text(
                        text = "Select Occasion",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Spacer(Modifier.height(10.dp))

                    // Occasion row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        occasions.take(3).forEach { occasion ->
                            OccasionChip(
                                title = occasion,
                                isSelected = selectedOccasion == occasion,
                                onClick = { selectedOccasion = occasion },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        occasions.drop(3).forEach { occasion ->
                            OccasionChip(
                                title = occasion,
                                isSelected = selectedOccasion == occasion,
                                onClick = { selectedOccasion = occasion },
                                modifier = Modifier.weight(1f)
                            )
                        }
                        // Spacer to fill the third column in the second row
                        Spacer(Modifier.weight(1f))
                    }

                    Spacer(Modifier.height(20.dp))
                    Divider(color = Color(0xFFF1F5F9))
                    Spacer(Modifier.height(16.dp))

                    // "Is this a gift?" selection switch card
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF0FDF4), RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFFDCFCE7), RoundedCornerShape(12.dp))
                            .clickable { isGift = !isGift }
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CardGiftcard,
                            contentDescription = null,
                            tint = Color(0xFF16A34A),
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Is this a gift for someone?",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF065F46)
                            )
                            Text(
                                text = "We will send an eco-certificate in their honor",
                                fontSize = 11.sp,
                                color = Color(0xFF047857)
                            )
                        }
                        Switch(
                            checked = isGift,
                            onCheckedChange = { isGift = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Color(0xFF16A34A)
                            )
                        )
                    }

                    // Conditional details expansion with animation
                    AnimatedVisibility(visible = isGift) {
                        Column(modifier = Modifier.padding(top = 16.dp)) {
                            Text(
                                text = "Recipient Information",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black,
                                modifier = Modifier.padding(bottom = 10.dp)
                            )

                            OutlinedTextField(
                                value = recipientName,
                                onValueChange = { recipientName = it },
                                label = { Text("Recipient Name *") },
                                leadingIcon = { Icon(Icons.Default.Person, null, tint = Color(0xFF16A34A)) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = inputColors()
                            )
                            Spacer(Modifier.height(10.dp))

                            OutlinedTextField(
                                value = recipientEmail,
                                onValueChange = { recipientEmail = it },
                                label = { Text("Recipient Email *") },
                                leadingIcon = { Icon(Icons.Default.Email, null, tint = Color(0xFF16A34A)) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = inputColors()
                            )
                            Spacer(Modifier.height(10.dp))

                            OutlinedTextField(
                                value = giftMessage,
                                onValueChange = { giftMessage = it },
                                label = { Text("Gift Message (Optional)") },
                                placeholder = { Text("Write a warm environment message...") },
                                minLines = 2,
                                maxLines = 4,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = inputColors()
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // ── 4. STEP 3: PAYMENT SUMMARY & TRUST ────────────────────────────
            SectionHeader(stepNum = "3", title = "Order Summary & Payment")
            Spacer(Modifier.height(10.dp))

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Cost breakdown
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("$selectedTier Sponsorship Fee", fontSize = 14.sp, color = Color.Gray)
                        Text("₹$packagePrice.00", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.Black)
                    }
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Planting Operations (5% GST)", fontSize = 14.sp, color = Color.Gray)
                        Text("₹$gstAmount.00", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.Black)
                    }
                    Spacer(Modifier.height(10.dp))
                    Divider(color = Color(0xFFF1F5F9))
                    Spacer(Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Total Amount", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                        Text("₹$totalAmount.00", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF16A34A))
                    }

                    Spacer(Modifier.height(20.dp))
                    Divider(color = Color(0xFFF1F5F9))
                    Spacer(Modifier.height(16.dp))

                    // Payment Method selector (UPI / CARD tabs)
                    Text(
                        text = "Choose Payment Option",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Spacer(Modifier.height(10.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp))
                            .padding(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selectedPaymentMethod == "UPI") Color.White else Color.Transparent)
                                .border(
                                    1.dp,
                                    if (selectedPaymentMethod == "UPI") Color(0xFF16A34A).copy(0.15f) else Color.Transparent,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { selectedPaymentMethod = "UPI" }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("UPI (GPay / PhonePe)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (selectedPaymentMethod == "UPI") Color(0xFF16A34A) else Color.Gray)
                        }
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selectedPaymentMethod == "CARD") Color.White else Color.Transparent)
                                .border(
                                    1.dp,
                                    if (selectedPaymentMethod == "CARD") Color(0xFF16A34A).copy(0.15f) else Color.Transparent,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { selectedPaymentMethod = "CARD" }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Credit / Debit Card", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (selectedPaymentMethod == "CARD") Color(0xFF16A34A) else Color.Gray)
                        }
                    }

                    Spacer(Modifier.height(20.dp))

                    // Trust/Security indications
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        TrustBadge(icon = Icons.Default.Lock, text = "SSL Secured")
                        TrustBadge(icon = Icons.Default.Eco, text = "Native Plant")
                        TrustBadge(icon = Icons.Default.CheckCircle, text = "Geo-Tagged")
                    }

                    if (errorMessage.isNotEmpty()) {
                        Spacer(Modifier.height(10.dp))
                        Text(errorMessage, fontSize = 12.sp, color = Color(0xFFDC2626), textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                    }

                    Spacer(Modifier.height(16.dp))

                    // Checkout Button
                    Button(
                        onClick = {
                            if (isGift && (recipientName.isBlank() || recipientEmail.isBlank())) {
                                errorMessage = "Please enter recipient details"
                            } else {
                                errorMessage = ""
                                isPaying = true
                                scope.launch {
                                    paymentStatusText = "Connecting secure payment gateway..."
                                    delay(1500)
                                    paymentStatusText = "Processing request mandate..."
                                    delay(1200)
                                    paymentStatusText = "Verifying environmental ledger..."
                                    delay(1000)

                                    // Trigger backend database record
                                    val dbRecipient = if (isGift) recipientName else (SupabaseService.userName ?: "Myself")
                                    val mockCoords = "${(10..22).random()}.${(1000..9999).random()}° N, ${(72..85).random()}.${(1000..9999).random()}° E"
                                    
                                    val result = SupabaseService.plantNewTree(
                                        recipient = dbRecipient,
                                        occasion = selectedOccasion,
                                        campus = "GKVK Campus", // Defaulted internally as campus selection is removed
                                        species = selectedSpecies,
                                        coordinates = mockCoords,
                                        planName = selectedTier,
                                        amountPaid = totalAmount.toDouble(),
                                        isGift = isGift,
                                        recipientEmail = recipientEmail,
                                        giftMessage = giftMessage
                                    )
                                    
                                    isPaying = false
                                    result.fold(
                                        onSuccess = {
                                            showSuccessDialog = true
                                            scope.launch {
                                                delay(2500)
                                                if (showSuccessDialog) {
                                                    showSuccessDialog = false
                                                    onOrderPlaced()
                                                    recipientName = ""
                                                    recipientEmail = ""
                                                    giftMessage = ""
                                                }
                                            }
                                        },
                                        onFailure = { error ->
                                            errorMessage = error.message ?: "Transaction failed. Please try again."
                                        }
                                    )
                                }
                            }
                        },
                        enabled = !isPaying,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A))
                    ) {
                        Icon(Icons.Default.Security, null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = if (isPaying) "Authorizing..." else "Secure Payment  |  ₹$totalAmount",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }
            }
        }
    }

    // ── Payment Processing Dialog ─────────────────────────────────────────────
    if (isPaying) {
        AlertDialog(
            onDismissRequest = {},
            confirmButton = {},
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    CircularProgressIndicator(color = Color(0xFF16A34A), modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                    Spacer(Modifier.width(12.dp))
                    Text("Processing Order", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            },
            text = {
                Text(paymentStatusText, fontSize = 13.sp, color = Color.Gray, modifier = Modifier.padding(vertical = 8.dp))
            },
            shape = RoundedCornerShape(20.dp)
        )
    }

    // ── Success Dialog ────────────────────────────────────────────────────────
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { 
                showSuccessDialog = false
                onOrderPlaced()
                recipientName = ""
                recipientEmail = ""
                giftMessage = ""
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSuccessDialog = false
                        onOrderPlaced()
                        recipientName = ""
                        recipientEmail = ""
                        giftMessage = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("View My Legacy", color = Color.White)
                }
            },
            title = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Color(0xFF16A34A),
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("Tree Sourced Successfully!", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, textAlign = TextAlign.Center)
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Thank you! A native tree ($selectedSpecies) has been sponsored for $selectedOccasion.",
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 18.sp
                    )
                    if (isGift) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = "We will email a customized eco-certificate directly to $recipientEmail shortly.",
                            fontSize = 12.sp,
                            color = Color.Gray,
                            textAlign = TextAlign.Center,
                            lineHeight = 16.sp
                        )
                    }
                }
            },
            shape = RoundedCornerShape(24.dp)
        )
    }
}

// ── HELPER SUB-COMPOSABLES ───────────────────────────────────────────────────

@Composable
private fun SectionHeader(stepNum: String, title: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(Color(0xFF16A34A), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(stepNum, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
        Spacer(Modifier.width(8.dp))
        Text(title, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = Color.Black)
    }
}

@Composable
private fun PackageCard(
    name: String,
    price: String,
    species: String,
    co2Offset: String,
    badge: String?,
    selected: Boolean,
    onClick: () -> Unit
) {
    val borderColor = if (selected) Color(0xFF16A34A) else Color(0xFFE2E8F0)
    val borderWidth = if (selected) 2.dp else 1.dp
    val bgColor = if (selected) Color(0xFFF0FDF4) else Color.White

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        modifier = Modifier
            .fillMaxWidth()
            .border(borderWidth, borderColor, RoundedCornerShape(16.dp))
            .clickable { onClick() }
    ) {
        Box(modifier = Modifier.padding(16.dp)) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                            if (badge != null) {
                                Spacer(Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFF16A34A).copy(0.12f), RoundedCornerShape(50.dp))
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(badge, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A))
                                }
                            }
                        }
                        Spacer(Modifier.height(2.dp))
                        Text(species, fontSize = 12.sp, color = Color.Gray)
                    }
                    Text(price, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = if (selected) Color(0xFF16A34A) else Color.Black)
                }
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Eco, null, tint = Color(0xFF16A34A), modifier = Modifier.size(13.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(co2Offset, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF16A34A))
                }
            }
        }
    }
}

@Composable
private fun OccasionChip(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val bgColor = if (isSelected) Color(0xFF16A34A) else Color(0xFFF8FAFC)
    val contentColor = if (isSelected) Color.White else Color.Black.copy(0.7f)
    val borderCol = if (isSelected) Color.Transparent else Color(0xFFE2E8F0)

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(bgColor)
            .border(1.dp, borderCol, RoundedCornerShape(10.dp))
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = contentColor,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun TrustBadge(icon: ImageVector, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Color(0xFF16A34A), modifier = Modifier.size(12.dp))
        Spacer(Modifier.width(4.dp))
        Text(text, fontSize = 11.sp, color = Color.Gray, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun inputColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Color(0xFF16A34A),
    focusedLabelColor = Color(0xFF16A34A),
    unfocusedBorderColor = Color(0xFFD1D5DB),
    focusedContainerColor = Color.White,
    unfocusedContainerColor = Color.White
)
