import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

interface EmbeddedAppPageProps {
  type: "hunt" | "gate";
}

const APP_CONFIG = {
  hunt: {
    title: "Hunt",
    envVar: "VITE_HUNT_URL",
    fallbackUrl: "",
    color: "amber",
  },
  gate: {
    title: "Gate",
    envVar: "VITE_GATE_URL", 
    fallbackUrl: "",
    color: "cyan",
  },
};

const LOAD_TIMEOUT_MS = 10000;

export default function EmbeddedAppPage({ type }: EmbeddedAppPageProps) {
  const config = APP_CONFIG[type];
  const appUrl = type === "hunt" 
    ? import.meta.env.VITE_HUNT_URL 
    : import.meta.env.VITE_GATE_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!appUrl) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

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
  }, [appUrl, isLoading]);

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(true);
  };

  const openInSameTab = () => {
    if (appUrl) {
      window.location.href = appUrl;
    }
  };

  const openInNewTab = () => {
    if (appUrl) {
      window.open(appUrl, "_blank", "noopener,noreferrer");
    }
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
          {appUrl && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-slate-400"
              onClick={openInNewTab}
              data-testid="button-open-new-tab"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {isLoading && appUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto" />
              <p className="text-slate-400">Loading {config.title}...</p>
            </div>
          </div>
        )}

        {hasError || !appUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10 p-8">
            <Card className="max-w-md w-full bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <CardTitle className="text-xl text-white">
                  {!appUrl ? "App URL Not Configured" : "Unable to Load App"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {!appUrl 
                    ? `The ${config.title} URL environment variable is not set. Please configure VITE_${type.toUpperCase()}_URL.`
                    : `The ${config.title} application could not be loaded in an embedded view. This may be due to security restrictions.`
                  }
                </CardDescription>
              </CardHeader>
              {appUrl && (
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full"
                    onClick={openInSameTab}
                    data-testid="button-open-same-tab"
                  >
                    Open in Same Tab
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={openInNewTab}
                    data-testid="button-fallback-new-tab"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <div className="pt-2">
                    <Link href="/">
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-400 hover:text-white"
                        data-testid="button-fallback-back"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Hub
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              )}
              {!appUrl && (
                <CardContent>
                  <Link href="/">
                    <Button 
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                      data-testid="button-config-back"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Hub
                    </Button>
                  </Link>
                </CardContent>
              )}
            </Card>
          </div>
        ) : null}

        {appUrl && (
          <iframe
            ref={iframeRef}
            src={appUrl}
            className={`w-full h-full border-0 ${hasError ? 'invisible' : ''}`}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`${config.title} Application`}
            data-testid={`iframe-${type}`}
          />
        )}
      </main>
    </div>
  );
}
