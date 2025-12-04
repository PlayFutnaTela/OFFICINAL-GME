import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Em Breve | Gerezim.Club',
  description: 'Um santuário exclusivo para negociações de alto valor.',
}

export default function EmBrevePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-navy-700 p-4 text-center">
      <div className="max-w-2xl space-y-8 animate-in fade-in zoom-in duration-1000">
        
        {/* Decorative Element */}
        <div className="flex justify-center mb-6">
          <div className="h-1 w-24 bg-gold-500 rounded-full" />
        </div>

        {/* Title */}
        <h1 className="font-playfair text-5xl md:text-7xl font-bold text-gold-500 tracking-tight">
          Em Breve
        </h1>

        {/* Subtitle */}
        <p className="font-playfair text-xl md:text-2xl text-navy-100 italic font-light">
          Um santuário exclusivo para negociações de alto valor.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="h-[1px] w-12 bg-gold-500/50" />
          <div className="h-2 w-2 bg-gold-500 rotate-45" />
          <div className="h-[1px] w-12 bg-gold-500/50" />
        </div>

        {/* Body Text */}
        <p className="text-navy-50/80 text-lg md:text-xl font-light max-w-lg mx-auto leading-relaxed">
          Estamos preparando um ambiente onde a excelência e a oportunidade se encontram.
          <br />
          <span className="block mt-4 font-medium text-gold-300">Aguarde.</span>
        </p>

      </div>
    </main>
  )
}
