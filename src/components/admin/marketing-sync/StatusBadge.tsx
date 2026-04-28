import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string | null | undefined;
}

function getVariant(status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  const normalized = (status || "").toLowerCase();

  if (["ok", "success", "done", "completed", "active", "connected", "selected"].includes(normalized)) {
    return "default";
  }

  if (["error", "failed", "failure", "invalid", "disconnected"].includes(normalized)) {
    return "destructive";
  }

  if (["pending", "queued", "running", "processing", "syncing"].includes(normalized)) {
    return "secondary";
  }

  return "outline";
}

export function StatusBadge({ status }: Readonly<StatusBadgeProps>) {
  const label = status || "desconhecido";
  return <Badge variant={getVariant(status)}>{label}</Badge>;
}
