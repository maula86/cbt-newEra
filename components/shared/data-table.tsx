'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey?: keyof T | string;
  searchPlaceholder?: string;
  pageSize?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  toolbarActions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Cari data...',
  pageSize = 10,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId = (row) => row.id || JSON.stringify(row),
  toolbarActions,
  filterComponent,
  emptyMessage = 'Belum ada data yang tersedia.',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Filter by search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((row) => {
      if (searchKey && row[searchKey as keyof T]) {
        return String(row[searchKey as keyof T]).toLowerCase().includes(query);
      }
      // Global search across all fields if searchKey not specified
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, searchKey]);

  // Sort
  const sortedData = React.useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  // Adjust current page safely
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedIds.includes(getRowId(row)));

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    const pageIds = paginatedData.map(getRowId);
    if (checked) {
      const newSelection = Array.from(new Set([...selectedIds, ...pageIds]));
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedIds.filter((id) => !pageIds.includes(id));
      onSelectionChange(newSelection);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="pl-8 text-xs sm:text-sm"
            />
          </div>
          {filterComponent}
        </div>
        {toolbarActions && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {toolbarActions}
          </div>
        )}
      </div>

      {/* Selected Indicator */}
      {selectable && selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-secondary/80 px-3.5 py-2 text-xs text-secondary-foreground border border-border/60">
          <span>{selectedIds.length} baris terpilih</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange?.([])}
            className="h-7 text-xs px-2"
          >
            Batalkan Pilihan
          </Button>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Pilih semua data di halaman ini"
                  />
                </TableHead>
              )}
              {columns.map((col, idx) => {
                const canSort = col.sortable && col.accessorKey;
                const isSorted = sortField === col.accessorKey;

                return (
                  <TableHead key={idx} className={col.className}>
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => handleSort(String(col.accessorKey))}
                        className="inline-flex items-center gap-1.5 font-medium hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-36 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                    <Inbox className="h-7 w-7 text-muted-foreground/40 mb-1" />
                    <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery ? 'Coba ubah kata kunci pencarian.' : 'Silakan tambahkan data baru melalui tombol di atas.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const rowId = getRowId(row);
                const isSelected = selectedIds.includes(rowId);

                return (
                  <TableRow
                    key={rowId || rowIdx}
                    data-state={isSelected ? 'selected' : undefined}
                    className={isSelected ? 'bg-secondary/30' : undefined}
                  >
                    {selectable && (
                      <TableCell className="w-10 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(rowId, Boolean(checked))
                          }
                          aria-label={`Pilih baris ${rowIdx + 1}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((col, colIdx) => (
                      <TableCell key={colIdx} className={col.className}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String(row[col.accessorKey as keyof T] ?? '')
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 text-xs text-muted-foreground bg-muted/10">
          <div>
            Menampilkan{' '}
            <span className="font-medium text-foreground">
              {sortedData.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-medium text-foreground">
              {Math.min(safeCurrentPage * pageSize, sortedData.length)}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-foreground">
              {sortedData.length}
            </span>{' '}
            data
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-2 text-foreground font-medium">
              Halaman {safeCurrentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="h-7 w-7 p-0"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="h-7 w-7 p-0"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
