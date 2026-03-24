'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface College {
  id: string
  name: string
  location: string
  city: string
  state: string
  total_trees_planted: number
}

export default function TestDatabase() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchColleges() {
      try {
        const { data, error } = await supabase
          .from('colleges')
          .select('*')
          .order('name')

        if (error) throw error

        setColleges(data || [])
      } catch (err: any) {
        setError(err.message)
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchColleges()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading colleges...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Connection Error</h2>
          <p className="text-gray-700 mb-4">Failed to connect to Supabase:</p>
          <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">{error}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-l-8 border-green-500">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            🎉 Supabase Connected Successfully!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Your Green Legacy backend is live and ready!
          </p>
          <div className="flex gap-4">
            <div className="bg-green-100 px-6 py-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Colleges</p>
              <p className="text-3xl font-bold text-green-700">{colleges.length}</p>
            </div>
            <div className="bg-blue-100 px-6 py-3 rounded-lg">
              <p className="text-sm text-gray-600">Database Status</p>
              <p className="text-xl font-semibold text-blue-700">✅ Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            🎓 Partner Agriculture Colleges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colleges.map((college) => (
              <div 
                key={college.id} 
                className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {college.name}
                </h3>
                <p className="text-gray-600 mb-1">📍 {college.location}</p>
                <p className="text-gray-600 mb-3">🏙️ {college.city}, {college.state}</p>
                <p className="text-green-600 font-semibold">
                  🌳 {college.total_trees_planted} trees planted
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}