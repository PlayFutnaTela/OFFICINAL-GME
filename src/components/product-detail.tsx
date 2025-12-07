"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MessageCircle, MapPin, ArrowLeft, Home, AcUnit, Waves, Utensils } from 'lucide-react'
import OpportunityTimeline from '@/components/opportunity-timeline'
import Link from 'next/link'

type Item = {
  id: string
  title: string
  subtitle?: string
  description: string
  price?: number
  value?: number | string
  category: string
  status: string
  tags?: string[]
  stock?: number
  images?: string[]
  photos?: string[]
  location?: string
  created_at: string
}

type Props = {
  item: Item
  isProduct: boolean
}

export default function ProductDetail({ item, isProduct }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = isProduct ? (item.images || []) : (item.photos || [])
  const price = isProduct ? item.price : Number(item.value)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleWhatsApp = () => {
    const message = `Olá! Tenho interesse no ${isProduct ? 'produto' : 'oportunidade'}: ${item.title}. ${item.subtitle ? `(${item.subtitle})` : ''} Poderia me fornecer mais informações?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/5511981442518?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  // Parse description to extract features
  const features = item.description
    ? item.description.split('\n').filter(f => f.trim().length > 0)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2 text-blue-600">
              <span className="text-3xl">💎</span>
              <span className="text-2xl font-bold tracking-wider">GEREZIM</span>
            </div>
            <Link href="/oportunidades">
              <button className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Image Section */}
          <section className="mb-12">
            <div className="relative rounded-lg overflow-hidden h-[60vh] group">
              {images.length > 0 ? (
                <>
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={images[currentImageIndex]}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <span className="bg-white/90 text-slate-900 text-sm font-semibold px-4 py-1 rounded-full shadow">
                      {item.category.toUpperCase()}
                    </span>
                    <span className="bg-yellow-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow">
                      {isProduct ? 'Produto' : 'Oportunidade'}
                    </span>
                  </div>

                  {/* Navigation Buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      {/* Dots Navigation */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`block w-2.5 h-2.5 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-slate-500">Sem imagem disponível</span>
                </div>
              )}
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                {/* Title Section */}
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h1>
                {item.subtitle && (
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-6">
                    <Home className="h-5 w-5" />
                    <span className="text-lg">{item.subtitle}</span>
                  </div>
                )}

                {/* Price Section */}
                <div className="border-y border-slate-200 dark:border-slate-700 my-8 py-6">
                  <p className="text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
                    Valor da Oportunidade
                  </p>
                  <p className="text-5xl font-bold text-yellow-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-4 mb-8">
                  <span className="inline-flex items-center bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-sm font-medium px-4 py-1.5 rounded-full">
                    Status: {item.status === 'em_negociacao' ? 'Em negociação' :
                      item.status === 'active' ? 'Ativo' :
                        item.status.charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                  </span>
                  {isProduct && item.stock !== undefined && (
                    <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full">
                      Estoque: {item.stock}
                    </span>
                  )}
                </div>

                {/* Description Section */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-3 mb-6 text-slate-900 dark:text-white">
                      Descrição
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                      {features.slice(0, 14).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                          <span>{feature.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional Info Section - conditionally rendered */}
                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <h2 className="text-3xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-3 mb-6 text-slate-900 dark:text-white">
                        Características
                      </h2>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-slate-700 dark:text-slate-300">
                        {item.tags.map((tag, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                            <span>{tag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-8">
                {/* Location/Info Card */}
                {item.location && (
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-6 flex items-center text-slate-900 dark:text-white">
                      <MapPin className="text-blue-600 mr-3 h-6 w-6" />
                      Localização
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">{item.location}</p>
                  </div>
                )}

                {/* CTA Card */}
                <div className="bg-blue-600 p-8 rounded-lg shadow-lg text-white">
                  <h3 className="text-2xl font-semibold mb-4">
                    Interessado nesta Oportunidade?
                  </h3>
                  <p className="mb-6 opacity-90">
                    Entre em contato com nossos especialistas para saber mais detalhes e agendar uma visita.
                  </p>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 text-lg"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Saiba Mais</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="mt-12">
            <OpportunityTimeline opportunityId={item.id} />
          </div>
        </div>
      </main>
    </div>
  )
}