'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDatabase() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function auditProfileSchema() {
      try {
        // Try to fetch one profile to see what columns come back
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)

        if (error) throw error

        if (data && data.length > 0) {
          setProfiles(data)
          setColumns(Object.keys(data[0]))
        } else {
          // If no data, we can't easily see columns via select *, 
          // so we alert that the table might be empty but connected
          setProfiles([])
          setError("Profiles table is connected but empty. Please create a user first.")
        }

      } catch (err: any) {
        setError(err.message)
        console.error('Schema Audit Error:', err)
      } finally {
        setLoading(false)
      }
    }

    auditProfileSchema()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121410]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#b2f432]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121410] p-8 text-[#e3e3db] font-['Manrope']">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#1a1c18] rounded-3xl p-8 border border-[#424935]/20 shadow-2xl">
          <h1 className="text-4xl font-bold text-[#b2f432] mb-4 font-['Noto_Serif']">
            🛡️ Schema Integrity Audit
          </h1>
          
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-red-500 mb-2">❌ Audit Error</h2>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-green-500 mb-2">✅ API Connected</h2>
                <p className="text-sm opacity-80">The system can successfully reach the 'profiles' registry.</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#c2caaf] mb-4">Detected Columns in 'profiles'</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {columns.map(col => (
                    <div 
                      key={col} 
                      className={`px-4 py-3 rounded-xl border text-sm font-mono flex items-center justify-between ${col === 'address' ? 'border-[#b2f432] bg-[#b2f432]/10 text-[#b2f432]' : 'border-[#424935]/20 bg-[#121410]'}`}
                    >
                      <span>{col}</span>
                      {col === 'address' && <span className="text-[10px] uppercase font-bold">Live</span>}
                    </div>
                  ))}
                </div>
              </div>

              {!columns.includes('address') && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl">
                  <h3 className="font-bold text-orange-500 mb-2">⚠️ 'address' Column Not Found</h3>
                  <p className="text-sm opacity-80">
                    If you just added it in the SQL Editor, the API cache is stale. 
                    Run <code>NOTIFY pgrst, 'reload schema';</code> in your SQL Editor now.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}