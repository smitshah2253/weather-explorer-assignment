import { Compass, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageContainer } from '@/layouts/PageContainer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function ExplorePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Explore & Fetch Weather"
        description="Search geographic locations, query Open-Meteo historical climate records, and persist data directly into Google Cloud Storage."
        actions={
          <Badge variant="info" className="py-1 px-3">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Ready for Scaffolding
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Placeholder for Form/Map */}
        <Card className="lg:col-span-1 border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Coordinate Parameters
            </CardTitle>
            <CardDescription>
              Form and interactive map selector will mount here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-44 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center justify-center p-4 text-center">
              <span className="text-xs text-muted-foreground">
                Location & Date Picker Architecture Scaffolding Ready
              </span>
            </div>
            <Button className="w-full" disabled>
              Fetch & Save Climate Data
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for Visualization */}
        <Card className="lg:col-span-2 border-dashed">
          <CardHeader>
            <CardTitle className="text-base">
              Climate Metrics & Visualization
            </CardTitle>
            <CardDescription>
              Interactive temperature graphs and raw JSON payload preview will display here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center justify-center p-4 text-center">
              <span className="text-xs text-muted-foreground">
                Recharts Visualization Scaffolding Ready
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
