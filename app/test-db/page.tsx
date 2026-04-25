'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDatabase() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function auditFullSchema() {
      try {
        const auditResults = []

        // 1. Audit Profiles
        const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1)
        auditResults.push({
          table: 'profiles',
          exists: !pError,
          columns: pData && pData.length > 0 ? Object.keys(pData[0]) : [],
          error: pError?.message,
          required: ['id', 'full_name', 'phone', 'address', 'trees_planted', 'stripe_customer_id']
        })

        // 2. Audit Planting Orders
        const { data: oData, error: oError } = await supabase.from('planting_orders').select('*').limit(1)
        auditResults.push({
          table: 'planting_orders',
          exists: !oError,
          columns: oData && oData.length > 0 ? Object.keys(oData[0]) : [],
          error: oError?.message,
          required: ['id', 'user_id', 'steward_name', 'trees', 'plan_name', 'amount_paid', 'payment_id', 'order_key', 'is_csr', 'company_name', 'gst_number', 'status']
        })

        // 3. Audit Site Products
        const { data: prData, error: prError } = await supabase.from('site_products').select('*').limit(1)
        auditResults.push({
          table: 'site_products',
          exists: !prError,
          columns: prData && prData.length > 0 ? Object.keys(prData[0]) : [],
          error: prError?.message,
          required: ['id', 'name', 'price_in_cents', 'trees']
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
            🛡️ Database Stewardship Audit
          </h1>
          <p className="text-[#c2caaf] text-sm opacity-60 mb-10">Verifying structural integrity for production-grade environmental assets.</p>
          
          <div className="space-y-12">
            {reports.map((report) => (
              <div key={report.table} className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#424935]/20 pb-4">
                  <h2 className="text-2xl font-bold font-['Noto_Serif']">{report.table}</h2>
                  {report.exists ? (
                    <span className="bg-green-500/10 text-green-500 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Operational</span>
                  ) : (
                    <span className="bg-red-500/10 text-red-500 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Missing or Error</span>
                  )}
                </div>

                {report.error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-500 font-mono">
                    {report.error}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {report.required.map((req: string) => {
                    const isFound = report.columns.includes(req)
                    return (
                      <div 
                        key={req} 
                        className={`p-4 rounded-2xl border transition-all ${isFound ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/40 bg-red-500/10 animate-pulse'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-tighter ${isFound ? 'text-green-500' : 'text-red-500'}`}>
                            {isFound ? 'Verified' : 'Missing'}
                          </span>
                          <span className="material-symbols-outlined text-sm">
                            {isFound ? 'check_circle' : 'error'}
                          </span>
                        </div>
                        <p className={`text-sm font-bold font-mono ${isFound ? 'text-[#e3e3db]' : 'text-red-500'}`}>{req}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-[#424935]/20">
            <h3 className="font-bold text-[#b2f432] mb-4">💡 Resolver Instructions</h3>
            <p className="text-sm text-[#c2caaf] leading-relaxed mb-6">
              If columns are highlighted in <span className="text-red-500 font-bold underline">RED</span>, 
              the payment logic will fail to sync even if money was debited. 
              The server will crash before redirecting you to the dashboard.
            </p>
            <div className="bg-[#121410] p-6 rounded-2xl border border-[#424935]/20">
              <p className="text-xs font-mono text-[#c2caaf]/60 mb-4">-- Run this to fix ALL structural issues at once:</p>
              <pre className="text-[10px] text-[#b2f432]/80 leading-relaxed overflow-x-auto">
{`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE planting_orders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE planting_orders ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE planting_orders ADD COLUMN IF NOT EXISTS is_csr BOOLEAN DEFAULT FALSE;
ALTER TABLE planting_orders ADD COLUMN IF NOT EXISTS order_key TEXT;
ALTER TABLE planting_orders ADD COLUMN IF NOT EXISTS amount_paid NUMERIC;
NOTIFY pgrst, 'reload schema';`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}