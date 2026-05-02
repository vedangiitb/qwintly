import { FetchUtilHttpClient } from "@/features/shared/ui/api/client.shared";

export type DailyMessagesResponse = {
  date: string;
  count: number;
  limit: number;
  remaining: number;
};

export async function fetchDailyMessages() {
  const httpClient = new FetchUtilHttpClient();
  const res = httpClient.get<DailyMessagesResponse>(
    "/api/account/daily-messages",
  );

  return res;
}
