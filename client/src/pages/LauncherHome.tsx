import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crosshair, Shield, LayoutDashboard, Settings, AlertTriangle } from "lucide-react";

const DEFAULT_HUNT_URL = "https://40fad382-f5d0-41ed-8319-8b14ccbaa38f-00-1a4f4ivx6fwg5.worf.replit.dev/";
const DEFAULT_GATE_URL = "https://f89dbced-a4ab-49cf-a512-fa784ea45cca-00-3uhhyzamtriym.riker.replit.dev/";

function getEffectiveUrl(envUrl: string | undefined, defaultUrl: string): string {
  return envUrl || defaultUrl;
}

function isDevUrl(url: string): boolean {
  return url.includes(".replit.dev");
}

function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
}

export default function LauncherHome() {
  const huntUrl = getEffectiveUrl(import.meta.env.VITE_HUNT_URL, DEFAULT_HUNT_URL);
  const gateUrl = getEffectiveUrl(import.meta.env.VITE_GATE_URL, DEFAULT_GATE_URL);
  
  const huntIsDev = isDevUrl(huntUrl);
  const gateIsDev = isDevUrl(gateUrl);
  const hasDevWarning = huntIsDev || gateIsDev;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="text-hub-title">
            Artemis Hub Demo
          </h1>
          <Link href="/config" data-testid="link-config">
            <Button variant="ghost" className="text-slate-400" data-testid="button-config">
              <Settings className="w-4 h-4 mr-2" />
              Config
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white" data-testid="text-welcome">
              Welcome to Artemis Hub
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Access your Artemis applications from a single unified launcher.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Link href="/hunt" data-testid="link-hunt">
              <Card className="cursor-pointer bg-slate-800/50 border-slate-700 hover-elevate" data-testid="card-hunt">
                <CardHeader className="space-y-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
                    <Crosshair className="w-6 h-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-xl text-white" data-testid="text-hunt-title">Open Hunt</CardTitle>
                  <CardDescription className="text-slate-400" data-testid="text-hunt-description">
                    Access the Hunt application for target tracking and analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-500/30 text-amber-500"
                    data-testid="button-open-hunt"
                  >
                    Launch Hunt
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/gate" data-testid="link-gate">
              <Card className="cursor-pointer bg-slate-800/50 border-slate-700 hover-elevate" data-testid="card-gate">
                <CardHeader className="space-y-1">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-cyan-500" />
                  </div>
                  <CardTitle className="text-xl text-white" data-testid="text-gate-title">Open Gate</CardTitle>
                  <CardDescription className="text-slate-400" data-testid="text-gate-description">
                    Access the Gate application for security and access control.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-cyan-500/30 text-cyan-500"
                    data-testid="button-open-gate"
                  >
                    Launch Gate
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-slate-800/30 rounded-lg p-4 space-y-3" data-testid="url-status-container">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Effective URLs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-medium">Hunt:</span>
                    {huntIsDev && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                  </div>
                  <p className="text-slate-500 font-mono text-xs break-all" data-testid="text-effective-hunt-url">
                    {truncateUrl(huntUrl)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-500 font-medium">Gate:</span>
                    {gateIsDev && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                  </div>
                  <p className="text-slate-500 font-mono text-xs break-all" data-testid="text-effective-gate-url">
                    {truncateUrl(gateUrl)}
                  </p>
                </div>
              </div>
              
              {hasDevWarning && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30 mt-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-200/80 text-xs">
                    Dev URLs (.replit.dev) may sleep after inactivity. See <Link href="/config" className="underline">Config</Link> to update.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Link href="/dashboard" data-testid="link-dashboard">
              <Button variant="ghost" className="text-slate-400" data-testid="button-dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-700/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500" data-testid="text-footer">
          Artemis Hub Demo
        </div>
      </footer>
    </div>
  );
}
