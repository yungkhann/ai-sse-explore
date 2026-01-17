export interface VegaLiteSpec {
  $schema?: string;
  mark: string | object;
  encoding: object;
  data?: object;
  width?: number;
  height?: number;
  [key: string]: any;
}

export function extractJsonFromMarkdown(text: string): string | null {
  const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

export function safeJsonParse(jsonString: string): any | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

export function isValidVegaLiteSpec(obj: any): obj is VegaLiteSpec {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const hasMark =
    "mark" in obj &&
    (typeof obj.mark === "string" ||
      (typeof obj.mark === "object" && obj.mark !== null));

  const hasEncoding =
    "encoding" in obj &&
    typeof obj.encoding === "object" &&
    obj.encoding !== null;

  return hasMark && hasEncoding;
}

export function parseVegaSpec(streamedText: string): VegaLiteSpec | null {
  const jsonString = extractJsonFromMarkdown(streamedText);
  if (!jsonString) {
    return null;
  }

  const parsed = safeJsonParse(jsonString);
  if (!parsed) {
    return null;
  }

  if (!isValidVegaLiteSpec(parsed)) {
    return null;
  }

  return parsed;
}

export function getParsingStatus(streamedText: string): {
  status: "no-code-block" | "invalid-json" | "invalid-spec" | "valid";
  message: string;
} {
  const jsonString = extractJsonFromMarkdown(streamedText);

  if (!jsonString) {
    return {
      status: "no-code-block",
      message: "Waiting for code block...",
    };
  }

  const parsed = safeJsonParse(jsonString);
  if (!parsed) {
    return {
      status: "invalid-json",
      message: "Parsing JSON... (incomplete)",
    };
  }

  if (!isValidVegaLiteSpec(parsed)) {
    return {
      status: "invalid-spec",
      message: "Invalid Vega-Lite specification (missing mark or encoding)",
    };
  }

  return {
    status: "valid",
    message: "Valid Vega-Lite specification",
  };
}
