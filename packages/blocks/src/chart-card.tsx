import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@lindaui/ui/card";

export interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  action,
  footer,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
