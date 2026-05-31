package com.example.greenlegacy.data

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.example.greenlegacy.ui.screens.PlantedTree
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf

object SupabaseService {
    // Shared Supabase project — same as the Green Legacy website
    private const val SUPABASE_URL = "https://ptjzxinmauuboqovtovo.supabase.co"
    private const val ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0anp4aW5tYXV1Ym9xb3Z0b3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjYzMjgsImV4cCI6MjA4NjIwMjMyOH0.lKWN9B36SN53p4XBhRHf-26F4o1rwenYvKVEzyPJBBY"
    
    private val client = OkHttpClient()
    private val json = Json { ignoreUnknownKeys = true }
    
    private const val PREFS_NAME = "green_legacy_prefs"
    private const val KEY_ACCESS_TOKEN = "access_token"
    private const val KEY_REFRESH_TOKEN = "refresh_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_USER_EMAIL = "user_email"
    private const val KEY_USER_NAME = "user_name"
    private const val KEY_IS_CORPORATE = "is_corporate"
    private const val KEY_COMPANY_NAME = "company_name"
    private const val KEY_PHOTO_URI = "photo_uri"

    private lateinit var prefs: SharedPreferences

    var oauthSessionResult by mutableStateOf<Result<Unit>?>(null)

    private val _userName = mutableStateOf<String?>(null)
    private val _photoUriString = mutableStateOf<String?>(null)
    private val _isLoggedIn = mutableStateOf(false)
    private val refreshMutex = Mutex()

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        _userName.value = prefs.getString(KEY_USER_NAME, null)
        _photoUriString.value = prefs.getString(KEY_PHOTO_URI, null)
        _isLoggedIn.value = prefs.getString(KEY_ACCESS_TOKEN, null) != null
    }

    val userId: String?
        get() = prefs.getString(KEY_USER_ID, null)

    val userEmail: String?
        get() = prefs.getString(KEY_USER_EMAIL, null)

    var userName: String?
        get() = _userName.value
        set(value) {
            _userName.value = value
            if (value != null) {
                prefs.edit().putString(KEY_USER_NAME, value).apply()
            } else {
                prefs.edit().remove(KEY_USER_NAME).apply()
            }
        }

    var isCorporate: Boolean
        get() = prefs.getBoolean(KEY_IS_CORPORATE, false)
        set(value) = prefs.edit().putBoolean(KEY_IS_CORPORATE, value).apply()

    var companyName: String?
        get() = prefs.getString(KEY_COMPANY_NAME, "")
        set(value) = prefs.edit().putString(KEY_COMPANY_NAME, value).apply()

    var photoUriString: String?
        get() = _photoUriString.value
        set(value) {
            _photoUriString.value = value
            if (value != null) {
                prefs.edit().putString(KEY_PHOTO_URI, value).apply()
            } else {
                prefs.edit().remove(KEY_PHOTO_URI).apply()
            }
        }

    fun isLoggedIn(): Boolean {
        return _isLoggedIn.value
    }

    fun logout() {
        prefs.edit().clear().apply()
        _userName.value = null
        _photoUriString.value = null
        _isLoggedIn.value = false
    }

    private fun getAuthHeaders(includeUserToken: Boolean = true): Map<String, String> {
        val headers = mutableMapOf(
            "apikey" to ANON_KEY,
            "Content-Type" to "application/json"
        )
        val token = prefs.getString(KEY_ACCESS_TOKEN, null)
        if (includeUserToken && token != null) {
            headers["Authorization"] = "Bearer $token"
        } else {
            headers["Authorization"] = "Bearer $ANON_KEY"
        }
        return headers
    }

    suspend fun refreshSession(): Result<String> = withContext(Dispatchers.IO) {
        val refreshToken = prefs.getString(KEY_REFRESH_TOKEN, null)
            ?: return@withContext Result.failure(Exception("No refresh token stored"))

        try {
            val bodyJson = buildJsonObject {
                put("refresh_token", refreshToken)
            }.toString()

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/token?grant_type=refresh_token")
                .post(bodyJson.toRequestBody(mediaType))
                .header("apikey", ANON_KEY)
                .header("Content-Type", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errorMsg = parseErrorMessage(bodyStr)
                    // If refresh token is invalid/expired, perform logout so the user can re-authenticate
                    if (response.code == 400 || response.code == 401) {
                        logout()
                    }
                    return@withContext Result.failure(Exception(errorMsg))
                }

                val responseJson = json.parseToJsonElement(bodyStr).jsonObject
                val newAccessToken = responseJson["access_token"]?.jsonPrimitive?.content
                    ?: return@withContext Result.failure(Exception("Access token missing in response"))
                val newRefreshToken = responseJson["refresh_token"]?.jsonPrimitive?.content
                val userJson = responseJson["user"]?.jsonObject
                val userId = userJson?.get("id")?.jsonPrimitive?.content

                val editor = prefs.edit().putString(KEY_ACCESS_TOKEN, newAccessToken)
                if (newRefreshToken != null) {
                    editor.putString(KEY_REFRESH_TOKEN, newRefreshToken)
                }
                if (userId != null) {
                    editor.putString(KEY_USER_ID, userId)
                }
                editor.apply()
                _isLoggedIn.value = true

                return@withContext Result.success(newAccessToken)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    private fun isJwtExpiredResponse(response: okhttp3.Response): Boolean {
        if (response.code == 401) return true
        return try {
            val peeked = response.peekBody(2048).string()
            peeked.contains("JWT expired", ignoreCase = true)
        } catch (e: Exception) {
            false
        }
    }

    private suspend fun executeAuthenticatedCall(
        buildRequest: (headers: Map<String, String>) -> Request
    ): okhttp3.Response = withContext(Dispatchers.IO) {
        val headers = getAuthHeaders()
        val request = buildRequest(headers)
        var response = client.newCall(request).execute()
        
        if (!response.isSuccessful && isJwtExpiredResponse(response)) {
            response.close()
            // Synchronize token refresh using mutex
            val refreshed = refreshMutex.withLock {
                val currentToken = prefs.getString(KEY_ACCESS_TOKEN, null)
                val usedToken = headers["Authorization"]?.removePrefix("Bearer ")
                if (currentToken != null && currentToken != usedToken) {
                    true
                } else {
                    refreshSession().isSuccess
                }
            }
            if (refreshed) {
                val newHeaders = getAuthHeaders()
                val newRequest = buildRequest(newHeaders)
                response = client.newCall(newRequest).execute()
            } else {
                // If refresh failed, retry once with the old headers to return the original error
                response = client.newCall(request).execute()
            }
        }
        response
    }

    suspend fun signUp(
        email: String,
        password: String,
        fullName: String,
        age: String,
        phone: String,
        address: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val requestBodyJson = buildJsonObject {
                put("email", email)
                put("password", password)
                put("data", buildJsonObject {
                    put("full_name", fullName)
                    put("age", age)
                    put("phone", phone)
                    put("address", address)
                })
            }.toString()

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/signup")
                .post(requestBodyJson.toRequestBody(mediaType))
                .header("apikey", ANON_KEY)
                .header("Content-Type", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errorMsg = parseErrorMessage(bodyStr)
                    return@withContext Result.failure(Exception(errorMsg))
                }

                // Parse user ID and session access_token
                val responseJson = json.parseToJsonElement(bodyStr).jsonObject
                val userJson = responseJson["user"]?.jsonObject ?: responseJson
                val userId = userJson["id"]?.jsonPrimitive?.content 
                    ?: return@withContext Result.failure(Exception("Failed to retrieve user ID from signup"))
                val accessToken = responseJson["access_token"]?.jsonPrimitive?.content
                val refreshToken = responseJson["refresh_token"]?.jsonPrimitive?.content

                // If signup returned auto-login tokens, cache them
                if (accessToken != null) {
                    val editor = prefs.edit()
                        .putString(KEY_ACCESS_TOKEN, accessToken)
                        .putString(KEY_USER_ID, userId)
                        .putString(KEY_USER_EMAIL, email)
                    if (refreshToken != null) {
                        editor.putString(KEY_REFRESH_TOKEN, refreshToken)
                    }
                    editor.apply()
                    _isLoggedIn.value = true
                    userName = fullName
                }

                // Insert into profiles table
                insertProfile(userId, email, fullName, age, phone, address)

                return@withContext Result.success(Unit)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    private suspend fun insertProfile(
        id: String,
        email: String,
        fullName: String,
        age: String = "",
        phone: String = "",
        address: String = ""
    ) = withContext(Dispatchers.IO) {
        try {
            val profileJson = buildJsonObject {
                put("id", id)
                put("email", email)
                put("full_name", fullName)
                put("age", age)
                put("phone", phone)
                put("address", address)
            }.toString()

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val request = Request.Builder()
                .url("$SUPABASE_URL/rest/v1/profiles")
                .post(profileJson.toRequestBody(mediaType))
                .header("apikey", ANON_KEY)
                .header("Authorization", "Bearer $ANON_KEY")
                .header("Content-Type", "application/json")
                .header("Prefer", "resolution=merge-duplicates")
                .build()

            client.newCall(request).execute().use { response ->
                // Profile creation is best-effort during signup
                if (!response.isSuccessful) {
                    val err = response.body?.string() ?: ""
                    android.util.Log.e("SupabaseService", "Profile create failed: $err")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("SupabaseService", "Profile insert error", e)
        }
    }

    suspend fun signIn(email: String, password: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val requestBodyJson = buildJsonObject {
                put("email", email)
                put("password", password)
            }.toString()

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/token?grant_type=password")
                .post(requestBodyJson.toRequestBody(mediaType))
                .header("apikey", ANON_KEY)
                .header("Content-Type", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errorMsg = parseErrorMessage(bodyStr)
                    return@withContext Result.failure(Exception(errorMsg))
                }

                val responseJson = json.parseToJsonElement(bodyStr).jsonObject
                val accessToken = responseJson["access_token"]?.jsonPrimitive?.content 
                    ?: return@withContext Result.failure(Exception("Access token missing in response"))
                val refreshToken = responseJson["refresh_token"]?.jsonPrimitive?.content
                val userJson = responseJson["user"]?.jsonObject
                val userId = userJson?.get("id")?.jsonPrimitive?.content 
                    ?: return@withContext Result.failure(Exception("User ID missing in response"))

                // Save tokens temporarily to make profile fetch request
                val editor = prefs.edit()
                    .putString(KEY_ACCESS_TOKEN, accessToken)
                    .putString(KEY_USER_ID, userId)
                    .putString(KEY_USER_EMAIL, email)
                if (refreshToken != null) {
                    editor.putString(KEY_REFRESH_TOKEN, refreshToken)
                }
                editor.apply()
                _isLoggedIn.value = true

                // Fetch user full name from profiles table
                val fullName = fetchProfileName(userId)

                userName = fullName ?: email.substringBefore("@")

                return@withContext Result.success(Unit)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    private suspend fun fetchProfileName(id: String): String? = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SUPABASE_URL/rest/v1/profiles?id=eq.$id&select=full_name")
                .get()
                .header("apikey", ANON_KEY)
                .header("Authorization", "Bearer $ANON_KEY")
                .build()

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val body = response.body?.string() ?: ""
                    val array = json.parseToJsonElement(body).jsonArray
                    if (array.isNotEmpty()) {
                        return@withContext array[0].jsonObject["full_name"]?.jsonPrimitive?.contentOrNull
                    }
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("SupabaseService", "Fetch profile failed", e)
        }
        return@withContext null
    }

    private suspend fun fetchProfileTreesPlanted(id: String): Int {
        try {
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/profiles?id=eq.$id&select=trees_planted")
                    .get()
                    .apply {
                        headers.forEach { (k, v) -> header(k, v) }
                    }
                    .build()
            }
            response.use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    val array = json.parseToJsonElement(body).jsonArray
                    if (array.isNotEmpty()) {
                        return array[0].jsonObject["trees_planted"]?.jsonPrimitive?.intOrNull ?: 0
                    }
                }
            }
        } catch (e: Exception) {}
        return 0
    }

    private suspend fun updateProfileTreesPlanted(id: String, count: Int) {
        try {
            val body = buildJsonObject {
                put("trees_planted", count)
            }.toString()
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/profiles?id=eq.$id")
                    .patch(body.toRequestBody(mediaType))
                    .apply {
                        headers.forEach { (k, v) -> header(k, v) }
                    }
                    .build()
            }
            response.close()
        } catch (e: Exception) {}
    }

    suspend fun fetchPlantedTrees(): Result<List<PlantedTree>> = withContext(Dispatchers.IO) {
        val currentUserId = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        try {
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/planting_orders?user_id=eq.$currentUserId&select=*&order=created_at.desc")
                    .get()
                    .apply {
                        headers.forEach { (k, v) -> header(k, v) }
                    }
                    .build()
            }
            response.use { resp ->
                val bodyStr = resp.body?.string() ?: ""
                if (!resp.isSuccessful) {
                    return@withContext Result.failure(Exception(parseErrorMessage(bodyStr)))
                }

                val jsonArray = json.parseToJsonElement(bodyStr).jsonArray
                val list = jsonArray.map { element ->
                    val obj = element.jsonObject
                    val stewardName = obj["steward_name"]?.jsonPrimitive?.content ?: "Steward"
                    val recipientName = obj["recipient_name"]?.jsonPrimitive?.content
                    val recipientVal = if (!recipientName.isNullOrBlank()) recipientName else stewardName

                    val planName = obj["plan_name"]?.jsonPrimitive?.content ?: "Sapling"
                    val speciesName = obj["species"]?.jsonPrimitive?.content
                    val speciesVal = if (!speciesName.isNullOrBlank()) speciesName else "$planName (Native)"

                    val loc = obj["location"]?.jsonPrimitive?.content
                    val campusVal = if (!loc.isNullOrBlank()) loc else "GKVK Campus"

                    val gps = obj["planting_gps"]?.jsonPrimitive?.content ?: obj["coordinates"]?.jsonPrimitive?.content
                    val coordsVal = if (!gps.isNullOrBlank()) gps else "12.9716° N, 77.5946° E"

                    val dateVal = obj["planting_date"]?.jsonPrimitive?.content ?: obj["created_at"]?.jsonPrimitive?.content ?: "Today"
                    val formattedDate = try {
                        if (dateVal.contains("T")) dateVal.substringBefore("T") else dateVal
                    } catch (e: Exception) { "Today" }

                    PlantedTree(
                        id = obj["id"]?.jsonPrimitive?.content ?: "GL-UNKNOWN",
                        recipient = recipientVal,
                        occasion = obj["occasion"]?.jsonPrimitive?.content ?: "General Stewardship",
                        species = speciesVal,
                        campus = campusVal,
                        date = formattedDate,
                        status = obj["status"]?.jsonPrimitive?.content ?: "Pending",
                        coordinates = coordsVal
                    )
                }
                return@withContext Result.success(list)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    suspend fun plantNewTree(
        recipient: String,
        occasion: String,
        campus: String,
        species: String,
        coordinates: String,
        planName: String = "Sapling",
        amountPaid: Double = 599.0,
        isGift: Boolean = false,
        recipientEmail: String = "",
        giftMessage: String = ""
    ): Result<PlantedTree> = withContext(Dispatchers.IO) {
        val currentUserId = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        try {
            val randomId = "GL-${(10000..99999).random()}"
            val paymentId = "pay_${java.util.UUID.randomUUID().toString().replace("-", "").slice(0..14)}"
            val orderKey = "order_${java.util.UUID.randomUUID().toString().replace("-", "").slice(0..14)}"
            val dateFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
            val formattedDate = dateFormat.format(Date())

            val treesCount = if (planName == "Legacy") 3 else 1

            // Prepare the payload for Next.js backend notifications & database insertion
            val payload = buildJsonObject {
                put("userId", currentUserId)
                put("stewardName", userName ?: "Steward")
                put("userEmail", userEmail ?: "")
                put("trees", treesCount)
                put("planName", planName)
                put("occasion", occasion)
                put("amountPaid", amountPaid)
                put("paymentId", paymentId)
                put("orderKey", orderKey)
                put("isGift", isGift)
                put("recipientName", recipient)
                put("recipientEmail", recipientEmail)
                put("giftMessage", giftMessage)
                put("location", campus)
                put("coordinates", coordinates)
            }

            // Try Next.js server call first
            val serverUrls = listOf(
                "https://greenlegacy.in/api/mobile-payment",
                "http://10.0.2.2:3000/api/mobile-payment",
                "http://192.168.1.10:3000/api/mobile-payment"
            )

            for (url in serverUrls) {
                try {
                    val mediaType = "application/json; charset=utf-8".toMediaType()
                    val request = Request.Builder()
                        .url(url)
                        .post(payload.toString().toRequestBody(mediaType))
                        .build()
                    
                    client.newCall(request).execute().use { response ->
                        if (response.isSuccessful) {
                            return@withContext Result.success(
                                PlantedTree(
                                    id = randomId,
                                    recipient = if (isGift) recipient else (userName ?: "Myself"),
                                    occasion = occasion,
                                    species = species,
                                    campus = campus,
                                    date = formattedDate,
                                    status = "Pending",
                                    coordinates = coordinates
                                )
                            )
                        }
                    }
                } catch (e: Exception) {
                    // Try next URL
                }
            }

            // Fallback to direct client-side database insertion to planting_orders if server is offline
            val orderBodyJson = buildJsonObject {
                put("user_id", currentUserId)
                put("steward_name", userName ?: "Steward")
                put("trees", treesCount)
                put("plan_name", planName)
                put("occasion", occasion)
                put("status", "Pending")
                put("amount_paid", amountPaid)
                put("payment_id", paymentId)
                put("order_key", orderKey)
                put("is_gift", isGift)
                if (isGift) {
                    put("recipient_name", recipient)
                    put("recipient_email", recipientEmail)
                    put("gift_message", giftMessage)
                }
                put("location", campus)
                put("species", species)
                put("planting_gps", coordinates)
            }.toString()

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/planting_orders")
                    .post(orderBodyJson.toRequestBody(mediaType))
                    .apply {
                        headers.forEach { (k, v) -> header(k, v) }
                    }
                    .header("Prefer", "return=representation")
                    .build()
            }
            
            response.use { resp ->
                val bodyStr = resp.body?.string() ?: ""
                if (!resp.isSuccessful) {
                    return@withContext Result.failure(Exception(parseErrorMessage(bodyStr)))
                }

                // Update profiles tree count
                try {
                    val currentTreesCount = fetchProfileTreesPlanted(currentUserId)
                    val newCount = currentTreesCount + treesCount
                    updateProfileTreesPlanted(currentUserId, newCount)
                } catch (e: Exception) {
                    android.util.Log.e("SupabaseService", "Failed to update profiles tree count", e)
                }

                return@withContext Result.success(
                    PlantedTree(
                        id = randomId,
                        recipient = if (isGift) recipient else (userName ?: "Myself"),
                        occasion = occasion,
                        species = species,
                        campus = campus,
                        date = formattedDate,
                        status = "Pending",
                        coordinates = coordinates
                    )
                )
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    fun launchGoogleSignIn(context: Context) {
        val url = "$SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=greenlegacy://login-callback"
        val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
        context.startActivity(intent)
    }

    suspend fun handleOAuthCallback(accessToken: String, refreshToken: String?): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SUPABASE_URL/auth/v1/user")
                .get()
                .header("apikey", ANON_KEY)
                .header("Authorization", "Bearer $accessToken")
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errorMsg = parseErrorMessage(bodyStr)
                    return@withContext Result.failure(Exception(errorMsg))
                }

                val responseJson = json.parseToJsonElement(bodyStr).jsonObject
                val userId = responseJson["id"]?.jsonPrimitive?.content 
                    ?: return@withContext Result.failure(Exception("User ID missing in user info"))
                val email = responseJson["email"]?.jsonPrimitive?.content ?: ""
                
                val userMetadata = responseJson["user_metadata"]?.jsonObject
                val fullName = userMetadata?.get("full_name")?.jsonPrimitive?.content
                    ?: userMetadata?.get("name")?.jsonPrimitive?.content
                    ?: email.substringBefore("@")

                val editor = prefs.edit()
                    .putString(KEY_ACCESS_TOKEN, accessToken)
                    .putString(KEY_USER_ID, userId)
                    .putString(KEY_USER_EMAIL, email)
                if (refreshToken != null) {
                    editor.putString(KEY_REFRESH_TOKEN, refreshToken)
                }
                editor.apply()
                _isLoggedIn.value = true
                userName = fullName

                insertProfile(userId, email, fullName)

                return@withContext Result.success(Unit)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    // ── Testimonials ────────────────────────────────────────────────────────

    data class TestimonialResponse(
        val id: String,
        val name: String,
        val role: String,
        val text: String,
        val rating: Int
    )

    suspend fun fetchTestimonials(): Result<List<TestimonialResponse>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SUPABASE_URL/rest/v1/testimonials?select=id,name,role,text,rating&order=id.asc")
                .get()
                .header("apikey", ANON_KEY)
                .header("Authorization", "Bearer $ANON_KEY")
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception(parseErrorMessage(bodyStr)))
                }
                val array = json.parseToJsonElement(bodyStr).jsonArray
                val list = array.map { el ->
                    val obj = el.jsonObject
                    TestimonialResponse(
                        id     = obj["id"]?.jsonPrimitive?.content ?: "",
                        name   = obj["name"]?.jsonPrimitive?.content ?: "",
                        role   = obj["role"]?.jsonPrimitive?.content ?: "",
                        text   = obj["text"]?.jsonPrimitive?.content ?: "",
                        rating = obj["rating"]?.jsonPrimitive?.int ?: 5
                    )
                }
                return@withContext Result.success(list)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    suspend fun submitTestimonial(
        name: String,
        role: String,
        text: String,
        rating: Int = 5
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val bodyJson = buildJsonObject {
                put("name", name)
                put("role", role)
                put("text", text)
                put("rating", rating)
            }.toString()
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val request = Request.Builder()
                .url("$SUPABASE_URL/rest/v1/testimonials")
                .post(bodyJson.toRequestBody(mediaType))
                .header("apikey", ANON_KEY)
                .header("Authorization", "Bearer $ANON_KEY")
                .header("Content-Type", "application/json")
                .header("Prefer", "return=minimal")
                .build()

            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception(parseErrorMessage(bodyStr)))
                }
                return@withContext Result.success(Unit)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    // ── Profile Management ───────────────────────────────────────────────────

    data class UserProfile(
        val fullName: String = "",
        val age: String = "",
        val phone: String = "",
        val address: String = "",
        val gender: String = ""
    )

    suspend fun fetchUserProfile(): Result<UserProfile> = withContext(Dispatchers.IO) {
        val id = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        try {
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/profiles?id=eq.$id&select=full_name,age,phone,address,gender")
                    .get()
                    .apply { headers.forEach { (k, v) -> header(k, v) } }
                    .build()
            }
            response.use { resp ->
                val body = resp.body?.string() ?: ""
                if (!resp.isSuccessful) return@withContext Result.failure(Exception(parseErrorMessage(body)))
                val array = json.parseToJsonElement(body).jsonArray
                if (array.isEmpty()) return@withContext Result.success(UserProfile())
                val obj = array[0].jsonObject
                return@withContext Result.success(UserProfile(
                    fullName  = obj["full_name"]?.jsonPrimitive?.contentOrNull ?: "",
                    age       = obj["age"]?.jsonPrimitive?.contentOrNull ?: "",
                    phone     = obj["phone"]?.jsonPrimitive?.contentOrNull ?: "",
                    address   = obj["address"]?.jsonPrimitive?.contentOrNull ?: "",
                    gender    = obj["gender"]?.jsonPrimitive?.contentOrNull ?: ""
                ))
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    suspend fun updateProfile(profile: UserProfile): Result<Unit> = withContext(Dispatchers.IO) {
        val id = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        try {
            val bodyJson = buildJsonObject {
                put("full_name", profile.fullName)
                put("age", profile.age)
                put("phone", profile.phone)
                put("address", profile.address)
                put("gender", profile.gender)
            }.toString()
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/profiles?id=eq.$id")
                    .patch(bodyJson.toRequestBody(mediaType))
                    .apply { headers.forEach { (k, v) -> header(k, v) } }
                    .header("Prefer", "return=minimal")
                    .build()
            }
            response.use { resp ->
                val body = resp.body?.string() ?: ""
                if (!resp.isSuccessful) return@withContext Result.failure(Exception(parseErrorMessage(body)))
                // Update cached name
                userName = profile.fullName
                return@withContext Result.success(Unit)
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private fun parseErrorMessage(jsonStr: String): String {
        android.util.Log.e("SupabaseService", "Server error response: $jsonStr")
        return try {
            val element = Json.parseToJsonElement(jsonStr)
            val obj = element.jsonObject
            obj["error_description"]?.jsonPrimitive?.content 
                ?: obj["msg"]?.jsonPrimitive?.content 
                ?: obj["message"]?.jsonPrimitive?.content 
                ?: obj["error"]?.jsonPrimitive?.content 
                ?: "Server Error: $jsonStr"
        } catch (e: Exception) {
            "Server Response: $jsonStr"
        }
    }

    // ── Razorpay Payment Helpers ─────────────────────────────────────────────

    /**
     * Step 1: Create a Razorpay order on the server.
     * Returns orderId, amount (in paise), currency, and the public Razorpay Key ID.
     */
    data class MobileOrderResponse(
        val orderId: String,
        val amount: Int,
        val currency: String,
        val trees: Int,
        val razorpayKeyId: String
    )

    suspend fun createMobileOrder(planName: String): Result<MobileOrderResponse> = withContext(Dispatchers.IO) {
        val currentUserId = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        val serverUrls = listOf(
            "https://greenlegacy.in/api/mobile-order",
            "http://localhost:3000/api/mobile-order",
            "http://127.0.0.1:3000/api/mobile-order",
            "http://10.68.224.146:3000/api/mobile-order",
            "http://10.0.2.2:3000/api/mobile-order",
            "http://192.168.1.10:3000/api/mobile-order"
        )

        val payload = buildJsonObject {
            put("planName", planName)
            put("userId", currentUserId)
        }.toString()

        val mediaType = "application/json; charset=utf-8".toMediaType()

        for (url in serverUrls) {
            try {
                val request = Request.Builder()
                    .url(url)
                    .post(payload.toRequestBody(mediaType))
                    .build()

                client.newCall(request).execute().use { response ->
                    val bodyStr = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        val obj = json.parseToJsonElement(bodyStr).jsonObject
                        val orderId = obj["orderId"]?.jsonPrimitive?.content ?: ""
                        val amount = obj["amount"]?.jsonPrimitive?.int ?: 0
                        val currency = obj["currency"]?.jsonPrimitive?.content ?: "INR"
                        val trees = obj["trees"]?.jsonPrimitive?.int ?: 1
                        val keyId = obj["razorpayKeyId"]?.jsonPrimitive?.content ?: ""
                        if (orderId.isNotEmpty()) {
                            return@withContext Result.success(
                                MobileOrderResponse(orderId, amount, currency, trees, keyId)
                            )
                        }
                    }
                }
            } catch (e: Exception) {
                android.util.Log.w("SupabaseService", "createMobileOrder failed for $url: ${e.message}")
            }
        }
        return@withContext Result.failure(Exception("Could not reach payment server. Check your connection."))
    }

    /**
     * Step 2: After Razorpay payment success, verify the signature and record the order.
     * This calls /api/mobile-payment which verifies HMAC-SHA256 signature, saves to DB,
     * sends email receipt, and fires Telegram/admin alerts.
     */
    suspend fun verifyMobilePayment(
        razorpayPaymentId: String,
        razorpayOrderId: String,
        razorpaySignature: String,
        planName: String,
        occasion: String,
        amountPaid: Double,
        isGift: Boolean,
        recipientName: String,
        recipientEmail: String,
        giftMessage: String,
        location: String = "GKVK Campus",
        coordinates: String = "12.9716° N, 77.5946° E"
    ): Result<String> = withContext(Dispatchers.IO) {
        val currentUserId = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        val treesCount = if (planName == "Legacy") 3 else 1

        val payload = buildJsonObject {
            put("userId", currentUserId)
            put("stewardName", userName ?: "Steward")
            put("userEmail", userEmail ?: "")
            put("trees", treesCount)
            put("planName", planName)
            put("occasion", occasion)
            put("amountPaid", amountPaid)
            put("paymentId", razorpayPaymentId)
            put("orderId", razorpayOrderId)
            put("signature", razorpaySignature)
            put("orderKey", razorpayOrderId)
            put("isGift", isGift)
            put("recipientName", if (isGift) recipientName else (userName ?: "Myself"))
            put("recipientEmail", recipientEmail)
            put("giftMessage", giftMessage)
            put("location", location)
            put("coordinates", coordinates)
        }.toString()

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val serverUrls = listOf(
            "https://greenlegacy.in/api/mobile-payment",
            "http://localhost:3000/api/mobile-payment",
            "http://127.0.0.1:3000/api/mobile-payment",
            "http://10.68.224.146:3000/api/mobile-payment",
            "http://10.0.2.2:3000/api/mobile-payment",
            "http://192.168.1.10:3000/api/mobile-payment"
        )

        for (url in serverUrls) {
            try {
                val request = Request.Builder()
                    .url(url)
                    .post(payload.toRequestBody(mediaType))
                    .build()

                client.newCall(request).execute().use { response ->
                    val bodyStr = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        val obj = json.parseToJsonElement(bodyStr).jsonObject
                        val success = obj["success"]?.jsonPrimitive?.booleanOrNull ?: false
                        val dbOrderId = obj["orderId"]?.jsonPrimitive?.content ?: ""
                        if (success) {
                            // Also update profile tree count in cache
                            try {
                                val currentCount = fetchProfileTreesPlanted(currentUserId)
                                updateProfileTreesPlanted(currentUserId, currentCount + treesCount)
                            } catch (e: Exception) {
                                android.util.Log.w("SupabaseService", "Profile tree count update failed: ${e.message}")
                            }
                            return@withContext Result.success(dbOrderId)
                        } else {
                            val errMsg = obj["error"]?.jsonPrimitive?.content ?: "Payment verification failed"
                            return@withContext Result.failure(Exception(errMsg))
                        }
                    }
                }
            } catch (e: Exception) {
                android.util.Log.w("SupabaseService", "verifyMobilePayment failed for $url: ${e.message}")
            }
        }
        return@withContext Result.failure(Exception("Could not verify payment. Please contact support."))
    }
}

