package com.example.greenlegacy.ui.screens

import android.app.Activity
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.data.SupabaseService
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.GreenDark
import com.example.greenlegacy.theme.GlassBorderWhite
import com.razorpay.Checkout
import com.razorpay.PaymentResultListener
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject

// ── Shared state so Razorpay callbacks (from Activity) can update Compose UI ──
object RazorpayPaymentState {
    var onPaymentSuccess: ((paymentId: String, orderId: String, signature: String) -> Unit)? = null
    var onPaymentError: ((code: Int, description: String) -> Unit)? = null
    // Stored before checkout opens so MainActivity's simple listener can retrieve them
    var currentOrderId: String = ""
    var currentSignature: String = ""
}

@Composable
fun PlantTreeScreen(
    onOrderPlaced: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // ── STATE VARIABLES ──────────────────────────────────────────────────────
    var selectedTier by remember { mutableStateOf("Sapling") }
    var selectedOccasion by remember { mutableStateOf("Birthday") }
    var isGift by remember { mutableStateOf(false) }

    // Recipient details (if Gift)
    var recipientName by remember { mutableStateOf("") }
    var recipientEmail by remember { mutableStateOf("") }
    var giftMessage by remember { mutableStateOf("") }

    // Checkout UI States
    var isPaying by remember { mutableStateOf(false) }
    var paymentStatusText by remember { mutableStateOf("") }
    var showSuccessDialog by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var currentRazorpayOrderId by remember { mutableStateOf("") }

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
        "\"The best time to plant a tree was 20 years ago. The second best time is now.\" — Chinese Proverb",
        "\"He who plants a tree plants a hope.\" — Lucy Larcom",
        "\"To plant a garden is to believe in tomorrow.\" — Audrey Hepburn",
        "\"A nation that destroys its soils destroys itself. Forests are the lungs of our land.\" — Roosevelt"
    )
    val randomQuote = remember { quotes.random() }

    // ── Register Razorpay callbacks ──────────────────────────────────────────
    DisposableEffect(Unit) {
        // Preload Razorpay for faster checkout launch
        Checkout.preload(context)

        RazorpayPaymentState.onPaymentSuccess = { paymentId, orderId, signature ->
            scope.launch {
                paymentStatusText = "Verifying payment..."
                val mockCoords = "${(10..22).random()}.${(1000..9999).random()}° N, ${(72..85).random()}.${(1000..9999).random()}° E"
                val dbRecipient = if (isGift) recipientName else (SupabaseService.userName ?: "Myself")

                val result = SupabaseService.verifyMobilePayment(
                    razorpayPaymentId = paymentId,
                    razorpayOrderId = orderId,
                    razorpaySignature = signature,
                    planName = selectedTier,
                    occasion = selectedOccasion,
                    amountPaid = totalAmount.toDouble(),
                    isGift = isGift,
                    recipientName = dbRecipient,
                    recipientEmail = recipientEmail,
                    giftMessage = giftMessage,
                    location = "GKVK Campus",
                    coordinates = mockCoords
                )

                isPaying = false
                result.fold(
                    onSuccess = {
                        showSuccessDialog = true
                        // Auto-redirect to Steward Dashboard after 3 seconds
                        scope.launch {
                            delay(3000)
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
                        errorMessage = error.message ?: "Payment verification failed. Please contact support."
                    }
                )
            }
        }

        RazorpayPaymentState.onPaymentError = { code, description ->
            isPaying = false
            errorMessage = when (code) {
                0 -> "Payment cancelled."
                else -> "Payment failed (Code $code): $description"
            }
        }

        onDispose {
            RazorpayPaymentState.onPaymentSuccess = null
            RazorpayPaymentState.onPaymentError = null
        }
    }

    // ── Launch Razorpay Checkout ─────────────────────────────────────────────
    fun launchRazorpayCheckout(orderResponse: SupabaseService.MobileOrderResponse) {
        try {
            val activity = context as? Activity ?: run {
                errorMessage = "Unable to open payment window"
                isPaying = false
                return
            }
            // Store orderId so MainActivity's PaymentResultListener can retrieve it
            RazorpayPaymentState.currentOrderId = orderResponse.orderId
            RazorpayPaymentState.currentSignature = ""

            val checkout = Checkout()
            checkout.setKeyID(orderResponse.razorpayKeyId)
            checkout.setImage(android.R.mipmap.sym_def_app_icon)

            val options = JSONObject().apply {
                put("name", "Green Legacy")
                put("description", "$selectedTier Sponsorship – $selectedOccasion")
                put("image", "https://greenlegacy.in/favicon.ico")
                put("order_id", orderResponse.orderId)
                put("currency", orderResponse.currency)
                put("amount", orderResponse.amount)
                put("prefill", JSONObject().apply {
                    put("email", SupabaseService.userEmail ?: "")
                    put("name", SupabaseService.userName ?: "Steward")
                })
                put("theme", JSONObject().apply {
                    put("color", "#064E3B")
                })
                put("notes", JSONObject().apply {
                    put("plan", selectedTier)
                    put("occasion", selectedOccasion)
                    put("species", selectedSpecies)
                    put("isGift", isGift.toString())
                })
            }
            checkout.open(activity, options)
        } catch (e: Exception) {
            isPaying = false
            errorMessage = "Failed to open payment gateway: ${e.message}"
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .verticalScroll(scrollState)
            .padding(bottom = 32.dp)
    ) {
        // ── 1. HERO HEADER ───────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFF064E3B), Color(0xFF022C22))
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
                    text = "Plant a verified native tree. Make it meaningful.",
                    fontSize = 13.sp,
                    color = Color.White.copy(0.7f)
                )
                Spacer(Modifier.height(16.dp))

                // Motivational quote card
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
                    Text(
                        text = "Select Occasion",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Spacer(Modifier.height(10.dp))

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
                        Spacer(Modifier.weight(1f))
                    }

                    Spacer(Modifier.height(20.dp))
                    HorizontalDivider(color = Color(0xFFF1F5F9))
                    Spacer(Modifier.height(16.dp))

                    // "Is this a gift?" toggle
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

                    // Conditional recipient details
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
                                placeholder = { Text("Write a warm environmental message...") },
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

            // ── 4. STEP 3: ORDER SUMMARY & PAYMENT ────────────────────────────
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
                    HorizontalDivider(color = Color(0xFFF1F5F9))
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
                    HorizontalDivider(color = Color(0xFFF1F5F9))
                    Spacer(Modifier.height(16.dp))

                    // Accepted payment methods label
                    Text(
                        text = "Accepted Payment Methods",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Spacer(Modifier.height(10.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        PaymentMethodBadge("UPI", "⚡")
                        PaymentMethodBadge("Cards", "💳")
                        PaymentMethodBadge("Net Banking", "🏦")
                        PaymentMethodBadge("Wallets", "📱")
                    }

                    Spacer(Modifier.height(16.dp))

                    // Trust/Security indicators
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        TrustBadge(icon = Icons.Default.Lock, text = "SSL Secured")
                        TrustBadge(icon = Icons.Default.Eco, text = "Native Plant")
                        TrustBadge(icon = Icons.Default.CheckCircle, text = "Geo-Tagged")
                    }

                    // Razorpay branding
                    Spacer(Modifier.height(10.dp))
                    Text(
                        text = "🔒 Powered by Razorpay — India's most trusted payment gateway",
                        fontSize = 10.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (errorMessage.isNotEmpty()) {
                        Spacer(Modifier.height(10.dp))
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F1))
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Warning, null, tint = Color(0xFFDC2626), modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(8.dp))
                                Text(errorMessage, fontSize = 12.sp, color = Color(0xFFDC2626), lineHeight = 16.sp)
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    // ── CHECKOUT BUTTON ────────────────────────────────────────
                    Button(
                        onClick = {
                            if (isGift && (recipientName.isBlank() || recipientEmail.isBlank())) {
                                errorMessage = "Please enter recipient name and email"
                                return@Button
                            }
                            errorMessage = ""
                            isPaying = true
                            paymentStatusText = "Creating secure order..."

                            scope.launch {
                                val orderResult = SupabaseService.createMobileOrder(selectedTier)
                                orderResult.fold(
                                    onSuccess = { orderResponse ->
                                        currentRazorpayOrderId = orderResponse.orderId
                                        paymentStatusText = "Opening payment gateway..."
                                        launchRazorpayCheckout(orderResponse)
                                        // isPaying stays true until Razorpay callbacks fire
                                    },
                                    onFailure = { error ->
                                        isPaying = false
                                        errorMessage = error.message ?: "Failed to initialize payment. Try again."
                                    }
                                )
                            }
                        },
                        enabled = !isPaying,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF064E3B))
                    ) {
                        if (isPaying) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(18.dp),
                                strokeWidth = 2.dp
                            )
                            Spacer(Modifier.width(10.dp))
                            Text(
                                text = paymentStatusText.ifEmpty { "Processing..." },
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        } else {
                            Icon(Icons.Default.Lock, null, tint = Color(0xFFB2F432), modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = "Pay Securely  |  ₹$totalAmount",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    }
                }
            }
        }
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
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF064E3B)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("View My Legacy 🌱", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            title = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .background(Color(0xFFF0FDF4), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🌳", fontSize = 32.sp)
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Payment Successful!",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        textAlign = TextAlign.Center,
                        color = Color(0xFF064E3B)
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Your $selectedSpecies has been sponsored for $selectedOccasion. 🎉",
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 20.sp,
                        color = Color(0xFF374151)
                    )
                    Spacer(Modifier.height(12.dp))
                    // Email confirmation note
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFF0FDF4), RoundedCornerShape(10.dp))
                            .padding(12.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                "📧 Payment receipt has been sent to your email",
                                fontSize = 12.sp,
                                color = Color(0xFF065F46),
                                textAlign = TextAlign.Center,
                                fontWeight = FontWeight.Medium
                            )
                            if (isGift) {
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    "🎁 Gift certificate also sent to $recipientEmail",
                                    fontSize = 11.sp,
                                    color = Color(0xFF047857),
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Redirecting to My Forestry...",
                        fontSize = 11.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center
                    )
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
                .size(26.dp)
                .background(Color(0xFF064E3B), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(stepNum, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB2F432))
        }
        Spacer(Modifier.width(10.dp))
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
    val borderColor = if (selected) Color(0xFF064E3B) else Color(0xFFE2E8F0)
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
                                        .background(Color(0xFF064E3B).copy(0.1f), RoundedCornerShape(50.dp))
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(badge, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF064E3B))
                                }
                            }
                        }
                        Spacer(Modifier.height(2.dp))
                        Text(species, fontSize = 12.sp, color = Color.Gray)
                    }
                    Text(price, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = if (selected) Color(0xFF064E3B) else Color.Black)
                }
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Eco, null, tint = Color(0xFF16A34A), modifier = Modifier.size(13.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(co2Offset, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF16A34A))
                    if (selected) {
                        Spacer(Modifier.width(8.dp))
                        Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF16A34A), modifier = Modifier.size(14.dp))
                    }
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
    val bgColor = if (isSelected) Color(0xFF064E3B) else Color(0xFFF8FAFC)
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
private fun PaymentMethodBadge(label: String, emoji: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(emoji, fontSize = 18.sp)
        Spacer(Modifier.height(2.dp))
        Text(label, fontSize = 10.sp, color = Color.Gray, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun inputColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Color(0xFF064E3B),
    focusedLabelColor = Color(0xFF064E3B),
    unfocusedBorderColor = Color(0xFFD1D5DB),
    focusedContainerColor = Color.White,
    unfocusedContainerColor = Color.White
)
