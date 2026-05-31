package com.example.greenlegacy.ui.screens

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
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
import androidx.compose.material3.LocalContentColor

data class VolunteerDrive(
    val id: String,
    val title: String,
    val campus: String,
    val date: String,
    val time: String,
    val initialVolunteers: Int,
    var registered: Boolean = false
)

@Composable
fun VolunteerScreen(
    modifier: Modifier = Modifier
) {
    // Pre-populate drives list with mutable state
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
        Text(
            text = "Volunteer Drives",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 4.dp)
        )
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

@Composable
fun DriveCard(
    drive: VolunteerDrive,
    index: Int,
    onRegisterClick: () -> Unit
) {
    val bgColor = getPastelColor(index)
    val contentColor = Color(0xFF0F1210)

    GlassCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 16.dp,
        elevation = 4.dp,
        containerColor = bgColor,
        contentColor = contentColor
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = drive.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = LocalContentColor.current,
                    modifier = Modifier.weight(1f)
                )
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = GreenDark,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "${drive.initialVolunteers} Joins",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = GreenDark
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = GreenDark,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = drive.campus,
                    fontSize = 12.sp,
                    color = LocalContentColor.current.copy(alpha = 0.8f)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            Divider(color = LocalContentColor.current.copy(alpha = 0.2f), thickness = 0.5.dp)
            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Date: ${drive.date}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = LocalContentColor.current
                    )
                    Text(
                        text = "Time: ${drive.time}",
                        fontSize = 11.sp,
                        color = LocalContentColor.current.copy(alpha = 0.6f)
                    )
                }

                if (drive.registered) {
                    Button(
                        onClick = {},
                        enabled = false,
                        colors = ButtonDefaults.buttonColors(
                            disabledContainerColor = GreenDark.copy(alpha = 0.15f),
                            disabledContentColor = GreenDark
                        ),
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                    ) {
                        Text("✓ Registered", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                } else {
                    GlassButton(
                        text = "Join Drive",
                        onClick = onRegisterClick,
                        modifier = Modifier.wrapContentSize(),
                        accentMode = true
                    )
                }
            }
        }
    }
}
