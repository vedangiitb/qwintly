import { RefObject } from "react";
import { fetchUrl } from "./fetchUrl";

export async function fetchGenerationStatus(
  wsRef: RefObject<WebSocket>,
  chatId: string,
  updateStatus: (status: string) => void,
  setGenUrl: (url: string) => void,
  finishGeneration: () => void,
) {
  try {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.error("ws close failed", e);
      }
      wsRef.current = null;
    }

    const sessionId = chatId;

    const workerUrl =
      "wss://qwintly-wg-worker-296200543960.asia-south1.run.app";
    const wsUrl = `${workerUrl}/ws/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    console.log("wsUrl", wsUrl);

    ws.addEventListener("open", () =>
      console.log("WS open for session", sessionId, wsUrl),
    );

    ws.addEventListener("message", (e) => {
      try {
        const msg = String(e.data);
        updateStatus(msg);

        if (typeof msg === "string" && msg === "SUCCESS") {
          fetchUrl(chatId).then((url) => setGenUrl(url));
          try {
            ws.close();
          } catch (err) {
            console.error("ws close after SUCCESS failed", err);
          }
        }
      } catch (err) {
        console.error("WS parse message failed", err);
      }
    });

    ws.addEventListener("close", () => {
      finishGeneration();
      wsRef.current = null;
    });

    ws.addEventListener("error", (err) => console.error("WS error", err));
  } catch (err) {
    console.error("Failed to start generation WS", err);
    finishGeneration();
  }
}
