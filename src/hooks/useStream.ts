import { useState, useCallback, useRef } from "react";

export interface SSEEvent {
  event: "token" | "done" | "error";
  data: {
    delta?: string;
    message?: string;
  };
}

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export function useStream() {
  const [streamedText, setStreamedText] = useState<string>("");
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  const getRandomDelay = (): number => {
    return Math.floor(Math.random() * 101) + 50;
  };

  const parseJsonl = (content: string): SSEEvent[] => {
    const lines = content.trim().split("\n");
    const events: SSEEvent[] = [];

    for (const line of lines) {
      if (line.trim()) {
        try {
          const event = JSON.parse(line) as SSEEvent;
          events.push(event);
        } catch (err) {
          console.error("Failed to parse line:", line, err);
        }
      }
    }

    return events;
  };

  const processEvents = useCallback(
    async (events: SSEEvent[], signal: AbortSignal) => {
      let accumulatedText = "";

      for (let i = 0; i < events.length; i++) {
        if (signal.aborted) {
          break;
        }

        const event = events[i];

        await new Promise<void>((resolve) => {
          const delay = getRandomDelay();
          const timeoutId = window.setTimeout(() => {
            resolve();
          }, delay);

          timeoutIdsRef.current.push(timeoutId);

          signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            resolve();
          });
        });

        if (signal.aborted) {
          break;
        }

        switch (event.event) {
          case "token":
            if (event.data.delta) {
              accumulatedText += event.data.delta;
              setStreamedText(accumulatedText);
            }
            break;

          case "done":
            setStatus("done");
            if (event.data.message) {
              console.log("Stream completed:", event.data.message);
            }
            return;

          case "error":
            setStatus("error");
            setErrorMessage(event.data.message || "Unknown error occurred");
            return;
        }
      }

      if (!signal.aborted) {
        setStatus("done");
      }
    },
    []
  );

  const startStream = useCallback(
    async (file: File) => {
      setStreamedText("");
      setStatus("streaming");
      setErrorMessage("");
      timeoutIdsRef.current = [];

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const content = await file.text();

        const events = parseJsonl(content);

        if (events.length === 0) {
          setStatus("error");
          setErrorMessage("No valid events found in file");
          return;
        }

        await processEvents(events, abortControllerRef.current.signal);
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          setStatus("idle");
        } else {
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to process file"
          );
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [processEvents]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];

    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setStreamedText("");
    setErrorMessage("");
    setStatus("idle");
  }, [stopStream]);

  return {
    streamedText,
    status,
    errorMessage,
    startStream,
    stopStream,
    reset,
  };
}
