import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageContainer } from '@/layouts/PageContainer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/common/EmptyState'

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Climate Analytics & Trends"
        description="Comprehensive analytics comparing historical climate observations and temperature anomalies across multiple regions."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Comparative Metrics
          </CardTitle>
          <CardDescription>
            Multi-series temperature and precipitation metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="Analytics Engine Architecture Ready"
            description="Recharts multi-series analytics charts will be mounted here."
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
