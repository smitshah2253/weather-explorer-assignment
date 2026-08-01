import { History } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageContainer } from '@/layouts/PageContainer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/common/EmptyState'

export default function HistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Stored Weather Datasets"
        description="View, inspect, and download climate datasets securely stored in Google Cloud Storage."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Cloud Storage Index
          </CardTitle>
          <CardDescription>
            Files synced from Google Cloud Storage bucket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={History}
            title="TanStack Table Ready"
            description="Stored weather datasets and file inspection drawer will be populated in the feature implementation."
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
