import { cn } from "@/lib/utils";
import { StoryStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: StoryStatus;
  className?: string;
}

const statusConfig: Record<StoryStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "badge-draft" },
  REVIEW: { label: "In Review", className: "badge-review" },
  SCHEDULED: { label: "Scheduled", className: "badge-scheduled" },
  PUBLISHED: { label: "Published", className: "badge-published" },
  ARCHIVED: { label: "Archived", className: "badge-archived" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "blue" | "green" | "red" | "yellow" | "purple";
  className?: string;
}

const badgeVariants: Record<string, string> = {
  default: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
