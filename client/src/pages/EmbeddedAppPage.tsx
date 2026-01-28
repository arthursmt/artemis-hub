import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

interface EmbeddedAppPageProps {
  type: "hunt" | "gate";
}

const DEFAULT_HUNT_URL = "https://40fad382-f5d0-41ed-8319-8b14ccbaa38f-00-1a4f4ivx6fwg5.worf.replit.dev/";
const DEFAULT_GATE_URL = "https://f89dbced-a4ab-49cf-a512-fa784ea45cca-00-3uhhyzamtriym.riker.replit.dev/";

const APP_CONFIG = {
  hunt: {
    title: "Hunt",
    defaultUrl: DEFAULT_HUNT_URL,
  },
  gate: {
    title: "Gate",
    defaultUrl: DEFAULT_GATE_URL,
  },
};

const LOAD_TIMEOUT_MS = 8000;

function getEffectiveUrl(type: "hunt" | "gate"): string {
  const envUrl = type === "hunt" 
    ? import.meta.env.VITE_HUNT_URL 
    : import.meta.env.VITE_GATE_URL;
  return envUrl || APP_CONFIG[type].defaultUrl;
}

function buildIframeSrc(baseUrl: string, apiBase: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("embed", "1");
  url.searchParams.set("apiBase", apiBase);
  return url.toString();
}

export default function EmbeddedAppPage({ type }: EmbeddedAppPageProps) {
  const config = APP_CONFIG[type];
  const baseAppUrl = getEffectiveUrl(type);
  const apiBase = window.location.origin;
  const iframeSrc = buildIframeSrc(baseAppUrl, apiBase);

  console.log("[HUB->HUNT] hubOrigin=", window.location.origin);
  console.log("[HUB->HUNT] iframeSrc=", iframeSrc);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
      }
    }, LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [iframeSrc]);

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);
    
    // Send postMessage to iframe with apiBase config
    if (iframeRef.current?.contentWindow) {
      console.log("[HUB->HUNT] postMessage sent apiBase=", apiBase);
      iframeRef.current.contentWindow.postMessage(
        { type: "ARTEMIS_CONFIG", apiBase },
        "*"
      );
    }
  };

  const [showDebug, setShowDebug] = useState(true);

  const handleIframeError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(true);
  };


  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between gap-4" data-testid="header-container">
          <div className="flex items-center gap-4">
            <Link href="/" data-testid="link-back-to-hub">
              <Button 
                variant="ghost" 
                className="text-slate-300"
                data-testid="button-back-to-hub"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-700" data-testid="header-divider" />
            <h1 className="text-lg font-semibold text-white" data-testid="text-app-title">
              Artemis Hub Demo — {config.title}
            </h1>
          </div>
        </div>
      </header>

      {showDebug && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className="flex-1 overflow-x-auto">
              <code className="text-xs font-mono text-cyan-400 whitespace-nowrap" data-testid="text-hub-origin">
                hubOrigin: {apiBase}
              </code>
            </div>
            <button 
              onClick={() => setShowDebug(false)} 
              className="text-slate-500 hover:text-slate-300 text-xs"
              data-testid="button-hide-debug"
            >
              Hide
            </button>
          </div>
          <div className="overflow-x-auto">
            <code className="text-xs font-mono text-green-400 whitespace-nowrap" data-testid="text-iframe-src">
              iframeSrc: {iframeSrc}
            </code>
          </div>
        </div>
      )}

      <main className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto" />
              <p className="text-slate-400">Loading {config.title}...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20 p-8">
            <Card className="max-w-md w-full bg-slate-800/90 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <CardTitle className="text-xl text-white" data-testid="text-embed-error">
                  Embedding Blocked
                </CardTitle>
                <CardDescription className="text-slate-400">
                  The {config.title} application could not be embedded due to security restrictions.
                  Please contact the administrator to configure the external app to allow embedding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/" data-testid="link-error-back">
                  <Button className="w-full" data-testid="button-error-back">
                    Back to Hub
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={`${config.title} Application`}
          data-testid={`iframe-${type}`}
        />
      </main>
    </div>
  );
}
