'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

type Category = {
  id: string
  name: string
  icon: string
}

export default function SobreNosPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Fetch categories from the database or define them here
    const defaultCategories = [
      { id: '1', name: 'Carros de Luxo', icon: '/icones-categorias/carros.png' },
      { id: '2', name: 'Imóveis', icon: '/icones-categorias/imoveis.png' },
      { id: '3', name: 'Empresas', icon: '/icones-categorias/empresas.png' },
      { id: '4', name: 'Cartas Contempladas', icon: '/icones-categorias/Cartascontempladas.png' },
      { id: '5', name: 'Eletrônicos', icon: '/icones-categorias/eletronicos.png' },
      { id: '6', name: 'Embarcações', icon: '/icones-categorias/embarcacoes.png' },
      { id: '7', name: 'Indústrias', icon: '/icones-categorias/industrias.png' },
      { id: '8', name: 'Premium', icon: '/icones-categorias/premium.png' },
      { id: '9', name: 'Aeronaves', icon: '/icones-categorias/aeronaves.png' },
    ]
    setCategories(defaultCategories)
  }, [])

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 py-4 px-4 sm:px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4 sm:space-x-12">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Gerezim logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-lg sm:text-xl font-bold tracking-wider text-yellow-500">GEREZIM</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-xs sm:text-sm font-medium tracking-widest text-gray-600 dark:text-gray-400">
              <Link href="#" className="hover:text-yellow-500 transition-colors">SERVIÇOS</Link>
              <span>/</span>
              <Link href="#" className="hover:text-yellow-500 transition-colors">EXCLUSIVOS</Link>
              <span>/</span>
              <Link href="/sobrenos" className="hover:text-yellow-500 transition-colors">SOBRE NÓS</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm">
            <Link href="/oportunidades" className="bg-yellow-500 text-white px-4 py-2 sm:px-6 uppercase text-xs font-bold tracking-widest hover:bg-yellow-600 transition-colors">
              Explorar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[600px] text-white flex flex-col justify-center items-center text-center overflow-hidden">
        <Image
          alt="Abstract world map with a golden globe"
          src="https://i.postimg.cc/VLJMGvrW/um-jato-privado-fotografado-de-tr-s-decolando.jpg"
          fill
          className="absolute inset-0 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-widest uppercase">Conectamos você ao extraordinário.</h1>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl tracking-widest uppercase">Para quem exige mais do que o mercado oferece.</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-12 sm:py-24">
        {/* Section 1 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 sm:mb-24">
          <div>
            <h2 className="text-2xl sm:text-4xl font-light text-gray-800 dark:text-gray-200">EXCELÊNCIA COMO PADRÃO</h2>
            <div className="w-12 sm:w-16 h-1 bg-yellow-500 my-4 sm:my-6"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              A Gerezim nasceu com o compromisso de elevar a experiência em negociações de alto valor.
Nós atuamos como um elo confiável entre pessoas, propriedades e oportunidades que exigem discrição, precisão e profissionalismo absoluto.

Nosso trabalho é entregar um padrão que o mercado não oferece — mas que você merece.
Processos claros, atendimento individualizado e resultados consistentes guiam cada movimento da nossa equipe.
Excelência não é um objetivo. É o nosso ponto de partida.
            </p>
            <button className="mt-6 sm:mt-8 bg-yellow-500 text-white px-6 sm:px-8 py-2 sm:py-3 uppercase text-xs font-bold tracking-widest hover:bg-yellow-600 transition-colors">
              EXCELÊNCIA
            </button>
          </div>
          <div className="relative">
            <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 w-12 sm:w-16 h-1 bg-yellow-500"></div>
            <div className="absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 w-12 sm:w-16 h-1 bg-yellow-500"></div>
            <Image
              alt="Um hall de hotel 5 estrelas, com luz natural, mármore e sofisticação minimalista."
              src="https://i.postimg.cc/dQdyMpQN/um_hall_de_hotel_5_estrelas_com.jpg"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Section 2 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 sm:mb-24">
          <div className="relative order-2 md:order-1">
            <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 w-12 sm:w-16 h-1 bg-yellow-500"></div>
            <div className="absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 w-12 sm:w-16 h-1 bg-yellow-500"></div>
            <Image
              alt="Uma empresa moderna vista de cima ou torres corporativas com luz suave"
              src="https://i.postimg.cc/bwYDtv0J/uma_empresa_moderna_vista_de_cima_ou.jpg"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl sm:text-4xl font-light text-gray-800 dark:text-gray-200">NEGÓCIOS QUE TRANSFORMAM</h2>
            <div className="w-12 sm:w-16 h-1 bg-yellow-500 my-4 sm:my-6"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Trabalhamos para conectar pessoas a decisões que mudam o jogo.
Seja uma empresa, uma mansão, uma fazenda ou uma grande oportunidade estratégica — analisamos cada detalhe para garantir segurança e valorização real.

Nossa metodologia combina inteligência de mercado, curadoria criteriosa e uma rede de relacionamentos capaz de abrir portas que outros nem sabem que existem.
Cada negociação é tratada como única, porque cada cliente tem um propósito singular.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 sm:mb-32">
          <div>
            <h2 className="text-2xl sm:text-4xl font-light text-gray-800 dark:text-gray-200">DISCRIÇÃO, SEGURANÇA E CONFIANÇA</h2>
            <div className="w-12 sm:w-16 h-1 bg-yellow-500 my-4 sm:my-6"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Em operações de alto valor, confiança não é um diferencial — é uma exigência.
Por isso oferecemos processos discretos, acompanhamento dedicado e total transparência em cada etapa.

Somos responsáveis por proteger informações, interesses e objetivos, garantindo que você tome decisões com clareza, segurança e respeito absoluto à sua privacidade.
Afinal, grandes negociações exigem mais do que habilidade: exigem credibilidade.
            </p>
            <button className="mt-6 sm:mt-8 bg-yellow-500 text-white px-6 sm:px-8 py-2 sm:py-3 uppercase text-xs font-bold tracking-widest hover:bg-yellow-600 transition-colors">
              SEGURANÇA
            </button>
          </div>
          <div className="relative">
            <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 w-12 sm:w-16 h-1 bg-yellow-500"></div>
            <div className="absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 w-12 sm:w-16 h-1 bg-yellow-500"></div>
            <Image
              alt="Um close elegante de aperto de mãos em ambiente corporativo de luxo"
              src="https://i.postimg.cc/YC2GWSN2/um_close_elegante_de_aperto_de_m_os.jpg"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Advantages Section */}
        <section className="text-center mb-16 sm:mb-32">
          <h2 className="text-2xl sm:text-4xl font-light tracking-wider uppercase mb-2 sm:mb-4 text-gray-800 dark:text-gray-200">O que podemos oferecer</h2>
          <div className="w-12 sm:w-16 h-1 bg-yellow-500 my-4 sm:my-6 mx-auto"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-5xl mx-auto mt-12 sm:mt-16">
            {categories.map((category) => (
              <div key={category.id} className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-8 flex flex-col items-center justify-center aspect-square border border-white/50 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={60}
                  height={60}
                  className="mb-2 sm:mb-4 object-contain"
                />
                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{category.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Gerezim Logo"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-12 shadow-2xl relative">
            <div className="absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-8 sm:w-16 h-1 bg-yellow-500"></div>
            <h2 className="text-2xl sm:text-4xl font-light text-center text-gray-800 dark:text-gray-200 mb-6 sm:mb-8">
              COMO PODEMOS<br />AJUDÁ-LO?
            </h2>
            <form className="space-y-4 sm:space-y-6">
              <div>
                <label className="sr-only" htmlFor="name">Nome</label>
                <input
                  className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-yellow-500 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                  id="name"
                  name="name"
                  placeholder="Nome"
                  type="text"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="phone">Telefone</label>
                <input
                  className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-yellow-500 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                  id="phone"
                  name="phone"
                  placeholder="Telefone"
                  type="tel"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="email">E-mail</label>
                <input
                  className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-yellow-500 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                  id="email"
                  name="email"
                  placeholder="E-mail"
                  type="email"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="message">Mensagem</label>
                <textarea
                  className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-yellow-500 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                  id="message"
                  name="message"
                  placeholder="Mensagem"
                  rows={3}
                ></textarea>
              </div>
              <div className="pt-2 sm:pt-4">
                <button
                  className="w-full bg-yellow-500 text-white py-2 sm:py-3 uppercase text-xs font-bold tracking-widest hover:bg-yellow-600 transition-colors"
                  type="submit"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-12 sm:py-16 px-4 sm:px-8 md:px-16 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-xs sm:text-sm mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span>+55 11 98144-2518</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span>info@gerezim.club</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span>São Paulo, Brasil</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <p>© 2024 por Gerezim. Todos os direitos reservados.</p>
              <div className="flex space-x-4">
                <Link href="#" className="hover:text-yellow-500 transition-colors">FB</Link>
                <Link href="#" className="hover:text-yellow-500 transition-colors">IG</Link>
                <Link href="#" className="hover:text-yellow-500 transition-colors">LI</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
