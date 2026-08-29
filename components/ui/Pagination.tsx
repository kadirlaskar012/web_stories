import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPaginationRange(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(Number(p))}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-[36px] h-9 px-2 rounded-md text-sm font-medium transition-colors",
              p === page
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

function getPaginationRange(current: number, total: number): (number | "...")[] {
  const range: (number | "...")[] = [];
  const delta = 2;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }

  return range;
}

// Server-side link-based pagination
interface ServerPaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}

export function ServerPagination({
  page,
  totalPages,
  buildHref,
  className,
}: ServerPaginationProps) {
  if (totalPages <= 1) return null;
  const pages = getPaginationRange(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      <a
        href={page > 1 ? buildHref(page - 1) : "#"}
        aria-disabled={page <= 1}
        className={cn(
          "p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors",
          page <= 1 && "opacity-40 pointer-events-none"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </a>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <a
            key={p}
            href={buildHref(Number(p))}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-[36px] h-9 px-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center",
              p === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {p}
          </a>
        )
      )}

      <a
        href={page < totalPages ? buildHref(page + 1) : "#"}
        aria-disabled={page >= totalPages}
        className={cn(
          "p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors",
          page >= totalPages && "opacity-40 pointer-events-none"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </a>
    </nav>
  );
}
