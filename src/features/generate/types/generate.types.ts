export interface GenerationStatusLog {
  eventType: string;
  step: string | null;
  message: string | null;
  seqNum: number | null;
  createdAt: string;
}

export type SessionType = "generate" | "deploy";