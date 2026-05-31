package com.example.greenlegacy

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

@Serializable data object Welcome : NavKey
@Serializable data object Auth : NavKey
@Serializable data object Dashboard : NavKey
@Serializable data object Onboarding : NavKey
