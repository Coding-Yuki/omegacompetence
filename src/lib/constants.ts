export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CANNOT_RESOLVE: "cannot_resolve",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  cannot_resolve: "Non résoluble",
};

export const STATUS_LABELS_EMPLOYEE: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  cannot_resolve: "Non résoluble",
};

export const STATUS_BADGE_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  open: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  in_progress: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  resolved: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    dot: "bg-green-500",
  },
  cannot_resolve: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-400",
  },
};

export const STATUS_ACTIONS: Record<
  string,
  { action: string; logLabel: string }
> = {
  open: { action: "STATUS_CHANGED_OPEN", logLabel: "Réouvert" },
  in_progress: {
    action: "STATUS_CHANGED_IN_PROGRESS",
    logLabel: "Marqué comme en cours",
  },
  resolved: {
    action: "STATUS_CHANGED_RESOLVED",
    logLabel: "Marqué comme résolu",
  },
  cannot_resolve: {
    action: "STATUS_CHANGED_CANNOT_RESOLVE",
    logLabel: "Marqué comme non résoluble",
  },
};
