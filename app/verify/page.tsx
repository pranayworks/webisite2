import Link from "next/link"

const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 'inherit' }}>
    {name}
  </span>
)

export default function VerifyLanding() {
  return (
    <div className="min-h-screen bg-[#121410] text-[#e3e3db] flex items-center justify-center p-8 font-['Manrope']">
      <div className="max-w-md text-center space-y-6">
        <div className="h-20 w-20 bg-[#b2f432]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#b2f432]/20">
           <MaterialIcon name="barcode_scanner" className="text-[#b2f432] text-5xl" />
        </div>
        <h1 className="font-['Noto_Serif'] text-3xl font-bold italic">Biological Registry</h1>
        <p className="text-[#c2caaf] leading-relaxed">
          Please scan the QR code provided on your printed certificate to access the official stewardship record.
        </p>
        <Link href="/" className="inline-block mt-8 text-[#b2f432] font-black uppercase tracking-[0.2em] text-xs hover:underline decoration-2 underline-offset-4">
           Back to Stewardship Core &rarr;
        </Link>
      </div>
    </div>
  )
}
