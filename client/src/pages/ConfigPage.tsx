import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, CheckCircle, Settings, ExternalLink } from "lucide-react";

const DEFAULT_HUNT_URL = "https://40fad382-f5d0-41ed-8319-8b14ccbaa38f-00-1a4f4ivx6fwg5.worf.replit.dev/";
const DEFAULT_GATE_URL = "https://f89dbced-a4ab-49cf-a512-fa784ea45cca-00-3uhhyzamtriym.riker.replit.dev/";

function getEffectiveUrl(envUrl: string | undefined, defaultUrl: string): string {
  return envUrl || defaultUrl;
}

function isDevUrl(url: string): boolean {
  return url.includes(".replit.dev");
}

export default function ConfigPage() {
  const huntUrl = getEffectiveUrl(import.meta.env.VITE_HUNT_URL, DEFAULT_HUNT_URL);
  const gateUrl = getEffectiveUrl(import.meta.env.VITE_GATE_URL, DEFAULT_GATE_URL);
  
  const huntIsEnvVar = !!import.meta.env.VITE_HUNT_URL;
  const gateIsEnvVar = !!import.meta.env.VITE_GATE_URL;
  
  const huntIsDev = isDevUrl(huntUrl);
  const gateIsDev = isDevUrl(gateUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/" data-testid="link-back-home">
            <Button variant="ghost" className="text-slate-300" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-700" />
          <h1 className="text-xl font-bold text-white flex items-center gap-2" data-testid="text-config-title">
            <Settings className="w-5 h-5" />
            Configuration
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white" data-testid="text-url-status">URL Status</h2>
          
          <div className="grid gap-4">
            <Card className="bg-slate-800/50 border-slate-700" data-testid="card-hunt-config">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Hunt Application
                  {huntIsDev ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {huntIsEnvVar ? "Using environment variable" : "Using default URL"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-900/50 rounded-md p-3 font-mono text-sm text-slate-300 break-all" data-testid="text-hunt-url">
                  {huntUrl}
                </div>
                {huntIsDev && (
                  <Alert className="bg-yellow-500/10 border-yellow-500/30">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Dev URL Warning</AlertTitle>
                    <AlertDescription className="text-yellow-200/80">
                      This is a development URL (.replit.dev) which may sleep after inactivity. 
                      Consider switching to a published URL (.replit.app) for reliable access.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700" data-testid="card-gate-config">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Gate Application
                  {gateIsDev ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {gateIsEnvVar ? "Using environment variable" : "Using default URL"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-900/50 rounded-md p-3 font-mono text-sm text-slate-300 break-all" data-testid="text-gate-url">
                  {gateUrl}
                </div>
                {gateIsDev && (
                  <Alert className="bg-yellow-500/10 border-yellow-500/30">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Dev URL Warning</AlertTitle>
                    <AlertDescription className="text-yellow-200/80">
                      This is a development URL (.replit.dev) which may sleep after inactivity. 
                      Consider switching to a published URL (.replit.app) for reliable access.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white" data-testid="text-instructions-title">How to Configure URLs</h2>
          
          <Card className="bg-slate-800/50 border-slate-700" data-testid="card-instructions">
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300">
                Follow these steps to override the default URLs with your own:
              </p>
              
              <ol className="list-decimal list-inside space-y-3 text-slate-300">
                <li className="pl-2">
                  In the Replit sidebar, click <strong className="text-white">Tools</strong>
                </li>
                <li className="pl-2">
                  Select <strong className="text-white">Secrets</strong>
                </li>
                <li className="pl-2">
                  Add a new secret with key: <code className="bg-slate-700 px-2 py-1 rounded text-amber-400">VITE_HUNT_URL</code>
                  <br />
                  <span className="text-slate-400 text-sm ml-6">Value: Your Hunt app's published URL (e.g., https://artemis-hunt.replit.app)</span>
                </li>
                <li className="pl-2">
                  Add another secret with key: <code className="bg-slate-700 px-2 py-1 rounded text-cyan-400">VITE_GATE_URL</code>
                  <br />
                  <span className="text-slate-400 text-sm ml-6">Value: Your Gate app's published URL (e.g., https://artemis-gate.replit.app)</span>
                </li>
                <li className="pl-2">
                  <strong className="text-white">Restart</strong> the application (stop and run again)
                </li>
              </ol>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <ExternalLink className="h-4 w-4 text-blue-400" />
                <AlertTitle className="text-blue-400">Pro Tip</AlertTitle>
                <AlertDescription className="text-blue-200/80">
                  Published URLs (.replit.app) are always available and won't sleep, 
                  unlike development URLs (.replit.dev) which may become inactive.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
