import type { AppId, Application } from '../types';
import type { Dispatch } from '../App';
import { Zap } from 'lucide-react';

interface Props { appIds: AppId[]; applications: Application[]; dispatch: Dispatch }

export default function LeveragePanel({ appIds, applications, dispatch }: Props) {
  const apps = appIds.map(id => applications.find(a => a.id === id)).filter((a): a is Application => a !== undefined);
  if (apps.length === 0) return null;

  return (
    <div className="mb-3 rounded-lg border border-primary/25 bg-primary/8 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">This answer also satisfies</p>
      </div>
      <div className="space-y-1">
        {apps.map(app => (
          <button
            key={app.id}
            onClick={() => dispatch({ type: 'TOGGLE_EXPAND', appId: app.id })}
            className="w-full text-left flex items-center justify-between group rounded px-1.5 py-1 hover:bg-primary/10 transition-colors"
          >
            <span className="text-xs text-foreground group-hover:text-primary transition-colors">{app.name}</span>
            <span className="flex items-center gap-2 shrink-0">
              {app.amount > 0 && <span className="text-xs text-muted-foreground">${app.amount.toLocaleString()}</span>}
              {app.dueInDays !== undefined && (
                <span className={`text-xs ${app.dueInDays <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {app.dueInDays}d
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
