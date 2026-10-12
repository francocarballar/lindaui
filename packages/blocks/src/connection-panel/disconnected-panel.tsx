import { Button, Spinner } from "@lindaui/ui/compound";
import type { ReactNode } from "react";
import type { ConnectionPanelLabels } from "../connection-panel";
import { ConnectionInstructions } from "./instructions";

interface DisconnectedPanelProps {
  generating: boolean;
  pending: boolean;
  labels: ConnectionPanelLabels;
  error?: ReactNode;
  onConnect: () => Promise<void>;
}

export function DisconnectedPanel({ generating, pending, labels, error, onConnect }: DisconnectedPanelProps) {
  return (
    <>
      {generating && (
        <div className="space-y-3" role="status">
          <div className="mx-auto flex size-48 items-center justify-center rounded-xl bg-surface-secondary">
            <Spinner size="lg" />
          </div>
          <p className="text-muted text-sm">{labels.generating}</p>
        </div>
      )}
      <div className="space-y-5">
        <p className="max-w-md text-muted text-sm leading-relaxed">{labels.disconnectedDescription}</p>
        <ConnectionInstructions items={labels.disconnectedInstructions} />
      </div>
      {error && <p className="text-danger text-sm" role="alert">{error}</p>}
      {!generating && (
        <Button
          className="mt-2 min-h-11 w-full whitespace-nowrap sm:w-auto"
          isPending={pending}
          onPress={onConnect}
          size="lg"
          variant="secondary"
        >
          {({ isPending }) => (
            <>
              {isPending && <Spinner color="current" size="sm" />}
              {labels.connect}
            </>
          )}
        </Button>
      )}
    </>
  );
}
