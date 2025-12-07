"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MessageCircle, MapPin, ArrowLeft, Home, Waves, Utensils, X, ZoomIn, Share2 } from 'lucide-react'
import OpportunityTimeline from '@/components/opportunity-timeline'
import Link from 'next/link'
import Image from 'next/image'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showShareMenu, setShowShareMenu] = useState(false)

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

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = `Confira esta ${isProduct ? 'produto' : 'oportunidade'}: ${item.title}`
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'instagram':
        // Instagram não tem share direto via URL, então copiamos para clipboard
        navigator.clipboard.writeText(url)
        alert('Link copiado! Compartilhe nos stories ou DM do Instagram')
        break
    }
    setShowShareMenu(false)
  }

  // Parse description to extract features
  const features = item.description
    ? item.description.split('\n').filter(f => f.trim().length > 0)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #eab308;
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ca8a04;
        }
      `}</style>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Image
                src="/logo.png"
                alt="Gerezim logo"
                className="object-contain h-8 sm:h-10 w-auto"
                width={40}
                height={40}
              />
              <span className="text-lg sm:text-2xl font-bold tracking-wider text-yellow-500">GEREZIM</span>
            </div>
            <Link href="/oportunidades">
              <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
                <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Hero Image Section */}
          <section className="mb-8 sm:mb-12">
            <div className="relative rounded-lg overflow-hidden h-[40vh] sm:h-[60vh] group cursor-pointer" onClick={() => setIsModalOpen(true)}>
              {images.length > 0 ? (
                <>
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={images[currentImageIndex]}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Click to zoom hint */}
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center space-x-1 sm:space-x-2 bg-white/80 px-2 sm:px-4 py-1 sm:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3 sm:h-4 w-3 sm:w-4" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">Clique para ampliar</span>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:space-x-2">
                    <span className="bg-white/90 text-slate-900 text-xs sm:text-sm font-semibold px-2 sm:px-4 py-0.5 sm:py-1 rounded-full shadow">
                      {item.category.toUpperCase()}
                    </span>
                    <span className="bg-yellow-500 text-white text-xs sm:text-sm font-semibold px-2 sm:px-4 py-0.5 sm:py-1 rounded-full shadow">
                      {isProduct ? 'Produto' : 'Oportunidade'}
                    </span>
                  </div>

                  {/* Navigation Buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-4 sm:h-6 w-4 sm:w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-4 sm:h-6 w-4 sm:w-6" />
                      </button>

                      {/* Dots Navigation */}
                      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 lg:gap-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-lg shadow-lg">
                {/* Title Section */}
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h1>
                {item.subtitle && (
                  <div className="flex items-center space-x-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                    <Home className="h-4 sm:h-5 w-4 sm:w-5" />
                    <span>{item.subtitle}</span>
                  </div>
                )}

                {/* Price Section */}
                <div className="border-y border-slate-200 dark:border-slate-700 my-6 sm:my-8 py-4 sm:py-6">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
                    Valor da Oportunidade
                  </p>
                  <p className="text-3xl sm:text-5xl font-bold text-yellow-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
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
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3 mb-4 sm:mb-6 text-slate-900 dark:text-white">
                      Descrição
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                      {features.slice(0, 14).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                          <span className="leading-tight">{feature.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional Info Section - conditionally rendered */}
                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <h2 className="text-xl sm:text-3xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3 mb-4 sm:mb-6 text-slate-900 dark:text-white">
                        Características
                      </h2>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                        {item.tags.map((tag, index) => (
                          <li key={index} className="flex items-start gap-2 sm:gap-3">
                            <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                            <span className="leading-tight">{tag}</span>
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
              <div className="sticky top-16 sm:top-28 space-y-4 sm:space-y-8">
                {/* Location/Info Card */}
                {item.location && (
                  <div className="bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-lg shadow-lg">
                    <h3 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3 text-slate-900 dark:text-white">
                      <MapPin className="text-blue-600 h-5 sm:h-6 w-5 sm:w-6 flex-shrink-0" />
                      <span>Localização</span>
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">{item.location}</p>
                  </div>
                )}

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-yellow-500 via-yellow-400 to-amber-500 border border-white p-4 sm:p-8 rounded-lg shadow-lg shadow-yellow-500/50 text-white">
                  <h3 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4">
                    Interessado nesta Oportunidade?
                  </h3>
                  <p className="mb-4 sm:mb-6 text-sm sm:text-base opacity-90">
                    Entre em contato com nossos especialistas para saber mais detalhes e agendar uma visita.
                  </p>
                  <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
                    <button
                      onClick={handleWhatsApp}
                      className="flex-1 bg-white text-yellow-600 font-bold py-2 px-3 sm:px-4 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <MessageCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      <span>Saiba Mais</span>
                    </button>
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm relative"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Compartilhar</span>
                      
                      {/* Share Menu */}
                      {showShareMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg py-2 min-w-max z-10">
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full px-3 sm:px-4 py-2 text-green-600 hover:bg-green-50 font-medium flex items-center gap-2 text-sm"
                          >
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2 text-sm"
                          >
                            <span>Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare('instagram')}
                            className="w-full px-3 sm:px-4 py-2 text-pink-600 hover:bg-pink-50 font-medium flex items-center gap-2 text-sm"
                          >
                            <span>Instagram</span>
                          </button>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="mt-8 sm:mt-12">
            <OpportunityTimeline opportunityId={item.id} />
          </div>
        </div>
      </main>

      {/* Image Zoom Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => {
            setIsModalOpen(false)
            setZoom(1)
          }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsModalOpen(false)
              setZoom(1)
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[70]"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Image Container with Zoom */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-auto max-w-4xl max-h-[90vh] flex items-center justify-center">
              <img
                src={images[currentImageIndex]}
                alt={item.title}
                style={{ transform: `scale(${zoom})` }}
                className="transition-transform duration-200 cursor-zoom-in select-none"
              />
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <button
                onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                className="text-white hover:text-yellow-500 transition-colors"
              >
                <span className="text-2xl">−</span>
              </button>
              <span className="text-white font-semibold min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                className="text-white hover:text-yellow-500 transition-colors"
              >
                <span className="text-2xl">+</span>
              </button>
              <div className="w-px h-6 bg-white/20"></div>
              <button
                onClick={() => setZoom(1)}
                className="text-white hover:text-yellow-500 transition-colors text-sm font-medium"
              >
                Reset
              </button>
            </div>

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => {
                    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
                    setZoom(1)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-opacity"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => {
                    setCurrentImageIndex((prev) => (prev + 1) % images.length)
                    setZoom(1)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-opacity"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Image Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}