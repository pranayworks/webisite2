package com.example.greenlegacy

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.example.greenlegacy.theme.GreenLegacyTheme
import com.example.greenlegacy.data.SupabaseService
import com.example.greenlegacy.ui.screens.RazorpayPaymentState
import com.razorpay.PaymentResultWithDataListener
import com.razorpay.PaymentData
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity(), PaymentResultWithDataListener {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Initialize Supabase HTTP network service
    SupabaseService.init(applicationContext)

    // Check for incoming deep links on cold start
    intent?.let { handleIntent(it) }

    enableEdgeToEdge()
    setContent {
      GreenLegacyTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
          MainNavigation()
        }
      }
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleIntent(intent)
  }

  private fun handleIntent(intent: Intent) {
    val uri = intent.data
    if (uri != null && uri.scheme == "greenlegacy" && uri.host == "login-callback") {
      val fragment = uri.fragment
      if (fragment != null) {
        val params = fragment.split("&").associate {
          val parts = it.split("=")
          val key = parts.getOrNull(0) ?: ""
          val value = parts.getOrNull(1) ?: ""
          key to value
        }
        val accessToken = params["access_token"]
        val refreshToken = params["refresh_token"]
        if (accessToken != null) {
          lifecycleScope.launch {
            val result = SupabaseService.handleOAuthCallback(accessToken, refreshToken)
            SupabaseService.oauthSessionResult = result
          }
        }
      }
    }
  }

  // ── Razorpay Payment Result Callbacks (PaymentResultWithDataListener) ───────

  /**
   * Called when user successfully completes payment via Razorpay checkout.
   */
  override fun onPaymentSuccess(razorpayPaymentId: String?, paymentData: PaymentData?) {
    val paymentId = razorpayPaymentId ?: ""
    val orderId = paymentData?.orderId ?: RazorpayPaymentState.currentOrderId
    val signature = paymentData?.signature ?: ""
    RazorpayPaymentState.onPaymentSuccess?.invoke(paymentId, orderId, signature)
  }

  /**
   * Called when payment fails or user cancels the Razorpay sheet.
   */
  override fun onPaymentError(errorCode: Int, description: String?, paymentData: PaymentData?) {
    val desc = description ?: "Payment was not completed"
    RazorpayPaymentState.onPaymentError?.invoke(errorCode, desc)
  }
}
