package com.example.greenlegacy.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.greenlegacy.R
import com.example.greenlegacy.data.SupabaseService
import com.example.greenlegacy.theme.GreenPrimary
import com.example.greenlegacy.theme.GreenLight
import com.example.greenlegacy.theme.GreenDark
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    onLoginSuccess: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .safeDrawingPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // Form Title
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = if (isLogin) "Login" else "Sign Up",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = GreenDark,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (isLogin) "Enter your credentials to access your account" else "Create an account to start planting trees",
                    fontSize = 14.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            // Input Fields Form
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (!isLogin) {
                    AuthTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = "Full Name",
                        leadingIcon = Icons.Default.Person
                    )

                    AuthTextField(
                        value = age,
                        onValueChange = { age = it },
                        label = "Age",
                        leadingIcon = Icons.Default.Info,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )

                    AuthTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = "Phone Number",
                        leadingIcon = Icons.Default.Phone,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                    )

                    AuthTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = "Address",
                        leadingIcon = Icons.Default.Home
                    )
                }

                AuthTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = "Email",
                    leadingIcon = Icons.Default.Email,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )

                AuthTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = "Password",
                    leadingIcon = Icons.Default.Lock,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    trailingIcon = {
                        val icon = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(imageVector = icon, contentDescription = "Toggle password visibility", tint = Color.Gray)
                        }
                    }
                )

                if (isLogin) {
                    Text(
                        text = "Forgot Password?",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Gray,
                        style = TextStyle(textDecoration = TextDecoration.Underline),
                        modifier = Modifier
                            .padding(vertical = 4.dp)
                            .clickable { /* Reset password */ }
                    )
                }

                if (errorMessage.isNotEmpty()) {
                    Text(
                        text = errorMessage,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Submit Button
                Button(
                    onClick = {
                        if (email.isBlank() || password.isBlank() || (!isLogin && (name.isBlank() || age.isBlank() || phone.isBlank() || address.isBlank()))) {
                            errorMessage = "Please fill in all fields"
                        } else if (!email.contains("@")) {
                            errorMessage = "Please enter a valid email address"
                        } else if (password.length < 6) {
                            errorMessage = "Password must be at least 6 characters"
                        } else {
                            errorMessage = ""
                            isLoading = true
                            scope.launch {
                                val result = if (isLogin) {
                                    SupabaseService.signIn(email, password)
                                } else {
                                    SupabaseService.signUp(email, password, name, age, phone, address)
                                }
                                isLoading = false
                                result.fold(
                                    onSuccess = {
                                        onLoginSuccess()
                                    },
                                    onFailure = { error ->
                                        errorMessage = error.message ?: "Authentication failed"
                                    }
                                )
                            }
                        }
                    },
                    enabled = !isLoading,
                    colors = ButtonDefaults.buttonColors(containerColor = GreenDark),
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier
                        .fillMaxWidth(0.9f)
                        .height(52.dp)
                ) {
                    Text(
                        text = if (isLoading) "Connecting..." else (if (isLogin) "Login" else "Sign Up"),
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Divider OR
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(0.9f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0), thickness = 1.dp)
                    Text(
                        text = "or",
                        color = Color.Gray,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0), thickness = 1.dp)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Social logins below OR separator
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AuthSocialButton(
                        text = "Continue with Google",
                        iconRes = R.drawable.ic_google,
                        containerColor = Color.White,
                        textColor = Color(0xFF1E293B),
                        onClick = { SupabaseService.launchGoogleSignIn(context) }
                    )

                    AuthSocialButton(
                        text = "Continue with Apple",
                        iconRes = R.drawable.ic_apple,
                        containerColor = GreenPrimary,
                        textColor = Color(0xFF0F1210),
                        onClick = onLoginSuccess,
                        iconTint = Color(0xFF0F1210)
                    )

                    AuthSocialButton(
                        text = "Continue As Guest",
                        iconRes = R.drawable.ic_guest,
                        containerColor = Color(0xFFF1F5F9),
                        textColor = Color(0xFF0F1210),
                        onClick = onLoginSuccess,
                        iconTint = Color(0xFF0F1210)
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    // Switch Mode Toggle Link
                    val toggleText = buildAnnotatedString {
                        if (isLogin) {
                            append("Need an account? ")
                            withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = GreenPrimary)) {
                                append("Sign up")
                            }
                        } else {
                            append("Already have an account? ")
                            withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = GreenPrimary)) {
                                append("Log in")
                            }
                        }
                    }

                    Text(
                        text = toggleText,
                        fontSize = 14.sp,
                        color = Color.Gray,
                        modifier = Modifier.clickable {
                            isLogin = !isLogin
                            errorMessage = ""
                        }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    leadingIcon: ImageVector? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    singleLine: Boolean = true
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label, color = Color.Gray) },
        leadingIcon = leadingIcon?.let {
            { Icon(imageVector = it, contentDescription = null, tint = Color.Gray) }
        },
        trailingIcon = trailingIcon,
        visualTransformation = visualTransformation,
        keyboardOptions = keyboardOptions,
        singleLine = singleLine,
        shape = RoundedCornerShape(24.dp),
        modifier = modifier.fillMaxWidth(0.9f),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = GreenPrimary,
            unfocusedBorderColor = Color(0xFFE2E8F0),
            cursorColor = GreenPrimary,
            focusedTextColor = Color(0xFF0F1210),
            unfocusedTextColor = Color(0xFF0F1210),
            focusedLabelColor = GreenPrimary,
            unfocusedLabelColor = Color.Gray,
            focusedLeadingIconColor = GreenPrimary,
            unfocusedLeadingIconColor = Color.Gray
        )
    )
}

@Composable
fun AuthSocialButton(
    text: String,
    iconRes: Int,
    containerColor: Color,
    textColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    iconTint: Color? = null
) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = containerColor),
        shape = RoundedCornerShape(24.dp),
        border = if (containerColor == Color.White) BorderStroke(1.dp, Color(0xFFE2E8F0)) else null,
        modifier = modifier
            .fillMaxWidth(0.9f)
            .height(50.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                tint = iconTint ?: Color.Unspecified,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = text,
                color = textColor,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
