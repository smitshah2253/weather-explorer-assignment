import { Server, ShieldCheck, Database } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageContainer } from '@/layouts/PageContainer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { ENV } from '@/config/env'
import { StatusBadge } from '@/components/common/StatusBadge'

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings & System Diagnostics"
        description="Configuration parameters, environment variables, and backend service connection status."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              API Service Connection
            </CardTitle>
            <CardDescription>
              Backend REST gateway configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">API Base URL</span>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {ENV.API_BASE_URL}
              </code>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-medium text-foreground">
                {ENV.IS_DEV ? 'Development' : 'Production'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Health Status</span>
              <StatusBadge />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Storage & Providers
            </CardTitle>
            <CardDescription>
              Third-party integration services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Weather Data Source</span>
              <span className="font-medium text-foreground">Open-Meteo Historical API</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Blob Storage</span>
              <span className="font-medium text-foreground">Google Cloud Storage (GCS)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Frontend Architecture</span>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Clean Enterprise Architecture
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
