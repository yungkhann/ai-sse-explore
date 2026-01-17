import { useRef, useMemo, useEffect } from "react";
import embed from "vega-embed";
import { useStream } from "./hooks/useStream";
import { parseVegaSpec, getParsingStatus } from "./utils/vegaParser";
import {
  Play,
  Square,
  Upload,
  Activity,
  FileCode,
  Bot,
  AreaChart,
  AlertTriangle,
  Loader,
  CheckCircle2,
} from "lucide-react";

const CHART_DATA = {
  table: [
    { region: "Almaty", revenue: 120 },
    { region: "Astana", revenue: 90 },
    { region: "Shymkent", revenue: 70 },
  ],
};

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { streamedText, status, errorMessage, startStream, stopStream, reset } =
    useStream();

  const vegaSpec = useMemo(() => {
    if (!streamedText) return null;
    return parseVegaSpec(streamedText);
  }, [streamedText]);

  const parsingStatus = useMemo(() => {
    if (!streamedText) return null;
    return getParsingStatus(streamedText);
  }, [streamedText]);

  useEffect(() => {
    if (vegaSpec && chartRef.current) {
      const spec = {
        ...vegaSpec,
        data: { values: CHART_DATA.table },
        width: "container",
        height: 400,
        autosize: { type: "fit", contains: "padding" },
      } as any;

      embed(chartRef.current, spec, {
        actions: false,
        defaultStyle: true,
      }).catch((err) => console.error("Vega embed error:", err));
    }
  }, [vegaSpec]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".jsonl")) {
      reset();
      startStream(file);
    } else {
      alert("Please select a .jsonl file");
    }
  };

  const handlePlay = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleStop = () => {
    stopStream();
  };

  const getStatusBadgeClasses = () => {
    switch (status) {
      case "idle":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "streaming":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse";
      case "done":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "error":
        return "bg-rose-100 text-rose-700 border-rose-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "streaming":
        return <Activity className="w-4 h-4" />;
      case "done":
        return <CheckCircle2 className="w-4 h-4" />;
      case "error":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800">
                AI SSE Explore
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jsonl"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handlePlay}
                disabled={status === "streaming"}
                className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-md hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-100 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Play</span>
              </button>

              <button
                onClick={handleStop}
                disabled={status !== "streaming"}
                className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-md hover:bg-rose-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-100 shadow-sm"
              >
                <Square className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </button>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-semibold ${getStatusBadgeClasses()}`}
              >
                {getStatusIcon()}
                <span className="uppercase tracking-wider">{status}</span>
              </div>
            </div>
          </div>

          <div>
            {errorMessage && (
              <div className="my-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <div className="text-sm text-rose-800">
                    <span className="font-medium">Error:</span> {errorMessage}
                  </div>
                </div>
              </div>
            )}
            {parsingStatus && status !== "error" && (
              <div className="my-2 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader className="w-5 h-5 text-sky-500 flex-shrink-0 animate-spin" />
                  <div className="text-sm text-sky-800">
                    <span className="font-medium">Parser:</span>{" "}
                    {parsingStatus.message}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <FileCode className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Stream Input
                </h2>
              </div>

              <div className="bg-slate-900 rounded-lg shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col flex-grow">
                <div className="bg-slate-800/70 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/90"></div>
                  </div>
                  <span className="ml-auto text-xs text-slate-400 font-mono">
                    /stream.jsonl
                  </span>
                </div>

                <div className="p-6 font-mono text-sm text-emerald-300 overflow-auto min-h-[550px] flex-grow">
                  {streamedText ? (
                    <pre className="whitespace-pre-wrap">{streamedText}</pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <Upload className="w-10 h-10 mb-4 opacity-40" />
                      <span className="text-base">
                        Click 'Play' to upload a file
                      </span>
                      <span className="text-xs mt-1 opacity-60">
                        Supports .jsonl format
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <AreaChart className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Visualization
                </h2>
              </div>

              <div className="bg-white rounded-lg shadow-2xl border border-slate-200/80 p-6 overflow-auto flex flex-col justify-center items-center flex-grow">
                {vegaSpec ? (
                  <div
                    ref={chartRef}
                    className="w-full h-full flex justify-center  items-center"
                  ></div>
                ) : (
                  <div className="text-center">
                    <div className="w-28 h-28 mx-auto rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center bg-slate-50/50 mb-5">
                      <AreaChart className="w-12 h-12 text-slate-400/80" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">
                      Chart Output
                    </h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                      Waiting for a valid Vega-Lite specification from the input
                      stream.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
