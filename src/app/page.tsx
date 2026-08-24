import Link from 'next/link'
import { Stethoscope, Calendar, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6">
        <Stethoscope className="text-white" size={28} />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-3">CareLoop</h1>
      <p className="text-slate-500 max-w-md mb-8">
        Book appointments, get AI-powered visit summaries, and stay on top of your care — all in one place.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          Get Started
        </Link>
        <Link href="/login" className="border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors">
          Log In
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-8 mt-16 text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-2"><Calendar size={20} /> Easy booking</div>
        <div className="flex flex-col items-center gap-2"><Stethoscope size={20} /> AI triage</div>
        <div className="flex flex-col items-center gap-2"><ShieldCheck size={20} /> Secure & reliable</div>
      </div>
    </div>
  )
}