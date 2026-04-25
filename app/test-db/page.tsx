'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDatabase() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<string | null>(null)
  const [isTestLoading, setIsTestLoading] = useState(false)

  useEffect(() => {
    async function auditFullSchema() {
      try {
        const auditResults = []

        // Helper to check for a column by attempting to select it
        const checkColumn = async (table: string, column: string) => {
          const { error } = await supabase.from(table).select(column).limit(0)
          return !error
        }

        // 1. Audit Profiles
        const profileCols = ['id', 'full_name', 'phone', 'address', 'trees_planted', 'stripe_customer_id']
        const pStatus = await Promise.all(profileCols.map(c => checkColumn('profiles', c)))
        auditResults.push({
          table: 'profiles',
          exists: true,
          columns: profileCols.filter((_, i) => pStatus[i]),
          required: profileCols
        })

        // 2. Audit Planting Orders
        const orderCols = ['id', 'user_id', 'steward_name', 'trees', 'plan_name', 'amount_paid', 'payment_id', 'order_key', 'is_csr', 'company_name', 'gst_number', 'status']
        const oStatus = await Promise.all(orderCols.map(c => checkColumn('planting_orders', c)))
        auditResults.push({
          table: 'planting_orders',
          exists: true,
          columns: orderCols.filter((_, i) => oStatus[i]),
          required: orderCols
        })

        setReports(auditResults)

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    auditFullSchema()
  }, [])

  const testEmailConfig = async () => {
    setIsTestLoading(true)
    setEmailStatus("Attempting to connect to mail server...")
    try {
      const response = await fetch('/api/test-email', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setEmailStatus("✅ SUCCESS! Check your inbox (and spam folder) for the test mail.")
      } else {
        setEmailStatus(`❌ ERROR: ${result.error || 'Unknown failure'}. Check your Vercel Environment Variables.`)
      }
    } catch (err: any) {
      setEmailStatus(`❌ CRITICAL ERROR: ${err.message}`)
    } finally {
      setIsTestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121410]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#b2f432]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121410] p-8 text-[#e3e3db] font-['Manrope']">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-[#1a1c18] rounded-3xl p-10 border border-[#424935]/20 shadow-2xl">
          <h1 className="text-4xl font-bold text-[#b2f432] mb-2 font-['Noto_Serif'] italic">
            🛡️ Deep Schema Audit (v2.1)
          </h1>
          
          <div className="mt-10 space-y-8">
            {/* Email Diagnostic Block */}
            <div className="bg-[#b2f432]/5 border border-[#b2f432]/20 p-8 rounded-2xl">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[#b2f432]">mail</span>
                 Email System Diagnostic
               </h2>
               <p className="text-sm text-[#c2caaf] mb-4">Verify SMTP credentials in Vercel.</p>
               <button 
                 onClick={testEmailConfig}
                 disabled={isTestLoading}
                 className="bg-[#b2f432] text-[#233600] px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 {isTestLoading ? 'Sending...' : 'Send Diagnostic Test Email'}
               </button>
               {emailStatus && (
                 <div className={`mt-6 p-4 rounded-xl text-xs font-mono border ${emailStatus.includes('SUCCESS') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                   {emailStatus}
                 </div>
               )}
            </div>

            {reports.map((report) => (
              <div key={report.table} className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#424935]/20 pb-4">
                  <h2 className="text-2xl font-bold">{report.table}</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {report.required.map((req: string) => {
                    const isFound = report.columns.includes(req)
                    return (
                      <div key={req} className={`p-4 rounded-xl border ${isFound ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/40 bg-red-500/10 animate-pulse'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[8px] font-black uppercase ${isFound ? 'text-green-500' : 'text-red-500'}`}>{isFound ? 'Verified' : 'Missing'}</span>
                          <span className="material-symbols-outlined text-[12px]">{isFound ? 'check' : 'error'}</span>
                        </div>
                        <p className="font-mono text-sm">{req}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-[#424935]/20">
            <h3 className="font-bold text-[#b2f432] mb-4 uppercase tracking-[0.2em] text-xs">Final Resolver Code</h3>
            <div className="bg-[#121410] p-6 rounded-2xl border border-[#424935]/20">
              <pre className="text-[10px] text-[#b2f432]/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trees_planted INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

CREATE TABLE IF NOT EXISTS planting_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  steward_name TEXT,
  trees INTEGER,
  plan_name TEXT,
  occasion TEXT,
  status TEXT DEFAULT 'Pending',
  amount_paid NUMERIC,
  payment_id TEXT,
  order_key TEXT,
  is_csr BOOLEAN DEFAULT FALSE,
  company_name TEXT,
  gst_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

GRANT ALL ON TABLE planting_orders TO authenticated, anon, service_role;
GRANT ALL ON TABLE profiles TO authenticated, anon, service_role;
NOTIFY pgrst, 'reload schema';`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}