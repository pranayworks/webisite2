package com.example.greenlegacy.ui.screens

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Eco
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.ui.components.GlassBackground
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.GreenDark
import com.example.greenlegacy.theme.GlassBgWhite
import com.example.greenlegacy.theme.GlassBorderWhite
import com.example.greenlegacy.data.SupabaseService
import kotlinx.coroutines.launch

enum class DashboardTab(val title: String, val icon: ImageVector) {
    HOME("Home", Icons.Default.Home),
    PLANT("Plant Tree", Icons.Default.AddCircle),
    MORE("More", Icons.Default.MoreVert)
}

@Composable
fun DashboardScreen(
    onLogout: () -> Unit
) {
    var currentTab by remember { mutableStateOf(DashboardTab.HOME) }
    var showProfile by remember { mutableStateOf(false) }

    val isLoggedIn = remember { derivedStateOf { SupabaseService.isLoggedIn() } }
    LaunchedEffect(isLoggedIn.value) {
        if (!isLoggedIn.value) {
            onLogout()
        }
    }

    // Shared list of user's sponsored trees loaded from Supabase
    val sponsoredTrees = remember { mutableStateListOf<PlantedTree>() }
    val scope = rememberCoroutineScope()
    var isLoadingTrees by remember { mutableStateOf(false) }

    fun refreshTrees() {
        isLoadingTrees = true
        scope.launch {
            SupabaseService.fetchPlantedTrees().fold(
                onSuccess = { trees ->
                    sponsoredTrees.clear()
                    sponsoredTrees.addAll(trees)
                },
                onFailure = { error ->
                    android.util.Log.e("DashboardScreen", "Error loading trees", error)
                }
            )
            isLoadingTrees = false
        }
    }

    LaunchedEffect(Unit) {
        refreshTrees()
    }

    // Profile screen shown as full-screen overlay
    if (showProfile) {
        ProfileScreen(
            onBack = { showProfile = false },
            onSignOut = {
                showProfile = false
                SupabaseService.logout()
                onLogout()
            },
            onPlantTreeClick = {
                showProfile = false
                currentTab = DashboardTab.PLANT
            }
        )
        return
    }

    GlassBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .safeDrawingPadding()
        ) {
            // Main content area with smooth crossfade
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                Crossfade(targetState = currentTab, label = "TabTransition") { tab ->
                    when (tab) {
                        DashboardTab.HOME -> {
                            HomeScreen(
                                onPlantTreeClick = { currentTab = DashboardTab.PLANT },
                                onProfileClick = { showProfile = true }
                            )
                        }
                        DashboardTab.PLANT -> {
                            PlantTreeScreen(
                                onOrderPlaced = {
                                    refreshTrees()
                                    // Navigate to Home tab after planting
                                    currentTab = DashboardTab.HOME
                                }
                            )
                        }
                        DashboardTab.MORE -> {
                            MoreScreen(
                                onLogout = {
                                    SupabaseService.logout()
                                    onLogout()
                                }
                            )
                        }
                    }
                }
            }

            // Glassmorphic Bottom Navigation Bar
            GlassBottomBar(
                selectedTab = currentTab,
                onTabSelected = { currentTab = it }
            )
        }
    }
}


@Composable
fun GlassBottomBar(
    selectedTab: DashboardTab,
    onTabSelected: (DashboardTab) -> Unit
) {
    // Clean white capsule bar with soft green border
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 12.dp)
            .background(Color.White, RoundedCornerShape(28.dp))
            .border(1.dp, GlassBorderWhite, RoundedCornerShape(28.dp))
            .clip(RoundedCornerShape(28.dp))
            .padding(vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            DashboardTab.values().forEach { tab ->
                val isSelected = selectedTab == tab
                val iconColor = if (isSelected) GreenDark else Color.Black.copy(alpha = 0.4f)
                val bgActiveColor = if (isSelected) GreenPrimary else Color.Transparent
                val textColor = if (isSelected) Color.Black else Color.Black.copy(alpha = 0.5f)

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(bgActiveColor)
                        .clickable { onTabSelected(tab) }
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Icon(
                        imageVector = tab.icon,
                        contentDescription = tab.title,
                        tint = iconColor,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = tab.title,
                        fontSize = 10.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = textColor
                    )
                }
            }
        }
    }
}
