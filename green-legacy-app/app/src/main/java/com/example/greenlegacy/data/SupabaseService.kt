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

    suspend fun fetchPlantedTrees(): Result<List<PlantedTree>> = withContext(Dispatchers.IO) {
        val currentUserId = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        try {
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/trees?user_id=eq.$currentUserId&select=*&order=created_at.desc")
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
                    PlantedTree(
                        id = obj["id"]?.jsonPrimitive?.content ?: "GL-UNKNOWN",
                        recipient = obj["recipient"]?.jsonPrimitive?.content ?: "",
                        occasion = obj["occasion"]?.jsonPrimitive?.content ?: "",
                        species = obj["species"]?.jsonPrimitive?.content ?: "",
                        campus = obj["campus"]?.jsonPrimitive?.content ?: "",
                        date = obj["date"]?.jsonPrimitive?.content ?: "Today",
                        status = obj["status"]?.jsonPrimitive?.content ?: "Growing",
                        coordinates = obj["coordinates"]?.jsonPrimitive?.content ?: "12.9716° N, 77.5946° E"
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
        coordinates: String
    ): Result<PlantedTree> = withContext(Dispatchers.IO) {
        val currentUserId = userId ?: return@withContext Result.failure(Exception("Not logged in"))
        try {
            val randomId = "GL-${(10000..99999).random()}"
            val dateFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
            val formattedDate = dateFormat.format(Date())

            val treeBodyJson = buildJsonObject {
                put("id", randomId)
                put("user_id", currentUserId)
                put("recipient", recipient)
                put("occasion", occasion)
                put("campus", campus)
                put("species", species)
                put("coordinates", coordinates)
                put("status", "Growing")
                put("date", formattedDate)
            }.toString()

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val response = executeAuthenticatedCall { headers ->
                Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/trees")
                    .post(treeBodyJson.toRequestBody(mediaType))
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

                val list = json.parseToJsonElement(bodyStr).jsonArray
                if (list.isEmpty()) {
                    return@withContext Result.failure(Exception("No tree returned on creation"))
                }
                val obj = list[0].jsonObject

                val newTree = PlantedTree(
                    id = obj["id"]?.jsonPrimitive?.content ?: randomId,
                    recipient = obj["recipient"]?.jsonPrimitive?.content ?: recipient,
                    occasion = obj["occasion"]?.jsonPrimitive?.content ?: occasion,
                    species = obj["species"]?.jsonPrimitive?.content ?: species,
                    campus = obj["campus"]?.jsonPrimitive?.content ?: campus,
                    date = obj["date"]?.jsonPrimitive?.content ?: formattedDate,
                    status = obj["status"]?.jsonPrimitive?.content ?: "Growing",
                    coordinates = obj["coordinates"]?.jsonPrimitive?.content ?: coordinates
                )

                return@withContext Result.success(newTree)
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
}

