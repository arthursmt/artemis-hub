const DEFAULT_HUNT_URL = "https://40fad382-f5d0-41ed-8319-8b14ccbaa38f-00-1a4f4ivx6fwg5.worf.replit.dev/";
const DEFAULT_GATE_URL = "https://f89dbced-a4ab-49cf-a512-fa784ea45cca-00-3uhhyzamtriym.riker.replit.dev/";

function getEffectiveUrl(envUrl: string | undefined, defaultUrl: string): string {
  return envUrl || defaultUrl;
}

export default function HealthPage() {
  const huntUrl = getEffectiveUrl(import.meta.env.VITE_HUNT_URL, DEFAULT_HUNT_URL);
  const gateUrl = getEffectiveUrl(import.meta.env.VITE_GATE_URL, DEFAULT_GATE_URL);
  
  const healthData = {
    ok: true,
    ts: new Date().toISOString(),
    huntUrl,
    gateUrl,
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8" data-testid="health-page">
      <pre className="font-mono text-green-400 text-sm" data-testid="health-json">
        {JSON.stringify(healthData, null, 2)}
      </pre>
    </div>
  );
}
