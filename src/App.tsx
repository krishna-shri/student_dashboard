import { useEffect, useReducer, useRef, useState } from 'react';
import { reducer } from './reducer';
import { initialState, STUDENT } from './seed';
import type { Action } from './reducer';
import ApplicationList from './components/ApplicationList';
import FilterChips from './components/FilterChips';
import NextUpSection from './components/NextUpSection';
import StatusStrip from './components/StatusStrip';
import { Button } from './components/ui/button';
import { Sun, Moon, Bell } from 'lucide-react';

export type Dispatch = (action: Action) => void;

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Show toast when a nudge fires
  useEffect(() => {
    if (state.lastActed.verb === 'nudged' && state.lastActed.appNames.length > 0) {
      const artifactId = state.lastActed.artifactId;
      const artifactLabel = artifactId ? state.artifacts[artifactId]?.label ?? 'Reminder' : 'Reminder';
      setToast(`Reminder sent — ${artifactLabel}`);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3500);
    }
  }, [state.lastActed]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {STUDENT.firstName} · {STUDENT.cycle}
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Your scholarships</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDark(d => !d)}
          aria-label="Toggle colour scheme"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {isDark ? 'Light' : 'Dark'}
        </Button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <StatusStrip state={state} />
        <NextUpSection state={state} dispatch={dispatch} />
        <section aria-labelledby="apps-heading">
          <h2 id="apps-heading" className="sr-only">Your applications</h2>
          <FilterChips state={state} dispatch={dispatch} />
          <ApplicationList state={state} dispatch={dispatch} />
        </section>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border mt-6">
        Sample data used in UI | Refresh to reset
      </footer>

      {/* Nudge toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm text-foreground animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Bell className="h-4 w-4 text-amber-500 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
