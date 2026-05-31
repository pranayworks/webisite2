package com.example.greenlegacy.ui.screens

import android.app.DatePickerDialog
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.data.SupabaseService
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.GlassBorderWhite
import kotlinx.coroutines.launch
import java.util.Calendar
import java.io.File

// ── Enum for profile sub-pages ───────────────────────────────────────────────
private enum class ProfileSubPage { MAIN, STEWARD_DASHBOARD }

@Composable
fun ProfileScreen(
    onBack: () -> Unit,
    onSignOut: () -> Unit,
    onPlantTreeClick: () -> Unit = {},
    startOnStewardDashboard: Boolean = false
) {
    var subPage by remember(startOnStewardDashboard) {
        mutableStateOf(if (startOnStewardDashboard) ProfileSubPage.STEWARD_DASHBOARD else ProfileSubPage.MAIN)
    }

    when (subPage) {
        ProfileSubPage.MAIN -> ProfileMainPage(
            onBack = onBack,
            onSignOut = onSignOut,
            onOpenStewardDashboard = { subPage = ProfileSubPage.STEWARD_DASHBOARD }
        )
        ProfileSubPage.STEWARD_DASHBOARD -> StewardDashboardPage(
            onBack = {
                if (startOnStewardDashboard) {
                    onBack()
                } else {
                    subPage = ProfileSubPage.MAIN
                }
            },
            onPlantTreeClick = onPlantTreeClick
        )
    }
}

// ── Main profile page ────────────────────────────────────────────────────────
@Composable
fun ProfileMainPage(
    onBack: () -> Unit,
    onSignOut: () -> Unit,
    onOpenStewardDashboard: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val scope = rememberCoroutineScope()

    // Profile state — load saved photo URI from prefs
    var fullName by remember { mutableStateOf(SupabaseService.userName ?: "") }
    var email by remember { mutableStateOf(SupabaseService.userEmail ?: "") }
    var birthDate by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var doorNo by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var pincode by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("") }
    var photoUri by remember {
        mutableStateOf(SupabaseService.photoUriString?.let { Uri.parse(it) })
    }

    // UI state
    var showCompleteProfile by remember { mutableStateOf(false) }
    var isSaving by remember { mutableStateOf(false) }
    var saveSuccess by remember { mutableStateOf(false) }
    var saveError by remember { mutableStateOf("") }
    var genderDropdownExpanded by remember { mutableStateOf(false) }

    // Validation errors
    var nameError by remember { mutableStateOf("") }
    var birthError by remember { mutableStateOf("") }
    var phoneError by remember { mutableStateOf("") }
    var doorError by remember { mutableStateOf("") }
    var streetError by remember { mutableStateOf("") }
    var pincodeError by remember { mutableStateOf("") }
    var stateError by remember { mutableStateOf("") }
    var genderError by remember { mutableStateOf("") }

    val genderOptions = listOf("Male", "Female", "Non-binary", "Prefer not to say")
    val tier = "Eco Planter"
    val tierColor = Color(0xFF16A34A)

    // Load profile from Supabase on open
    LaunchedEffect(Unit) {
        SupabaseService.fetchUserProfile().onSuccess { p ->
            if (p.fullName.isNotBlank()) fullName = p.fullName
            phone = p.phone
            gender = p.gender
            
            // Parse age to birthDate if possible
            val ageVal = p.age.toIntOrNull()
            if (ageVal != null && ageVal > 0) {
                val currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)
                birthDate = "01/01/${currentYear - ageVal}"
            }
            
            // Parse combined address
            val addr = p.address
            if (addr.contains(" | ")) {
                val parts = addr.split(" | ")
                doorNo = parts.getOrNull(0) ?: ""
                street = parts.getOrNull(1) ?: ""
                state = parts.getOrNull(2) ?: ""
                pincode = parts.getOrNull(3) ?: ""
            } else {
                street = addr
            }
        }
    }

    // Image picker — saves URI to SharedPrefs for persistence
    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            try {
                val localFile = File(context.filesDir, "profile_photo.jpg")
                context.contentResolver.openInputStream(uri)?.use { inputStream ->
                    localFile.outputStream().use { outputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }
                val localUri = Uri.fromFile(localFile)
                photoUri = localUri
                SupabaseService.photoUriString = localUri.toString()
            } catch (e: Exception) {
                android.util.Log.e("ProfileScreen", "Failed to copy profile photo", e)
            }
        }
    }

    // Date picker dialog
    fun showDatePicker() {
        val cal = Calendar.getInstance()
        DatePickerDialog(
            context,
            { _, year, month, day ->
                birthDate = "%02d/%02d/%04d".format(day, month + 1, year)
            },
            cal.get(Calendar.YEAR) - 18,
            cal.get(Calendar.MONTH),
            cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    // Achievements
    data class Ach(val icon: ImageVector, val title: String, val sub: String, val unlocked: Boolean, val color: Color)
    val achievements = listOf(
        Ach(Icons.Default.Star, "First Seed", "Planted first tree", true, Color(0xFF16A34A)),
        Ach(Icons.Default.Eco, "Forest Guardian", "Plant 5+ trees", true, Color(0xFF0284C7)),
        Ach(Icons.Default.EmojiEvents, "CO2 Champion", "Offset 500+ kg CO2", false, Color(0xFFF59E0B)),
        Ach(Icons.Default.People, "Drive Hero", "Attend a drive", true, Color(0xFF6366F1)),
        Ach(Icons.Default.Share, "Ambassador", "Refer 3 friends", false, Color(0xFFEC4899)),
        Ach(Icons.Default.Favorite, "Legacy Maker", "Plant 25+ trees", false, Color(0xFFEF4444))
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .statusBarsPadding()
    ) {
        // ── Top Bar ─────────────────────────────────────────────────────────
        Surface(shadowElevation = 2.dp, color = Color.White) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, "Back", tint = Color.Black)
                }
                Text(
                    "My Profile",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center
                )
                // Spacer to center the title
                Spacer(Modifier.width(48.dp))
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
        ) {
            // ── Avatar + Name + Email + Tier ─────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color(0xFF052E16), Color(0xFF14532D))
                        )
                    )
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    // Avatar with photo or placeholder
                    Box(
                        modifier = Modifier.size(88.dp),
                        contentAlignment = Alignment.BottomEnd
                    ) {
                        Box(
                            modifier = Modifier
                                .size(88.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(0.1f))
                                .border(2.dp, Color(0xFF4ADE80), CircleShape)
                                .clickable { imagePicker.launch("image/*") },
                            contentAlignment = Alignment.Center
                        ) {
                            val bitmap = remember(photoUri) {
                                photoUri?.let { uri ->
                                    try {
                                        context.contentResolver.openInputStream(uri)?.use {
                                            BitmapFactory.decodeStream(it)
                                        }
                                    } catch (e: Exception) {
                                        android.util.Log.e("ProfileScreen", "Failed to decode profile photo", e)
                                        null
                                    }
                                }
                            }
                            if (bitmap != null) {
                                Image(
                                    bitmap = bitmap.asImageBitmap(),
                                    contentDescription = "Profile photo",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize().clip(CircleShape)
                                )
                            } else {
                                Icon(
                                    Icons.Default.Person,
                                    "Profile",
                                    tint = Color(0xFF4ADE80),
                                    modifier = Modifier.size(44.dp)
                                )
                            }
                        }
                        // Camera badge
                        Box(
                            modifier = Modifier
                                .size(26.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF4ADE80))
                                .border(2.dp, Color(0xFF052E16), CircleShape)
                                .clickable { imagePicker.launch("image/*") },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CameraAlt, null, tint = Color(0xFF052E16), modifier = Modifier.size(13.dp))
                        }
                    }

                    Spacer(Modifier.height(12.dp))
                    Text(fullName.ifBlank { "Your Name" }, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(email.ifBlank { "your@email.com" }, fontSize = 12.sp, color = Color.White.copy(0.6f))
                    Spacer(Modifier.height(8.dp))

                    // Tier badge
                    Row(
                        modifier = Modifier
                            .background(Color(0xFF4ADE80).copy(0.15f), RoundedCornerShape(50.dp))
                            .border(1.dp, Color(0xFF4ADE80).copy(0.4f), RoundedCornerShape(50.dp))
                            .padding(horizontal = 14.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Star, null, tint = Color(0xFF4ADE80), modifier = Modifier.size(13.dp))
                        Spacer(Modifier.width(5.dp))
                        Text("Tier: $tier", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4ADE80))
                    }
                }
            }

            Column(modifier = Modifier.padding(16.dp)) {

                // ── Steward Dashboard button ──────────────────────────────────
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenStewardDashboard() },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF052E16)),
                    elevation = CardDefaults.cardElevation(3.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier.size(42.dp).background(Color(0xFF4ADE80).copy(0.2f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Dashboard, null, tint = Color(0xFF4ADE80), modifier = Modifier.size(22.dp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Steward Dashboard", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text("View your impact, trees & green points", fontSize = 11.sp, color = Color.White.copy(0.6f))
                        }
                        Icon(Icons.Default.ChevronRight, null, tint = Color(0xFF4ADE80))
                    }
                }

                Spacer(Modifier.height(20.dp))

                // ── My Achievements ───────────────────────────────────────────
                Text("MY ACHIEVEMENTS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A), letterSpacing = 1.5.sp)
                Spacer(Modifier.height(10.dp))

                for (i in achievements.indices step 3) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        achievements.drop(i).take(3).forEach { ach ->
                            Card(
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (ach.unlocked) Color.White else Color(0xFFF0FDF4)
                                ),
                                elevation = CardDefaults.cardElevation(if (ach.unlocked) 2.dp else 0.dp)
                            ) {
                                Column(
                                    modifier = Modifier.fillMaxWidth().padding(10.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Box(
                                        modifier = Modifier.size(34.dp).background(
                                            if (ach.unlocked) ach.color.copy(0.12f) else GlassBorderWhite, CircleShape
                                        ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(ach.icon, null,
                                            tint = if (ach.unlocked) ach.color else Color.Black.copy(0.25f),
                                            modifier = Modifier.size(17.dp))
                                    }
                                    Spacer(Modifier.height(6.dp))
                                    Text(ach.title, fontSize = 10.sp, fontWeight = FontWeight.Bold,
                                        color = if (ach.unlocked) Color.Black else Color.Black.copy(0.3f),
                                        textAlign = TextAlign.Center, maxLines = 1)
                                    Text(ach.sub, fontSize = 9.sp,
                                        color = Color.Black.copy(if (ach.unlocked) 0.5f else 0.25f),
                                        textAlign = TextAlign.Center, maxLines = 2, lineHeight = 11.sp)
                                    if (!ach.unlocked) {
                                        Spacer(Modifier.height(3.dp))
                                        Icon(Icons.Default.Lock, null, tint = Color.Black.copy(0.25f), modifier = Modifier.size(11.dp))
                                    }
                                }
                            }
                        }
                        // Fill remaining spots in last row
                        repeat(3 - minOf(3, achievements.size - i)) { Spacer(Modifier.weight(1f)) }
                    }
                    Spacer(Modifier.height(8.dp))
                }

                Spacer(Modifier.height(20.dp))

                // ── Complete Profile ──────────────────────────────────────────
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showCompleteProfile = !showCompleteProfile },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier.size(40.dp).background(Color(0xFF16A34A).copy(0.1f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Edit, null, tint = Color(0xFF16A34A), modifier = Modifier.size(20.dp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Complete Profile", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                            Text("Fill your details for a personalised experience", fontSize = 11.sp, color = Color.Black.copy(0.5f))
                        }
                        Icon(
                            if (showCompleteProfile) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            null, tint = Color(0xFF16A34A)
                        )
                    }
                }

                AnimatedVisibility(visible = showCompleteProfile) {
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(modifier = Modifier.fillMaxWidth().padding(18.dp)) {

                            if (saveSuccess) {
                                Row(
                                    modifier = Modifier.fillMaxWidth()
                                        .background(Color(0xFFF0FDF4), RoundedCornerShape(10.dp))
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF16A34A), modifier = Modifier.size(18.dp))
                                    Spacer(Modifier.width(8.dp))
                                    Text("Profile saved successfully!", fontSize = 13.sp, color = Color(0xFF16A34A), fontWeight = FontWeight.SemiBold)
                                }
                                Spacer(Modifier.height(12.dp))
                            }

                            if (saveError.isNotEmpty()) {
                                Row(
                                    modifier = Modifier.fillMaxWidth()
                                        .background(Color(0xFFFEF2F2), RoundedCornerShape(10.dp))
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Error, null, tint = Color(0xFFDC2626), modifier = Modifier.size(18.dp))
                                    Spacer(Modifier.width(8.dp))
                                    Text(saveError, fontSize = 12.sp, color = Color(0xFFDC2626))
                                }
                                Spacer(Modifier.height(12.dp))
                            }

                            // Full Name
                            ProfileField("Full Name *", fullName, nameError, Icons.Default.Person,
                                KeyboardType.Text, KeyboardCapitalization.Words) {
                                fullName = it; nameError = ""
                            }

                            // Birth Date — opens DatePicker
                            OutlinedTextField(
                                value = birthDate,
                                onValueChange = {},
                                label = { Text("Date of Birth *") },
                                leadingIcon = { Icon(Icons.Default.CalendarToday, null, tint = Color(0xFF16A34A)) },
                                trailingIcon = {
                                    IconButton(onClick = { showDatePicker() }) {
                                        Icon(Icons.Default.DateRange, "Pick date", tint = Color(0xFF16A34A))
                                    }
                                },
                                readOnly = true,
                                modifier = Modifier.fillMaxWidth().clickable { showDatePicker() },
                                shape = RoundedCornerShape(12.dp),
                                isError = birthError.isNotEmpty(),
                                supportingText = if (birthError.isNotEmpty()) { { Text(birthError, color = Color(0xFFDC2626)) } } else null,
                                colors = profileFieldColors()
                            )
                            Spacer(Modifier.height(10.dp))

                            // Phone
                            ProfileField("Phone Number *", phone, phoneError, Icons.Default.Phone,
                                KeyboardType.Phone, KeyboardCapitalization.None) {
                                phone = it; phoneError = ""
                            }

                            // Gender dropdown
                            Box {
                                OutlinedTextField(
                                    value = gender,
                                    onValueChange = {},
                                    label = { Text("Gender *") },
                                    leadingIcon = { Icon(Icons.Default.Wc, null, tint = Color(0xFF16A34A)) },
                                    trailingIcon = {
                                        IconButton(onClick = { genderDropdownExpanded = true }) {
                                            Icon(Icons.Default.ArrowDropDown, null, tint = Color(0xFF16A34A))
                                        }
                                    },
                                    readOnly = true,
                                    modifier = Modifier.fillMaxWidth().clickable { genderDropdownExpanded = true },
                                    shape = RoundedCornerShape(12.dp),
                                    isError = genderError.isNotEmpty(),
                                    supportingText = if (genderError.isNotEmpty()) { { Text(genderError, color = Color(0xFFDC2626)) } } else null,
                                    colors = profileFieldColors()
                                )
                                DropdownMenu(
                                    expanded = genderDropdownExpanded,
                                    onDismissRequest = { genderDropdownExpanded = false }
                                ) {
                                    genderOptions.forEach { option ->
                                        DropdownMenuItem(
                                            text = { Text(option) },
                                            onClick = { gender = option; genderDropdownExpanded = false; genderError = "" }
                                        )
                                    }
                                }
                            }
                            Spacer(Modifier.height(10.dp))

                            // Address section header
                            Text("Address *", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A),
                                modifier = Modifier.padding(bottom = 8.dp))

                            ProfileField("Door / Flat No. *", doorNo, doorError, Icons.Default.Home,
                                KeyboardType.Text, KeyboardCapitalization.Words) { doorNo = it; doorError = "" }

                            ProfileField("Street / Area *", street, streetError, Icons.Default.LocationOn,
                                KeyboardType.Text, KeyboardCapitalization.Words) { street = it; streetError = "" }

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Box(Modifier.weight(1f)) {
                                    ProfileField("Pincode *", pincode, pincodeError, Icons.Default.Pin,
                                        KeyboardType.Number, KeyboardCapitalization.None) { pincode = it; pincodeError = "" }
                                }
                                Box(Modifier.weight(1f)) {
                                    ProfileField("State *", state, stateError, Icons.Default.LocationCity,
                                        KeyboardType.Text, KeyboardCapitalization.Words) { state = it; stateError = "" }
                                }
                            }

                            Spacer(Modifier.height(16.dp))

                            // Save button
                            Button(
                                onClick = {
                                    // Validate all required fields
                                    var hasError = false
                                    if (fullName.isBlank()) { nameError = "Full name is required"; hasError = true }
                                    if (birthDate.isBlank()) { birthError = "Date of birth is required"; hasError = true }
                                    if (phone.isBlank()) { phoneError = "Phone number is required"; hasError = true }
                                    if (gender.isBlank()) { genderError = "Please select a gender"; hasError = true }
                                    if (doorNo.isBlank()) { doorError = "Door/flat no. is required"; hasError = true }
                                    if (street.isBlank()) { streetError = "Street/area is required"; hasError = true }
                                    if (pincode.isBlank()) { pincodeError = "Pincode is required"; hasError = true }
                                    if (state.isBlank()) { stateError = "State is required"; hasError = true }

                                    if (!hasError) {
                                        isSaving = true
                                        saveSuccess = false
                                        saveError = ""
                                        scope.launch {
                                            val calculatedAge = try {
                                                val parts = birthDate.split("/")
                                                val day = parts[0].toInt()
                                                val month = parts[1].toInt()
                                                val year = parts[2].toInt()
                                                val birthCal = java.util.Calendar.getInstance().apply {
                                                    set(year, month - 1, day)
                                                }
                                                val today = java.util.Calendar.getInstance()
                                                var calculated = today.get(java.util.Calendar.YEAR) - birthCal.get(java.util.Calendar.YEAR)
                                                if (today.get(java.util.Calendar.DAY_OF_YEAR) < birthCal.get(java.util.Calendar.DAY_OF_YEAR)) {
                                                    calculated--
                                                }
                                                calculated.toString()
                                            } catch (e: Exception) {
                                                ""
                                            }

                                            val combinedAddress = "$doorNo | $street | $state | $pincode"

                                            val result = SupabaseService.updateProfile(
                                                SupabaseService.UserProfile(
                                                    fullName = fullName,
                                                    age = calculatedAge,
                                                    phone = phone,
                                                    address = combinedAddress,
                                                    gender = gender
                                                )
                                            )
                                            isSaving = false
                                            result.fold(
                                                onSuccess = { saveSuccess = true },
                                                onFailure = { 
                                                    saveError = it.message ?: "Save failed. Please try again."
                                                    if (!SupabaseService.isLoggedIn()) {
                                                        onSignOut()
                                                    }
                                                }
                                            )
                                        }
                                    }
                                },
                                enabled = !isSaving,
                                modifier = Modifier.fillMaxWidth().height(50.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A))
                            ) {
                                if (isSaving) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                } else {
                                    Icon(Icons.Default.Save, null, tint = Color.White, modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(8.dp))
                                    Text("Save Profile", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(24.dp))

                // ── Sign Out ──────────────────────────────────────────────────
                OutlinedButton(
                    onClick = {
                        SupabaseService.logout()
                        onSignOut()
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFDC2626)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFDC2626))
                ) {
                    Icon(Icons.Default.ExitToApp, null, tint = Color(0xFFDC2626), modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Sign Out", color = Color(0xFFDC2626), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }

                Spacer(Modifier.height(32.dp))
            }
        }
    }
}

// ── Helper composables ───────────────────────────────────────────────────────

@Composable
private fun ProfileField(
    label: String,
    value: String,
    error: String,
    icon: ImageVector,
    keyboardType: KeyboardType,
    capitalization: KeyboardCapitalization,
    onValueChange: (String) -> Unit
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        leadingIcon = { Icon(icon, null, tint = Color(0xFF16A34A)) },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        isError = error.isNotEmpty(),
        supportingText = if (error.isNotEmpty()) { { Text(error, color = Color(0xFFDC2626)) } } else null,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType, capitalization = capitalization),
        colors = profileFieldColors()
    )
    Spacer(Modifier.height(10.dp))
}

@Composable
private fun profileFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Color(0xFF16A34A),
    focusedLabelColor = Color(0xFF16A34A),
    unfocusedBorderColor = Color(0xFFD1D5DB),
    errorBorderColor = Color(0xFFDC2626),
    focusedContainerColor = Color.White,
    unfocusedContainerColor = Color.White
)

// ── Steward Dashboard ─────────────────────────────────────────────────────────
@Composable
fun StewardDashboardPage(
    onBack: () -> Unit,
    onPlantTreeClick: () -> Unit
) {
    val scrollState = rememberScrollState()
    var plantedTrees by remember { mutableStateOf(listOf<PlantedTree>()) }
    var isLoading by remember { mutableStateOf(true) }
    var expandedTreeId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        SupabaseService.fetchPlantedTrees().onSuccess { plantedTrees = it }
        isLoading = false
    }

    val userName = SupabaseService.userName ?: "Steward"
    val totalTrees = plantedTrees.size
    val activeTrees = plantedTrees.count { it.status == "Growing" }
    val greenPoints = totalTrees * 100 + (totalTrees / 5) * 50
    val co2Offset = totalTrees * 21.7

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .statusBarsPadding()
    ) {
        // ── Top bar (white website style) ──────────────────────────────────────
        Surface(shadowElevation = 2.dp, color = Color.White) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, "Back", tint = Color.Black)
                }
                Column(Modifier.weight(1f)) {
                    Text(
                        "Green Legacy", fontSize = 16.sp, fontWeight = FontWeight.Bold,
                        color = Color(0xFF16A34A)
                    )
                    Text("STEWARDSHIP PORTAL", fontSize = 9.sp, letterSpacing = 1.5.sp, color = Color.Black.copy(0.4f))
                }
                
                // Avatar with live profile photo loading
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
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF16A34A).copy(0.15f), CircleShape)
                        .border(1.dp, Color(0xFF16A34A), CircleShape),
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
                        Icon(Icons.Default.Person, null, tint = Color(0xFF16A34A), modifier = Modifier.size(18.dp))
                    }
                }
            }
        }

        Column(modifier = Modifier.fillMaxSize().verticalScroll(scrollState)) {

            // ── Header welcome ────────────────────────────────────────────────
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 20.dp)) {
                Text(
                    "Welcome, $userName",
                    fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B)
                )
                Text(
                    "YOUR LEGACY CONTINUES TO GROW.",
                    fontSize = 10.sp, letterSpacing = 1.sp,
                    color = Color(0xFF64748B)
                )
            }

            // ── My Forest ────────────────────────────────────────────────────
            Divider(color = GlassBorderWhite)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("My Forest", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                    Text(
                        "$activeTrees Active specimens under stewardship.",
                        fontSize = 12.sp, color = Color(0xFF64748B)
                    )
                }
                Text(
                    "VIEW ALL REGISTRY",
                    fontSize = 10.sp, fontWeight = FontWeight.Bold,
                    color = Color(0xFF16A34A), letterSpacing = 1.sp
                )
            }

            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color(0xFF16A34A))
                }
            } else if (plantedTrees.isEmpty()) {
                // Empty state
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(12.dp))
                            .border(1.dp, GlassBorderWhite, RoundedCornerShape(12.dp))
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🌱", fontSize = 48.sp)
                            Spacer(Modifier.height(12.dp))
                            Text("No specimens yet", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                            Text("Your forest awaits its first tree.", fontSize = 12.sp, color = Color(0xFF64748B))
                            Spacer(Modifier.height(16.dp))
                            Button(
                                onClick = onPlantTreeClick,
                                shape = RoundedCornerShape(50.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A))
                            ) {
                                Text("PLANT A TREE", color = Color.White, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                            }
                        }
                    }
                }
            } else {
                // Tree cards matching website style
                plantedTrees.forEach { tree ->
                    val isExpanded = expandedTreeId == tree.id
                    // Determine growth stage
                    val growthStage = when (tree.status) {
                        "Growing" -> 0
                        "Young Tree" -> 1
                        "Mature" -> 2
                        else -> 0
                    }
                    val growthStages = listOf("SAPLING", "YOUNG TREE", "MATURE")

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, GlassBorderWhite),
                        elevation = CardDefaults.cardElevation(0.dp)
                    ) {
                        Column(modifier = Modifier.fillMaxWidth()) {

                            // Latest Update placeholder (satellite imagery placeholder)
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(130.dp)
                                    .background(Color(0xFFF0FDF4))
                                    .border(BorderStroke(0.dp, Color.Transparent)),
                                contentAlignment = Alignment.Center
                            ) {
                                // Satellite/map placeholder
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(Icons.Default.Satellite, null, tint = Color(0xFF16A34A).copy(0.4f), modifier = Modifier.size(36.dp))
                                    Spacer(Modifier.height(6.dp))
                                    Text("SATELLITE VIEW", fontSize = 10.sp, letterSpacing = 2.sp, color = Color(0xFF64748B))
                                    Text("Image available after planting", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                }
                                // Latest Update badge
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopStart)
                                        .padding(10.dp)
                                        .background(Color.White.copy(0.9f), RoundedCornerShape(6.dp))
                                        .border(1.dp, GlassBorderWhite, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 10.dp, vertical = 4.dp)
                                ) {
                                    Text("LATEST UPDATE", fontSize = 9.sp, letterSpacing = 1.sp, color = Color(0xFF475569))
                                }
                                // History icon
                                Box(
                                    modifier = Modifier.align(Alignment.BottomEnd).padding(10.dp)
                                        .size(28.dp).background(Color(0xFF16A34A), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.History, null, tint = Color.White, modifier = Modifier.size(14.dp))
                                }
                            }

                            // Tree info
                            Column(modifier = Modifier.fillMaxWidth().padding(14.dp)) {
                                // Status + GPS row
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Location pin
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.LocationOn, null, tint = Color(0xFF64748B), modifier = Modifier.size(14.dp))
                                        Spacer(Modifier.width(4.dp))
                                        Text(tree.campus.take(20), fontSize = 11.sp, color = Color(0xFF64748B))
                                    }
                                    // Status + GPS
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0xFF16A34A).copy(0.1f), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 8.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                tree.status.uppercase(), fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold, color = Color(0xFF16A34A), letterSpacing = 1.sp
                                            )
                                        }
                                        Spacer(Modifier.width(8.dp))
                                        Row(
                                            modifier = Modifier
                                                .border(1.dp, Color(0xFF16A34A).copy(0.3f), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text("GPS", fontSize = 9.sp, color = Color(0xFF16A34A), fontWeight = FontWeight.Bold)
                                            Spacer(Modifier.width(3.dp))
                                            Icon(Icons.Default.OpenInNew, null, tint = Color(0xFF16A34A), modifier = Modifier.size(10.dp))
                                        }
                                    }
                                }

                                Spacer(Modifier.height(12.dp))

                                // Growth stage bar
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        growthStages.forEach { stage ->
                                            Text(stage, fontSize = 8.sp, letterSpacing = 0.5.sp,
                                                color = Color(0xFF64748B),
                                                fontWeight = FontWeight.Bold)
                                        }
                                    }
                                    Spacer(Modifier.height(4.dp))
                                    // Progress bar
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp)
                                            .background(GlassBorderWhite, RoundedCornerShape(2.dp))
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth(fraction = (growthStage + 1) / 3f)
                                                .fillMaxHeight()
                                                .background(Color(0xFF16A34A), RoundedCornerShape(2.dp))
                                        )
                                    }
                                    Spacer(Modifier.height(4.dp))
                                    // Stage indicator dot
                                    Row(modifier = Modifier.fillMaxWidth()) {
                                        repeat(3) { idx ->
                                            Box(
                                                modifier = Modifier
                                                    .size(8.dp)
                                                    .background(
                                                        if (idx <= growthStage) Color(0xFF16A34A) else GlassBorderWhite,
                                                        CircleShape
                                                    )
                                            )
                                            if (idx < 2) Spacer(Modifier.weight(1f))
                                        }
                                    }
                                }

                                Spacer(Modifier.height(12.dp))
                                Divider(color = GlassBorderWhite)
                                Spacer(Modifier.height(10.dp))

                                // Bottom info: ID, species, Age, Show Timeline
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(tree.id, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A))
                                        Text(tree.species, fontSize = 11.sp, color = Color(0xFF1E293B))
                                        Text("Planted: ${tree.date}", fontSize = 10.sp, color = Color(0xFF64748B))
                                    }
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text("AGE:", fontSize = 9.sp, color = Color(0xFF64748B))
                                        Text("GROWING", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16A34A))
                                        Spacer(Modifier.height(4.dp))
                                        Text(
                                            "Show Timeline",
                                            fontSize = 10.sp,
                                            color = Color(0xFF16A34A),
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.clickable { expandedTreeId = if (isExpanded) null else tree.id }
                                        )
                                    }
                                }

                                // Timeline expansion
                                AnimatedVisibility(visible = isExpanded) {
                                    Column(modifier = Modifier.padding(top = 12.dp)) {
                                        Divider(color = GlassBorderWhite)
                                        Spacer(Modifier.height(10.dp))
                                        Text("GROWTH TIMELINE", fontSize = 9.sp, letterSpacing = 1.5.sp,
                                            color = Color(0xFF64748B), fontWeight = FontWeight.Bold)
                                        Spacer(Modifier.height(8.dp))
                                        listOf(
                                            Pair("🌱 Planted", tree.date),
                                            Pair("📍 GPS Tagged", "Coordinates logged"),
                                            Pair("💧 First Water", "Week 1 care"),
                                            Pair("🌿 Growth Check", "Upcoming")
                                        ).forEach { (event, detail) ->
                                            Row(modifier = Modifier.padding(vertical = 4.dp)) {
                                                Text(event, fontSize = 11.sp, color = Color(0xFF1E293B), modifier = Modifier.weight(1f))
                                                Text(detail, fontSize = 10.sp, color = Color(0xFF16A34A))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ── Certificates Section ──────────────────────────────────────────
            Divider(color = GlassBorderWhite, modifier = Modifier.padding(top = 16.dp))
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp)) {
                Text("Certificates", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                Text("Valid legal documents of your environmental impact.", fontSize = 12.sp, color = Color(0xFF64748B))
                Spacer(Modifier.height(14.dp))

                if (plantedTrees.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(12.dp))
                            .border(1.dp, GlassBorderWhite, RoundedCornerShape(12.dp))
                            .padding(20.dp)
                    ) {
                        Text(
                            "Certificates will appear here once you plant your first tree.",
                            fontSize = 12.sp, color = Color(0xFF64748B), textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                } else {
                    plantedTrees.forEachIndexed { index, tree ->
                        Card(
                            modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = BorderStroke(1.dp, Color(0xFF16A34A).copy(0.2f)),
                            elevation = CardDefaults.cardElevation(0.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Certificate icon
                                Box(
                                    modifier = Modifier.size(44.dp)
                                        .background(Color(0xFF16A34A).copy(0.1f), RoundedCornerShape(10.dp))
                                        .border(1.dp, Color(0xFF16A34A).copy(0.2f), RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("📜", fontSize = 20.sp)
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(
                                        "Certificate #${(index + 1).toString().padStart(3, '0')}",
                                        fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B)
                                    )
                                    Text(
                                        "${tree.species} · ${tree.campus}",
                                        fontSize = 11.sp, color = Color(0xFF64748B)
                                    )
                                    Text(
                                        "Issued: ${tree.date}",
                                        fontSize = 10.sp, color = Color(0xFF16A34A)
                                    )
                                }
                                // Download button
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFF16A34A), RoundedCornerShape(8.dp))
                                        .padding(horizontal = 12.dp, vertical = 7.dp)
                                        .clickable { /* Download action */ }
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Download, null, tint = Color.White, modifier = Modifier.size(14.dp))
                                        Spacer(Modifier.width(4.dp))
                                        Text("PDF", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ── Stats row ─────────────────────────────────────────────────────
            Divider(color = GlassBorderWhite)
            Column(modifier = Modifier.padding(16.dp)) {
                Text("IMPACT OVERVIEW", fontSize = 11.sp, fontWeight = FontWeight.Bold,
                    color = Color(0xFF64748B), letterSpacing = 1.5.sp)
                Spacer(Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    DarkStatCard("Trees", totalTrees.toString(), "🌳", Modifier.weight(1f))
                    DarkStatCard("Green Pts", greenPoints.toString(), "💚", Modifier.weight(1f))
                    DarkStatCard("CO₂ (kg)", "%.0f".format(co2Offset), "🌬️", Modifier.weight(1f))
                }

                Spacer(Modifier.height(16.dp))

                // Plant a tree CTA (matches website)
                Button(
                    onClick = onPlantTreeClick,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A))
                ) {
                    Icon(Icons.Default.Park, null, tint = Color.White, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("PLANT A TREE", color = Color.White, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                }

                Spacer(Modifier.height(8.dp))

                // Payment registry
                OutlinedButton(
                    onClick = {},
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(50.dp),
                    border = BorderStroke(1.dp, Color(0xFF16A34A)),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF16A34A))
                ) {
                    Icon(Icons.Default.Receipt, null, tint = Color(0xFF16A34A), modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("PAYMENT REGISTRY", color = Color(0xFF16A34A), fontWeight = FontWeight.Bold, letterSpacing = 1.sp, fontSize = 13.sp)
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun DarkStatCard(label: String, value: String, emoji: String, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .background(Color.White, RoundedCornerShape(12.dp))
            .border(1.dp, GlassBorderWhite, RoundedCornerShape(12.dp))
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(emoji, fontSize = 20.sp)
            Spacer(Modifier.height(4.dp))
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF16A34A))
            Text(label, fontSize = 9.sp, color = Color(0xFF64748B), textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun StatCard(label: String, value: String, emoji: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(0.12f)),
        elevation = CardDefaults.cardElevation(0.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(emoji, fontSize = 22.sp)
            Spacer(Modifier.height(4.dp))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Text(label, fontSize = 9.sp, color = Color.White.copy(0.7f), textAlign = TextAlign.Center, lineHeight = 11.sp)
        }
    }
}

@Composable
private fun ImpactMetricCard(label: String, value: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier.size(36.dp).background(color.copy(0.1f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = color, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.width(10.dp))
            Column {
                Text(value, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color.Black)
                Text(label, fontSize = 10.sp, color = Color.Black.copy(0.5f))
            }
        }
    }
}
