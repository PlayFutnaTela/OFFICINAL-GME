import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionText: string
  actionHref: string
  borderColor?: 'red' | 'blue' | 'green' | 'purple' | 'yellow'
}

const colorMap = {
  red: {
    border: 'border-red-100',
    bg: 'from-red-50/50',
    icon: 'text-red-100',
    button: 'bg-red-600 hover:bg-red-700'
  },
  blue: {
    border: 'border-blue-100',
    bg: 'from-blue-50/50',
    icon: 'text-blue-100',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  green: {
    border: 'border-green-100',
    bg: 'from-green-50/50',
    icon: 'text-green-100',
    button: 'bg-green-600 hover:bg-green-700'
  },
  purple: {
    border: 'border-purple-100',
    bg: 'from-purple-50/50',
    icon: 'text-purple-100',
    button: 'bg-purple-600 hover:bg-purple-700'
  },
  yellow: {
    border: 'border-yellow-100',
    bg: 'from-yellow-50/50',
    icon: 'text-yellow-100',
    button: 'bg-yellow-600 hover:bg-yellow-700'
  }
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  borderColor = 'blue'
}: DashboardEmptyStateProps) {
  const colors = colorMap[borderColor]

  return (
    <Card className={`${colors.border} bg-gradient-to-br ${colors.bg} to-white`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colors.icon}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className={`h-16 w-16 ${colors.icon} mb-4`} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <a
          href={actionHref}
          className={`px-6 py-2 text-white rounded-lg transition-colors ${colors.button}`}
        >
          {actionText}
        </a>
      </CardContent>
    </Card>
  )
}
