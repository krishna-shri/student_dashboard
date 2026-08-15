import { useEffect, useRef, useState } from 'react';
import type { Application, State } from '../types';
import type { Dispatch } from '../App';
import { blockerLabel, remaining } from '../selectors';
import RequirementRow from './RequirementRow';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';

interface Props { app: Application; state: State; dispatch: Dispatch }

function blockerVariant(label: string): 'blue' | 'success' | 'default' | 'muted' | 'warning' {
  if (label === 'Needs you')       return 'blue';
  if (label === 'Ready to submit') return 'success';
  if (label === 'Awarded')         return 'default';
  if (label === 'Submitted')       return 'muted';
  return 'warning';
}

function deadlineVariant(days: number): 'destructive' | 'warning' | 'muted' {
  if (days <= 3) return 'destructive';
  if (days <= 7) return 'warning';
  return 'muted';
}

export default function ApplicationRow({ app, state, dispatch }: Props) {
  const isExpanded = state.expandedAppIds.includes(app.id);
  const rem        = remaining(app, state);
  const doneCount  = app.needs.length - rem.length;
  const blocker    = blockerLabel(app, state);
  const rowRef     = useRef<HTMLDivElement>(null);

  // Local draft — isolated from global state.drafts so the top task panel stays clean
  const [localDraft, setLocalDraft] = useState('');
  const openId = state.openArtifactId;
  useEffect(() => { setLocalDraft(''); }, [openId]); // reset when artifact changes

  useEffect(() => {
    if (isExpanded && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded]);

  return (
    <div
      ref={rowRef}
      className="border border-border rounded-xl mb-2 overflow-hidden bg-card"
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">{app.name}</span>
            {app.amount > 0 && (
              <span className="text-muted-foreground text-sm">${app.amount.toLocaleString()}</span>
            )}
            {app.dueInDays !== undefined && (
              <Badge variant={deadlineVariant(app.dueInDays)}>
                closes in {app.dueInDays} days
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{app.sponsor}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={blockerVariant(blocker)}>{blocker}</Badge>
            {app.needs.length > 0 && (
              <span className="text-xs text-muted-foreground">{doneCount} of {app.needs.length} items done</span>
            )}
            {app.needs.length === 0 && app.status !== 'in_progress' && (
              <span className="text-xs text-muted-foreground">All items done</span>
            )}
          </div>
        </div>

        {app.status === 'in_progress' && (
          <div className="flex items-center gap-2 shrink-0">
            {blocker === 'Ready to submit' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => dispatch({ type: 'SUBMIT_APP', appId: app.id })}
              >
                <Send className="h-3.5 w-3.5" />
                Submit
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-expanded={isExpanded}
              aria-controls={`app-details-${app.id}`}
              onClick={() => dispatch({ type: 'TOGGLE_EXPAND', appId: app.id })}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div id={`app-details-${app.id}`} className="border-t border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground mb-3">Why you qualify: {app.matchReasons.join(' · ')}</p>
          {app.needs.map(artifactId => (
            <RequirementRow
              key={artifactId}
              artifact={state.artifacts[artifactId]}
              dispatch={dispatch}
              appId={app.id}
            />
          ))}

          {/* Inline artifact editor — local draft only, does NOT touch global state.drafts */}
          {(() => {
            if (!openId || state.openArtifactAppId !== app.id) return null;
            const artifact = state.artifacts[openId];
            if (!artifact) return null;
            return (
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <p className="text-xs font-medium text-foreground">{artifact.label}</p>
                {artifact.prompt && (
                  <p className="text-xs text-muted-foreground">{artifact.prompt}</p>
                )}
                {artifact.control === 'textarea' && (
                  <Textarea
                    value={localDraft}
                    onChange={e => setLocalDraft(e.target.value)}
                    aria-label={artifact.label}
                    autoFocus
                  />
                )}
                {artifact.control === 'select' && (
                  <select
                    className="border border-input bg-background rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
                    value={localDraft}
                    onChange={e => setLocalDraft(e.target.value)}
                    aria-label={artifact.label}
                    autoFocus
                  >
                    <option value="">Select…</option>
                    {artifact.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // Write the local draft to global state, then save
                      dispatch({ type: 'EDIT_DRAFT', artifactId: openId, value: localDraft });
                      dispatch({ type: 'SAVE_ARTIFACT', artifactId: openId });
                    }}
                    disabled={!localDraft}
                  >
                    Save answer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'OPEN_ARTIFACT', artifactId: null, appId: undefined })}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })()}

          <div className="mt-3 pt-3 border-t border-border">
            {rem.length === 0 ? (
              <Button variant="success" size="sm" onClick={() => dispatch({ type: 'SUBMIT_APP', appId: app.id })}>
                <Send className="h-3.5 w-3.5" />
                Submit application
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Submit application — {rem.length} item{rem.length === 1 ? '' : 's'} left
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
