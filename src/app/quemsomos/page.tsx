import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Users, Target, Shield, Check, Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "Quem Somos | Gerezim",
    description: "Conheça o Gerezim - Plataforma de gestão de negócios com excelência e inovação",
};

export default function QuemSomosPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header/Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 md:px-20 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo-novo-gme.png"
                            alt="Gerezim Logo"
                            width={140}
                            height={40}
                            className="h-10 w-auto"
                        />
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-[#2B2B2B] hover:text-[#C8A882] transition-colors duration-300"
                    >
                        Acessar Plataforma
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 md:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        {/* Content */}
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-[#2B2B2B] uppercase mb-6">
                                Transformando a gestão de negócios
                            </h1>
                            <p className="text-base md:text-lg text-[#6B6B6B] leading-relaxed max-w-xl mb-8">
                                O Gerezim é uma plataforma completa de gestão empresarial que une tecnologia, 
                                inteligência e praticidade para impulsionar o crescimento do seu negócio.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 bg-[#C8A882] text-white px-8 py-4 text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity duration-300"
                            >
                                Começar agora
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Visual */}
                        <div className="relative h-[400px] md:h-[500px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1C3F3A] to-[#2B2B2B] rounded-sm">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Image
                                        src="/logo-novo-gme.png"
                                        alt="Gerezim"
                                        width={300}
                                        height={100}
                                        className="opacity-20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="py-24 md:py-32 px-6 md:px-20 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2B2B2B] uppercase text-center mb-16 tracking-tight">
                        Nossa essência
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-10 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                            <div className="mb-6">
                                <Target className="w-8 h-8 text-[#C8A882]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-medium text-[#2B2B2B] mb-4">
                                Nossa Missão
                            </h3>
                            <p className="text-base text-[#6B6B6B] leading-relaxed">
                                Simplificar a gestão empresarial através de tecnologia intuitiva, 
                                permitindo que empreendedores foquem no crescimento de seus negócios.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-10 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                            <div className="mb-6">
                                <Sparkles className="w-8 h-8 text-[#C8A882]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-medium text-[#2B2B2B] mb-4">
                                Nossa Visão
                            </h3>
                            <p className="text-base text-[#6B6B6B] leading-relaxed">
                                Ser a plataforma de gestão empresarial mais completa e acessível, 
                                reconhecida pela excelência e inovação constante.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-10 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                            <div className="mb-6">
                                <Shield className="w-8 h-8 text-[#C8A882]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-medium text-[#2B2B2B] mb-4">
                                Nossos Valores
                            </h3>
                            <p className="text-base text-[#6B6B6B] leading-relaxed">
                                Transparência, inovação, excelência no atendimento e compromisso 
                                com o sucesso de cada cliente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-24 md:py-32 px-6 md:px-20 bg-[#1C3F3A]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        {/* Content */}
                        <div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white uppercase mb-8 tracking-tight leading-tight">
                                O que oferecemos
                            </h2>
                            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8">
                                Uma solução completa para gestão empresarial, integrando todas as áreas 
                                do seu negócio em uma única plataforma intuitiva e poderosa.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <Check className="w-5 h-5 text-[#C8A882]" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium mb-1">Gestão de Oportunidades</h4>
                                        <p className="text-white/70 text-sm">
                                            Acompanhe todo o ciclo de vendas com pipeline visual e relatórios completos
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <Check className="w-5 h-5 text-[#C8A882]" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium mb-1">Controle de Tarefas</h4>
                                        <p className="text-white/70 text-sm">
                                            Organize e priorize atividades com sistema de gestão inteligente
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <Check className="w-5 h-5 text-[#C8A882]" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium mb-1">Dashboard Analítico</h4>
                                        <p className="text-white/70 text-sm">
                                            Visualize métricas e indicadores de desempenho em tempo real
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <Check className="w-5 h-5 text-[#C8A882]" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium mb-1">Gestão de Produtos</h4>
                                        <p className="text-white/70 text-sm">
                                            Controle completo do catálogo de produtos e serviços
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-sm">
                                <div className="text-4xl md:text-5xl font-light text-white mb-2">100%</div>
                                <div className="text-sm text-white/70 uppercase tracking-wider">Cloud</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-sm">
                                <div className="text-4xl md:text-5xl font-light text-white mb-2">24/7</div>
                                <div className="text-sm text-white/70 uppercase tracking-wider">Disponível</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-sm">
                                <div className="text-4xl md:text-5xl font-light text-white mb-2">Seguro</div>
                                <div className="text-sm text-white/70 uppercase tracking-wider">Dados</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-sm">
                                <div className="text-4xl md:text-5xl font-light text-white mb-2">Ágil</div>
                                <div className="text-sm text-white/70 uppercase tracking-wider">Suporte</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Differentials */}
            <section className="py-24 md:py-32 px-6 md:px-20 bg-[#EBE8D8]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2B2B2B] uppercase text-center mb-16 tracking-tight">
                        Nossos diferenciais
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        {/* Differential 1 */}
                        <div className="bg-white p-6 rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex gap-4">
                            <div className="flex-shrink-0">
                                <Building2 className="w-5 h-5 text-[#C8A882]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-[#2B2B2B] mb-2">
                                    Interface Intuitiva
                                </h3>
                                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                                    Design pensado para facilitar o uso diário, com navegação simples e recursos acessíveis
                                </p>
                            </div>
                        </div>

                        {/* Differential 2 */}
                        <div className="bg-white p-6 rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex gap-4">
                            <div className="flex-shrink-0">
                                <Users className="w-5 h-5 text-[#C8A882]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-[#2B2B2B] mb-2">
                                    Gestão de Equipes
                                </h3>
                                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                                    Controle de permissões e colaboração entre membros da equipe
                                </p>
                            </div>
                        </div>

                        {/* Differential 3 */}
                        <div className="bg-white p-6 rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex gap-4">
                            <div className="flex-shrink-0">
                                <Shield className="w-5 h-5 text-[#C8A882]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-[#2B2B2B] mb-2">
                                    Segurança de Dados
                                </h3>
                                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                                    Proteção avançada com criptografia e backup automático
                                </p>
                            </div>
                        </div>

                        {/* Differential 4 */}
                        <div className="bg-white p-6 rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex gap-4">
                            <div className="flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-[#C8A882]" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-[#2B2B2B] mb-2">
                                    Atualizações Constantes
                                </h3>
                                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                                    Melhorias contínuas e novos recursos baseados no feedback dos usuários
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 md:py-32 px-6 md:px-20 bg-[#1C3F3A]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white uppercase mb-8 tracking-tight">
                        Pronto para transformar seu negócio?
                    </h2>
                    <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
                        Junte-se a empresas que já utilizam o Gerezim para gestão inteligente e eficiente
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-[#C8A882] text-white px-10 py-5 text-sm font-medium uppercase tracking-wider hover:scale-105 transition-transform duration-300"
                    >
                        Começar agora
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#2B2B2B] py-16 px-6 md:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Logo & Tagline */}
                        <div>
                            <Image
                                src="/logo-novo-gme.png"
                                alt="Gerezim"
                                width={120}
                                height={35}
                                className="h-9 w-auto mb-4 brightness-0 invert"
                            />
                            <p className="text-sm text-[#6B6B6B] font-light">
                                Gestão empresarial inteligente
                            </p>
                        </div>

                        {/* Navegação */}
                        <div>
                            <h4 className="text-sm font-medium text-white uppercase tracking-wider mb-4">
                                Navegação
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/login"
                                        className="text-sm text-[#6B6B6B] hover:text-[#C8A882] transition-colors duration-300"
                                    >
                                        Acessar Plataforma
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/quemsomos"
                                        className="text-sm text-[#6B6B6B] hover:text-[#C8A882] transition-colors duration-300"
                                    >
                                        Quem Somos
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-sm font-medium text-white uppercase tracking-wider mb-4">
                                Legal
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[#6B6B6B] hover:text-[#C8A882] transition-colors duration-300"
                                    >
                                        Política de Privacidade
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[#6B6B6B] hover:text-[#C8A882] transition-colors duration-300"
                                    >
                                        Termos e Condições
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contato */}
                        <div>
                            <h4 className="text-sm font-medium text-white uppercase tracking-wider mb-4">
                                Contato
                            </h4>
                            <p className="text-sm text-[#6B6B6B]">
                                suporte@gerezim.com.br
                            </p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-8 border-t border-white/10">
                        <p className="text-xs text-[#6B6B6B] text-center">
                            © {new Date().getFullYear()} Gerezim. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
