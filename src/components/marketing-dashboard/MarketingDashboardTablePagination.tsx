import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MarketingDashboardTableMeta } from "@/types/marketing-dashboard";

interface MarketingDashboardTablePaginationProps {
  meta: MarketingDashboardTableMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let index = start; index <= end; index += 1) {
    pages.push(index);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function MarketingDashboardTablePagination({
  meta,
  onPageChange,
  onPerPageChange,
}: MarketingDashboardTablePaginationProps) {
  const visiblePages = getVisiblePages(meta.page, meta.totalPages);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Total: <span className="font-medium text-foreground">{meta.totalItems}</span> registros
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Exibir</span>
          <Select value={String(meta.perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => meta.page > 1 && onPageChange(meta.page - 1)}
                className={meta.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {visiblePages.map((pageValue, index) =>
              pageValue === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageValue}>
                  <PaginationLink
                    isActive={pageValue === meta.page}
                    onClick={() => onPageChange(pageValue)}
                    className="cursor-pointer"
                  >
                    {pageValue}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => meta.page < meta.totalPages && onPageChange(meta.page + 1)}
                className={meta.page >= meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
