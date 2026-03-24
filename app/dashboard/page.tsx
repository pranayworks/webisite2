'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">
                🌳 Welcome to Your Dashboard!
              </h1>
              <p className="text-gray-600">
                Email: {user.email}
              </p>
              <p className="text-gray-600">
                User ID: {user.id}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            ✅ Authentication is Working!
          </h2>
          <p className="text-green-700">
            You successfully logged in. Your user account is connected to Supabase!
          </p>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Coming Soon:
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>✨ View your planted trees</li>
            <li>🎁 Track your green points</li>
            <li>📄 Download certificates</li>
            <li>📊 See your environmental impact</li>
            <li>🌱 Plant more trees</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
