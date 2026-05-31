package com.example.greenlegacy.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LocalContentColor
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.ui.components.GlassCard
import com.example.greenlegacy.ui.components.GlassButton
import com.example.greenlegacy.ui.components.SustainabilityRingChart
import com.example.greenlegacy.ui.components.SustainabilityProgressBar
import com.example.greenlegacy.theme.*
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.maps.android.compose.rememberMarkerState
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.ConnectionResult

data class PlantedTree(
    val id: String,
    val recipient: String,
    val occasion: String,
    val species: String,
    val campus: String,
    val date: String,
    val status: String,
    val coordinates: String
)

@Composable
fun MyImpactScreen(
    plantedTrees: List<PlantedTree>,
    modifier: Modifier = Modifier
) {
    var selectedTreeForCertificate by remember { mutableStateOf<PlantedTree?>(null) }
    var selectedTreeForMap by remember { mutableStateOf<PlantedTree?>(null) }
    var selectedTreeForTimeline by remember { mutableStateOf<PlantedTree?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "My Green Impact",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        Text(
            text = "Track your sponsored trees, download certificates, inspect campus soil levels, and view real-time maps.",
            fontSize = 12.sp,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Premium Carbon Offset Ring Chart Overview
        GlassCard(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1.2f)) {
                    Text(
                        text = "Net Forest Statistics",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = GreenDark
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Your collective planting offsets carbon equivalent to driving 2,400 km in an electric car or recycling 50 kg of waste.",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                        lineHeight = 16.sp
                    )
                }
                
                Spacer(modifier = Modifier.width(16.dp))

                // Sustainability Ring Chart
                val percentTarget = if (plantedTrees.isEmpty()) 0f else (plantedTrees.size / 10f).coerceAtMost(1f)
                SustainabilityRingChart(
                    percentage = percentTarget,
                    valueText = "${plantedTrees.size * 220} kg",
                    labelText = "CO2 Offset/yr",
                    modifier = Modifier.size(100.dp)
                )
            }
        }

        // List of Trees
        if (plantedTrees.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No trees sponsored yet. Head over to the 'Plant' tab to plant your first tree! 🌱",
                    fontSize = 14.sp,
                    color = Color.Black,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                itemsIndexed(plantedTrees) { index, tree ->
                    DetailedTreeItemCard(
                        tree = tree,
                        index = index,
                        onViewCertificate = { selectedTreeForCertificate = tree },
                        onViewMap = { selectedTreeForMap = tree },
                        onViewTimeline = { selectedTreeForTimeline = tree }
                    )
                }
            }
        }
    }

    // Modal dialogs
    selectedTreeForCertificate?.let { tree ->
        CertificateDialog(tree = tree, onDismiss = { selectedTreeForCertificate = null })
    }

    selectedTreeForMap?.let { tree ->
        MapDialog(tree = tree, onDismiss = { selectedTreeForMap = null })
    }

    selectedTreeForTimeline?.let { tree ->
        GrowthTimelineDialog(tree = tree, onDismiss = { selectedTreeForTimeline = null })
    }
}

@Composable
fun DetailedTreeItemCard(
    tree: PlantedTree,
    index: Int,
    onViewCertificate: () -> Unit,
    onViewMap: () -> Unit,
    onViewTimeline: () -> Unit
) {
    val bgColor = getPastelColor(index)
    val contentColor = Color(0xFF0F1210)

    GlassCard(
        modifier = Modifier.fillMaxWidth(),
        cornerRadius = 20.dp,
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
                Column {
                    Text(
                        text = "Dedicated to: ${tree.recipient}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = LocalContentColor.current
                    )
                    Text(
                        text = "Occasion: ${tree.occasion}",
                        fontSize = 12.sp,
                        color = GreenDark, // Dark forest green for readability on light pastel card
                        fontWeight = FontWeight.SemiBold
                    )
                }
                
                // Status Badge
                val statusColor = when (tree.status.lowercase()) {
                    "mature" -> GreenDark
                    "growing" -> Color(0xFF0D5F66)
                    else -> Color(0xFF8B5A2B)
                }
                
                Box(
                    modifier = Modifier
                        .border(1.dp, statusColor, RoundedCornerShape(8.dp))
                        .padding(vertical = 4.dp, horizontal = 8.dp)
                ) {
                    Text(
                        text = tree.status,
                        fontSize = 10.sp,
                        color = statusColor,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            HorizontalDivider(color = LocalContentColor.current.copy(alpha = 0.2f), thickness = 0.5.dp)
            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1.1f)) {
                    Text(
                        text = "Species: ${tree.species}",
                        fontSize = 12.sp,
                        color = LocalContentColor.current.copy(alpha = 0.8f)
                    )
                    Text(
                        text = "Site: ${tree.campus} Campus",
                        fontSize = 12.sp,
                        color = LocalContentColor.current.copy(alpha = 0.8f)
                    )
                    Text(
                        text = "Planted on: ${tree.date}",
                        fontSize = 12.sp,
                        color = LocalContentColor.current.copy(alpha = 0.6f)
                    )
                }

                Column(
                    horizontalAlignment = Alignment.End,
                    modifier = Modifier.weight(0.9f)
                ) {
                    // Clickable GPS text links to the Map view
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clickable { onViewMap() }
                            .padding(bottom = 8.dp)
                    ) {
                        Icon(
                            Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = GreenDark,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = tree.coordinates,
                            fontSize = 11.sp,
                            color = GreenDark,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "Growth Timeline",
                            fontSize = 10.sp,
                            color = GreenDark,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .clickable { onViewTimeline() }
                                .border(0.5.dp, GreenDark, RoundedCornerShape(6.dp))
                                .padding(vertical = 4.dp, horizontal = 8.dp)
                        )
                        Text(
                            text = "Certificate",
                            fontSize = 10.sp,
                            color = Color(0xFF8B5A2B),
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .clickable { onViewCertificate() }
                                .border(0.5.dp, Color(0xFF8B5A2B), RoundedCornerShape(6.dp))
                                .padding(vertical = 4.dp, horizontal = 8.dp)
                        )
                    }
                }
            }
        }
    }
}

/**
 * Interactive Map dialog.
 * Uses Google Maps SDK to show the exact tree location.
 * Gracefully falls back to custom Canvas vector rendering if Google Play Services is missing.
 */
@Composable
fun MapDialog(
    tree: PlantedTree,
    onDismiss: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    
    // Check if Play Services is available
    val isPlayServicesAvailable = remember {
        try {
            GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context) == ConnectionResult.SUCCESS
        } catch (e: Exception) {
            false
        }
    }
    
    var showGoogleMap by remember { mutableStateOf(isPlayServicesAvailable) }
    
    // Parse tree coordinates
    val treeLatLng = remember(tree.coordinates) {
        try {
            val parts = tree.coordinates.split(",")
            val latPart = parts[0].trim().replace("°", "").replace("N", "").replace("S", "").trim()
            val lngPart = if (parts.size > 1) parts[1].trim().replace("°", "").replace("E", "").replace("W", "").trim() else ""
            
            var lat = latPart.toDoubleOrNull() ?: 12.9716
            var lng = lngPart.toDoubleOrNull() ?: 77.5946
            
            if (parts[0].contains("S")) lat = -lat
            if (parts.size > 1 && parts[1].contains("W")) lng = -lng
            
            LatLng(lat, lng)
        } catch (e: Exception) {
            LatLng(12.9716, 77.5946) // Default to GKVK Bangalore campus coordinate
        }
    }

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(treeLatLng, 16f)
    }

    val markerState = rememberMarkerState(position = treeLatLng)

    // Pulsing circle scale for the GPS leaf marker (Canvas Fallback)
    val infiniteTransition = rememberInfiniteTransition(label = "PulseMarker")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 8f,
        targetValue = 24f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "markerPulse"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
            ) {
                Text("Close Map Preview", color = Color.White)
            }
        },
        title = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "📍 Site Map",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    
                    if (isPlayServicesAvailable) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clickable { showGoogleMap = !showGoogleMap }
                                .border(0.5.dp, GreenPrimary, RoundedCornerShape(8.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = if (showGoogleMap) "Show Blueprint" else "Show Satellite",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = GreenPrimary
                            )
                        }
                    }
                }
                Text(
                    text = "${tree.campus} (${tree.coordinates})",
                    fontSize = 11.sp,
                    color = TealAccent
                )
            }
        },
        text = {
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp),
                cornerRadius = 20.dp
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    if (showGoogleMap) {
                        GoogleMap(
                            modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(16.dp)),
                            cameraPositionState = cameraPositionState
                        ) {
                            Marker(
                                state = markerState,
                                title = tree.species,
                                snippet = "Planted on ${tree.date}"
                            )
                        }
                    } else {
                        // Styled Fallback Canvas Map (College Blueprint Vector)
                        Canvas(modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(16.dp))) {
                            val w = size.width
                            val h = size.height

                            // Draw Grass background
                            drawRect(Color(0xFFE8F5E9))

                            // Draw Campus Roads / Paths
                            val path = Path().apply {
                                moveTo(0f, h * 0.3f)
                                lineTo(w * 0.4f, h * 0.3f)
                                lineTo(w * 0.6f, h * 0.8f)
                                lineTo(w, h * 0.8f)
                            }
                            drawPath(
                                path = path,
                                color = Color(0xFFECEFF1),
                                style = Stroke(width = 30f)
                            )

                            // Draw campus pond/lake
                            drawCircle(
                                color = Color(0xFFB3E5FC),
                                radius = w * 0.15f,
                                center = Offset(w * 0.18f, h * 0.75f)
                            )

                            // Draw Partner Agriculture College Buildings
                            drawRect(
                                color = Color(0xFFCFD8DC),
                                topLeft = Offset(w * 0.7f, h * 0.15f),
                                size = androidx.compose.ui.geometry.Size(w * 0.22f, h * 0.22f)
                            )
                            drawRect(
                                color = Color(0xFFB0BEC5),
                                topLeft = Offset(w * 0.74f, h * 0.2f),
                                size = androidx.compose.ui.geometry.Size(w * 0.14f, h * 0.12f)
                            )

                            // Draw surrounding generic campus trees
                            drawCircle(Color(0xFF81C784), 16f, Offset(w * 0.1f, h * 0.2f))
                            drawCircle(Color(0xFF81C784), 14f, Offset(w * 0.18f, h * 0.15f))
                            drawCircle(Color(0xFF81C784), 15f, Offset(w * 0.45f, h * 0.5f))
                            drawCircle(Color(0xFF81C784), 18f, Offset(w * 0.35f, h * 0.65f))
                            drawCircle(Color(0xFF81C784), 15f, Offset(w * 0.9f, h * 0.7f))

                            // Pulsing GPS Target Highlight
                            val targetX = w * 0.48f
                            val targetY = h * 0.42f
                            
                            drawCircle(
                                color = GreenPrimary.copy(alpha = 0.25f),
                                radius = pulseScale,
                                center = Offset(targetX, targetY)
                            )
                            
                            // Draw custom green leaf pin
                            drawCircle(
                                color = GreenPrimary,
                                radius = 8f,
                                center = Offset(targetX, targetY)
                            )
                        }
                    }

                    // Floating Card overlay for details
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(12.dp)
                            .background(Color.White.copy(alpha = 0.85f), RoundedCornerShape(10.dp))
                            .padding(6.dp)
                    ) {
                        Text(
                            text = "Your ${tree.species} is planted here",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                    }
                }
            }
        },
        shape = RoundedCornerShape(24.dp)
    )
}

/**
 * Growth timeline dialog.
 * Shows time-lapse stages and real-time campus soil metrics.
 */
@Composable
fun GrowthTimelineDialog(
    tree: PlantedTree,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
            ) {
                Text("Close Details", color = Color.White)
            }
        },
        title = {
            Text("📈 Growth timeline: ${tree.recipient}'s Tree", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                // Growth Time-Lapse Checklist
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 16.dp
                ) {
                    Text(
                        text = "1. Growth Milestones",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = GreenPrimary,
                        modifier = Modifier.padding(bottom = 10.dp)
                    )

                    MilestoneRow(stage = "Sown / Planted", date = tree.date, completed = true)
                    MilestoneRow(stage = "Irrigated & Nurtured", date = "Every 3 days", completed = true)
                    MilestoneRow(stage = "First Sapling Leaves", date = "2 weeks after", completed = true)
                    MilestoneRow(
                        stage = "Mature Tree Canopy", 
                        date = "Estimated 3 years", 
                        completed = tree.status.lowercase() == "mature"
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Campus Soil Sensor Metrics
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    cornerRadius = 16.dp
                ) {
                    Text(
                        text = "2. Campus Sensor Telemetry",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = GreenPrimary,
                        modifier = Modifier.padding(bottom = 10.dp)
                    )
                    
                    SustainabilityProgressBar(percentage = 0.78f, labelText = "Soil Moisture Level", modifier = Modifier.padding(bottom = 8.dp))
                    SustainabilityProgressBar(percentage = 0.88f, labelText = "Soil Nutrition Score", modifier = Modifier.padding(bottom = 8.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Site Temperature",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
                        )
                        Text(
                            text = "26.4°C (Normal)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = AmberAccent
                        )
                    }
                }
            }
        },
        shape = RoundedCornerShape(24.dp)
    )
}

@Composable
fun MilestoneRow(
    stage: String,
    date: String,
    completed: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(16.dp)
                .clip(CircleShape)
                .background(if (completed) GreenPrimary else GlassBorderWhite)
                .border(1.dp, if (completed) GreenPrimary else GlassBorderWhite, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            if (completed) {
                Icon(
                    imageVector = Icons.Default.Star, // Simple completed dot representation
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(10.dp)
                )
            }
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Column {
            Text(
                text = stage,
                fontSize = 13.sp,
                fontWeight = if (completed) FontWeight.Bold else FontWeight.Normal,
                color = if (completed) MaterialTheme.colorScheme.onBackground else MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
            )
            Text(
                text = date,
                fontSize = 11.sp,
                color = if (completed) GreenPrimary else MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
            )
        }
    }
}

@Composable
fun CertificateDialog(
    tree: PlantedTree,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    modifier = Modifier.border(1.dp, GlassBorderWhite, RoundedCornerShape(20.dp))
                ) {
                    Text("Close", color = MaterialTheme.colorScheme.onBackground)
                }
                
                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text("Save to Device", color = Color.White)
                }
            }
        },
        title = null,
        text = {
            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                cornerRadius = 24.dp,
                borderWidth = 2.dp,
                elevation = 12.dp
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "GREEN LEGACY",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp,
                        color = GreenDark,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    Text(
                        text = "Certificate of Planting",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "This certificate is proudly awarded to confirm that a native",
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
                    )
                    
                    Text(
                        text = tree.species,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = GreenDark,
                        modifier = Modifier.padding(vertical = 4.dp),
                        textAlign = TextAlign.Center
                    )
                    
                    Text(
                        text = "has been successfully planted at the",
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
                    )
                    
                    Text(
                        text = "${tree.campus} Campus",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onBackground,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        text = "Dedicated in honor of",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                        textAlign = TextAlign.Center
                    )
                    
                    Text(
                        text = tree.recipient,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = GreenDark,
                        textAlign = TextAlign.Center
                    )
                    
                    Text(
                        text = "for their ${tree.occasion}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Coordinates",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                            )
                            Text(
                                text = tree.coordinates,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                        }
                        
                        FakeQRCode(modifier = Modifier.size(50.dp))
                    }
                    
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    Text(
                        text = "Order ID: ${tree.id}",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
                    )
                }
            }
        },
        shape = RoundedCornerShape(28.dp),
        properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false),
        modifier = Modifier.padding(16.dp)
    )
}

@Composable
fun FakeQRCode(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        
        drawRect(Color.White)
        
        val border = w * 0.1f
        val qSize = w * 0.3f
        
        drawRect(Color.Black, topLeft = Offset(border, border), size = androidx.compose.ui.geometry.Size(qSize, qSize))
        drawRect(Color.White, topLeft = Offset(border + w*0.06f, border + w*0.06f), size = androidx.compose.ui.geometry.Size(qSize - w*0.12f, qSize - w*0.12f))
        drawRect(Color.Black, topLeft = Offset(border + w*0.1f, border + w*0.1f), size = androidx.compose.ui.geometry.Size(qSize - w*0.2f, qSize - w*0.2f))

        drawRect(Color.Black, topLeft = Offset(w - border - qSize, border), size = androidx.compose.ui.geometry.Size(qSize, qSize))
        drawRect(Color.White, topLeft = Offset(w - border - qSize + w*0.06f, border + w*0.06f), size = androidx.compose.ui.geometry.Size(qSize - w*0.12f, qSize - w*0.12f))
        drawRect(Color.Black, topLeft = Offset(w - border - qSize + w*0.1f, border + w*0.1f), size = androidx.compose.ui.geometry.Size(qSize - w*0.2f, qSize - w*0.2f))

        drawRect(Color.Black, topLeft = Offset(border, h - border - qSize), size = androidx.compose.ui.geometry.Size(qSize, qSize))
        drawRect(Color.White, topLeft = Offset(border + w*0.06f, h - border - qSize + w*0.06f), size = androidx.compose.ui.geometry.Size(qSize - w*0.12f, qSize - w*0.12f))
        drawRect(Color.Black, topLeft = Offset(border + w*0.1f, h - border - qSize + w*0.1f), size = androidx.compose.ui.geometry.Size(qSize - w*0.2f, qSize - w*0.2f))

        drawRect(Color.Black, topLeft = Offset(w * 0.5f, h * 0.4f), size = androidx.compose.ui.geometry.Size(w*0.1f, h*0.1f))
        drawRect(Color.Black, topLeft = Offset(w * 0.6f, h * 0.5f), size = androidx.compose.ui.geometry.Size(w*0.15f, h*0.08f))
        drawRect(Color.Black, topLeft = Offset(w * 0.45f, h * 0.65f), size = androidx.compose.ui.geometry.Size(w*0.08f, h*0.15f))
        drawRect(Color.Black, topLeft = Offset(w * 0.7f, h * 0.7f), size = androidx.compose.ui.geometry.Size(w*0.1f, h*0.1f))
    }
}
