"use client"

import { MenuBar } from '../../../../style/appmenu'
import {
    LayoutDashboard,
    Briefcase,
    Users,
    KanbanSquare,
    BarChart3,
    ShoppingCart,
    User,
    FileText,
    Heart,
    MessageSquare
} from "lucide-react"

export function ConciergeMobileMenu() {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Briefcase, label: 'Oportunidades', href: '/oportunidades' },
        { icon: Heart, label: 'Favoritos', href: '/favoritos' },
        { icon: ShoppingCart, label: 'Produtos', href: '/produtos' },
        { icon: FileText, label: 'Insumos', href: '/insumos' },
        { icon: Users, label: 'Clientes', href: '/clientes' },
        { icon: KanbanSquare, label: 'Pipeline', href: '/pipeline' },
        { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
        { icon: MessageSquare, label: 'Concierge', href: '/concierge' },
        { icon: User, label: 'Perfil', href: '/perfil' },
    ]

    // Converter os ícones do formato Lucide para o formato esperado por MenuBar
    const convertedMenuItems = menuItems.map(item => ({
        ...item,
        icon: (props: React.SVGProps<SVGSVGElement>) => {
            const LucideIcon = item.icon as React.FC<React.SVGProps<SVGSVGElement>>
            return <LucideIcon {...props} />
        }
    }))

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 flex justify-center">
            <MenuBar items={convertedMenuItems} className="shadow-lg" />
        </div>
    )
}
