package com.example.greenlegacy

import androidx.compose.runtime.Composable
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.greenlegacy.ui.screens.WelcomeScreen
import com.example.greenlegacy.ui.screens.AuthScreen
import com.example.greenlegacy.ui.screens.DashboardScreen
import com.example.greenlegacy.ui.screens.RhythmicOnboardingScreen

@Composable
fun MainNavigation() {
    // Start with Onboarding when app is clicked
    val startKey = Onboarding
    val backStack = rememberNavBackStack(startKey)

    // Listen to Google OAuth Sign-in redirects
    val oauthResult = com.example.greenlegacy.data.SupabaseService.oauthSessionResult
    androidx.compose.runtime.LaunchedEffect(oauthResult) {
        if (oauthResult != null) {
            if (oauthResult.isSuccess) {
                // Clear backstack and go to Dashboard
                backStack.removeLastOrNull()
                backStack.add(Dashboard)
            }
            com.example.greenlegacy.data.SupabaseService.oauthSessionResult = null
        }
    }

    NavDisplay(
        backStack = backStack,
        onBack = {
            if (backStack.size > 1) {
                backStack.removeLastOrNull()
            }
        },
        entryProvider = entryProvider {
            entry<Onboarding> {
                RhythmicOnboardingScreen(
                    onOnboardingComplete = {
                        val nextKey = if (com.example.greenlegacy.data.SupabaseService.isLoggedIn()) Dashboard else Welcome
                        // Clean up Onboarding and transition to next screen
                        backStack.removeLastOrNull()
                        backStack.add(nextKey)
                    }
                )
            }
            entry<Welcome> {
                WelcomeScreen(
                    onContinueWithEmail = {
                        backStack.add(Auth)
                    },
                    onContinueAsGuest = {
                        backStack.removeLastOrNull()
                        backStack.add(Dashboard)
                    }
                )
            }
            entry<Auth> {
                AuthScreen(
                    onLoginSuccess = {
                        // Clear navigation path to dashboard
                        backStack.add(Dashboard)
                    }
                )
            }
            entry<Dashboard> {
                DashboardScreen(
                    onLogout = {
                        // Return to Auth
                        backStack.add(Auth)
                    }
                )
            }
        }
    )
}
