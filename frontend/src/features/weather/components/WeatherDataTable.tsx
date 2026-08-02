import { useState, useMemo, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Zap,
  Wind,
  Droplets,
  Table as TableIcon,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDisplayDate, formatTemperature } from '@/utils/formatters'
import {
  formatWeatherDataToTable,
  getWeatherConditionText,
  type WeatherTableRow,
} from '../data/mockData'
import type { WeatherFileContent } from '@/types/weather'

interface WeatherDataTableProps {
  weatherData: WeatherFileContent | null
  isLoading?: boolean
}

export function WeatherDataTable({ weatherData, isLoading = false }: WeatherDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: false },
  ])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const data = useMemo<WeatherTableRow[]>(() => {
    if (!weatherData) return []
    return formatWeatherDataToTable(weatherData)
  }, [weatherData])

  // Reset to page 0 if data changes and current pageIndex is out of bounds
  useEffect(() => {
    const maxPages = Math.max(1, Math.ceil(data.length / pagination.pageSize))
    if (pagination.pageIndex >= maxPages) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [data.length, pagination.pageSize, pagination.pageIndex])

  const columns = useMemo<ColumnDef<WeatherTableRow>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            aria-label="Sort by date"
          >
            Date
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-primary stroke-[2.5]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3 w-3 text-primary stroke-[2.5]" />
            ) : (
              <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="font-mono text-xs font-medium text-foreground">
            {formatDisplayDate(info.getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: 'weatherCondition',
        header: 'Condition',
        cell: (info) => {
          const row = info.row.original
          const condition = getWeatherConditionText(row.weatherCode)

          let Icon = Sun
          let variant: 'default' | 'info' | 'warning' | 'secondary' = 'default'

          if (condition.category === 'cloud') {
            Icon = Cloud
            variant = 'secondary'
          } else if (condition.category === 'rain') {
            Icon = CloudRain
            variant = 'info'
          } else if (condition.category === 'snow') {
            Icon = Snowflake
            variant = 'info'
          } else if (condition.category === 'thunder') {
            Icon = Zap
            variant = 'warning'
          }

          return (
            <Badge variant={variant} className="gap-1 py-0 px-1.5 text-[11px] font-normal">
              <Icon className="h-3 w-3 stroke-[2]" />
              {condition.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'maxTemp',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            aria-label="Sort by high temperature"
          >
            High
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-orange-500 stroke-[2.5]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3 w-3 text-orange-500 stroke-[2.5]" />
            ) : (
              <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-orange-600 dark:text-orange-400">
            {formatTemperature(info.getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: 'minTemp',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            aria-label="Sort by low temperature"
          >
            Low
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-blue-500 stroke-[2.5]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3 w-3 text-blue-500 stroke-[2.5]" />
            ) : (
              <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
            {formatTemperature(info.getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: 'precipitation',
        header: 'Rain',
        cell: (info) => {
          const val = info.getValue() as number
          return (
            <span className="font-mono text-xs text-muted-foreground inline-flex items-center gap-1">
              <Droplets className="h-3 w-3 text-cyan-500 stroke-[2]" />
              {val.toFixed(1)} mm
            </span>
          )
        },
      },
      {
        accessorKey: 'windSpeed',
        header: 'Wind',
        cell: (info) => {
          const val = info.getValue() as number
          return (
            <span className="font-mono text-xs text-muted-foreground inline-flex items-center gap-1">
              <Wind className="h-3 w-3 text-teal-500 stroke-[2]" />
              {val.toFixed(1)} km/h
            </span>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs w-full font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-44 rounded-lg" />
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  const filteredRows = table.getFilteredRowModel().rows
  const totalFilteredCount = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pagination.pageSize))
  const currentPage = pagination.pageIndex
  const canPrev = currentPage > 0
  const canNext = currentPage < totalPages - 1

  const startRecord = totalFilteredCount === 0 ? 0 : currentPage * pagination.pageSize + 1
  const endRecord = Math.min((currentPage + 1) * pagination.pageSize, totalFilteredCount)

  const handlePrevPage = () => {
    if (canPrev) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
    }
  }

  const handleNextPage = () => {
    if (canNext) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
    }
  }

  const handlePageSelect = (pageIdx: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: pageIdx }))
  }

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5 lg:p-6 flex flex-col gap-3.5 sm:gap-4 shadow-xs w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true">
            <TableIcon className="h-4 w-4 stroke-[2]" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground truncate">
            Daily Records
          </h3>
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0">
            ({totalFilteredCount} of {data.length})
          </span>
        </div>

        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            placeholder="Filter records..."
            value={globalFilter ?? ''}
            onChange={(e) => {
              setGlobalFilter(e.target.value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="w-full h-8.5 sm:h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 font-sans transition-shadow"
            aria-label="Filter weather records"
          />
        </div>
      </div>

      {/* Table with responsive horizontal scroll */}
      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/40 max-h-[360px] overflow-y-auto" role="region" aria-label="Weather data table">
        <table className="w-full text-left text-xs border-collapse min-w-[580px]">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2.5 px-3 whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/30">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-muted-foreground">
                  No records match your filter
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/25 transition-colors duration-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 px-3 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
        {/* Left: Page size dropdown + record count */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <label htmlFor="page-size-select" className="sr-only">Rows per page</label>
          <select
            id="page-size-select"
            value={pagination.pageSize}
            onChange={(e) => {
              setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
            }}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground cursor-pointer font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Select rows per page"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
          <span className="tabular-nums text-muted-foreground whitespace-nowrap">
            <strong className="text-foreground">{startRecord}–{endRecord}</strong> of {totalFilteredCount}
          </span>
        </div>

        {/* Right: Page Navigation with Numbers and Chevrons */}
        <div className="flex items-center gap-1.5" role="navigation" aria-label="Pagination Navigation">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={!canPrev}
            className="h-8 w-8 sm:h-7 sm:w-7 p-0 cursor-pointer disabled:cursor-not-allowed shrink-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>

          {/* Page numbers: Compact on mobile, full on tablet/desktop */}
          <div className="flex items-center gap-1">
            {totalPages <= 6 ? (
              Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePageSelect(i)}
                  className={`h-8 min-w-[32px] sm:h-7 sm:min-w-[28px] px-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${
                    currentPage === i
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground/70 border border-border/60 hover:border-border'
                  }`}
                  aria-label={`Page ${i + 1}`}
                  aria-current={currentPage === i ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              ))
            ) : (
              <span className="text-xs font-mono px-2 py-1 bg-muted/40 rounded-md border border-border/60">
                {currentPage + 1} / {totalPages}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!canNext}
            className="h-8 w-8 sm:h-7 sm:w-7 p-0 cursor-pointer disabled:cursor-not-allowed shrink-0"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
