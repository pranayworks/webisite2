package com.example.greenlegacy.ui.screens

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
import com.example.greenlegacy.data.SupabaseService
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlantTreeScreen(
    onOrderPlaced: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val scope = rememberCoroutineScope()
    var isSubmitting by remember { mutableStateOf(false) }

    var recipientName by remember { mutableStateOf("") }
    var recipientEmail by remember { mutableStateOf("") }
    
    val occasions = listOf("Birthday", "Anniversary", "Graduation", "Memorial", "Corporate CSR")
    var selectedOccasion by remember { mutableStateOf("Birthday") }
    
    val states = listOf("Karnataka", "Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Kerala", "Gujarat")
    var selectedState by remember { mutableStateOf("Karnataka") }
    var stateDropdownExpanded by remember { mutableStateOf(false) }

    val tiers = listOf(
        Triple("Seedling", "₹299", "Perfect starter contribution"),
        Triple("Sapling", "₹599", "Popular - sturdy native tree"),
        Triple("Legacy", "₹1,999", "5 trees + priority naming")
    )
    var selectedTier by remember { mutableStateOf("Sapling") }
    
    var showSuccessDialog by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Text(
            text = "Plant a Tree Legacy",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        Text(
            text = "Transform moments into memories by planting native trees in partner agriculture campuses.",
            fontSize = 13.sp,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 20.dp),
            lineHeight = 18.sp
        )

        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = "1. Dedication Details",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = GreenDark,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            GlassTextField(
                value = recipientName,
                onValueChange = { recipientName = it },
                label = "Recipient's Name",
                leadingIcon = Icons.Default.Person,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            GlassTextField(
                value = recipientEmail,
                onValueChange = { recipientEmail = it },
                label = "Recipient's Email (For Updates)",
                leadingIcon = Icons.Default.Person,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // Occasion selection
            Text(
                text = "Select Occasion",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                occasions.forEach { occasion ->
                    val isSelected = selectedOccasion == occasion
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .border(
                                width = 1.dp,
                                color = if (isSelected) GreenPrimary else GlassBorderWhite,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable { selectedOccasion = occasion }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = occasion,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) GreenDark else MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                            textAlign = TextAlign.Center,
                            lineHeight = 14.sp
                        )
                    }
                }
            }

            // Location selection
            Text(
                text = "Select Planting Location",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            ExposedDropdownMenuBox(
                expanded = stateDropdownExpanded,
                onExpandedChange = { stateDropdownExpanded = !stateDropdownExpanded },
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                OutlinedTextField(
                    readOnly = true,
                    value = "$selectedState Campus",
                    onValueChange = {},
                    label = { Text("Planting Site") },
                    leadingIcon = { Icon(Icons.Default.LocationOn, null, tint = GreenPrimary) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = stateDropdownExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = GreenPrimary,
                        unfocusedBorderColor = GlassBorderWhite,
                        focusedLabelColor = GreenPrimary
                    )
                )
                ExposedDropdownMenu(
                    expanded = stateDropdownExpanded,
                    onDismissRequest = { stateDropdownExpanded = false }
                ) {
                    states.forEach { state ->
                        DropdownMenuItem(
                            text = { Text("$state Campus") },
                            onClick = {
                                selectedState = state
                                stateDropdownExpanded = false
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Subscription Tier Selector
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = "2. Select Package",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = GreenDark,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            tiers.forEach { (tierName, price, desc) ->
                val isSelected = selectedTier == tierName
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) GreenPrimary else GlassBorderWhite,
                            shape = RoundedCornerShape(16.dp)
                        )
                        .clickable { selectedTier = tierName }
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = tierName,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = desc,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                        )
                    }
                    Text(
                        text = price,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelected) GreenDark else Color.Gray
                    )
                }
            }

            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(vertical = 8.dp),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            GlassButton(
                text = if (isSubmitting) "Processing..." else "Confirm & Sponsor Plant",
                enabled = !isSubmitting,
                onClick = {
                    if (recipientName.isBlank() || recipientEmail.isBlank()) {
                        errorMessage = "Please enter recipient name and email"
                    } else {
                        errorMessage = ""
                        isSubmitting = true
                        scope.launch {
                            val species = when (selectedTier) {
                                "Seedling" -> "Tulsi (Ocimum tenuiflorum)"
                                "Sapling" -> "Neem (Azadirachta indica)"
                                else -> "Sandalwood (Santalum album)"
                            }
                            val mockCoords = "${(10..22).random()}.${(1000..9999).random()}° N, ${(72..85).random()}.${(1000..9999).random()}° E"
                            
                            val result = SupabaseService.plantNewTree(
                                recipient = recipientName,
                                occasion = selectedOccasion,
                                campus = "$selectedState Campus",
                                species = species,
                                coordinates = mockCoords
                            )
                            isSubmitting = false
                            result.fold(
                                onSuccess = {
                                    showSuccessDialog = true
                                },
                                onFailure = { error ->
                                    errorMessage = error.message ?: "Failed to record planting"
                                }
                            )
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                accentMode = true
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }

    // Success dialog
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { 
                showSuccessDialog = false
                onOrderPlaced()
                recipientName = ""
                recipientEmail = ""
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSuccessDialog = false
                        onOrderPlaced()
                        recipientName = ""
                        recipientEmail = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                ) {
                    Text("Awesome", color = Color.White)
                }
            },
            title = {
                Text("🌳 Order Placed Successfully!", fontWeight = FontWeight.Bold)
            },
            text = {
                Column {
                    Text(
                        text = "Thank you! A native tree will be planted in $selectedState Campus in honor of $recipientName for their $selectedOccasion.",
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "We will send GPS coordinates, updates, and the planting certificate to $recipientEmail shortly.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                        lineHeight = 18.sp
                    )
                }
            },
            shape = RoundedCornerShape(24.dp)
        )
    }
}
