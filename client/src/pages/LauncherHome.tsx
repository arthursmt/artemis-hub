import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crosshair, Shield, LayoutDashboard } from "lucide-react";

export default function LauncherHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="text-hub-title">
            Artemis Hub Demo
          </h1>
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

          <div className="flex justify-center pt-8">
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
