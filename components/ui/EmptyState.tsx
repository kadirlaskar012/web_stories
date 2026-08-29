import { cn } from "@/lib/utils";
import { BookOpen, Image, Search } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <>
          {action.href ? (
            <a href={action.href}>
              <Button variant="secondary" size="sm">
                {action.label}
              </Button>
            </a>
          ) : (
            <Button variant="secondary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

export function EmptyStories() {
  return (
    <EmptyState
      icon={<BookOpen className="w-7 h-7" />}
      title="No stories yet"
      description="Stories you publish will appear here."
      action={{ label: "Create First Story", href: "/admin/stories/new" }}
    />
  );
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-7 h-7" />}
      title={`No results for "${query}"`}
      description="Try a different search term or browse categories."
    />
  );
}

export function EmptyMedia() {
  return (
    <EmptyState
      icon={<Image className="w-7 h-7" />}
      title="No media uploaded"
      description="Upload images and videos to use in your stories."
    />
  );
}
