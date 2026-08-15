import { useState } from 'react';
import type { ArtifactId, State } from '../types';
import type { ReasonCode } from '../types';
import type { Dispatch } from '../App';
import { rankedTasks, isReady, standing } from '../selectors';
import TaskRow from './TaskRow';

const MODE_LABEL: Record<ReasonCode, string> = {
  closes: 'what closes soonest',
  unblocks: 'what unblocks the most',
  'last-step': "what's one step from submitting",
  quick: 'what takes the least time',
};

interface Props { state: State; dispatch: Dispatch; }

export default function NextUpSection({ state, dispatch }: Props) {
  const tasks = rankedTasks(state).slice(0, 3);

  const [expandedArtifactId, setExpandedArtifactId] = useState<ArtifactId | null>(
    tasks[0]?.artifactId ?? null,
  );

  // If the currently expanded artifact is no longer in the list (e.g. was saved),
  // reset to the new first task.
  const taskArtifactIds = tasks.map((t) => t.artifactId);
  const resolvedExpandedId =
    expandedArtifactId !== null && taskArtifactIds.includes(expandedArtifactId)
      ? expandedArtifactId
      : (tasks[0]?.artifactId ?? null);

  const n = tasks.length;
  const minutes = tasks.reduce((m, t) => m + t.estMinutes, 0);

  const { lastActed } = state;
  const showReceipt =
    lastActed.verb === 'saved' &&
    lastActed.artifactId !== null &&
    lastActed.appNames.length > 0 &&
    state.artifacts[lastActed.artifactId]?.status === 'satisfied';

  const showSubmitReceipt = lastActed.verb === 'submitted' && lastActed.appNames.length > 0;
  const submittedApp = showSubmitReceipt
    ? state.applications.find((a) => a.id === lastActed.appIds[0])
    : null;
  const totalSubmittedValue = state.applications
    .filter((a) => a.status === 'submitted' || a.status === 'awarded')
    .reduce((sum, a) => sum + a.amount, 0);

  // Terminal state — zero tasks and no receipt
  if (n === 0 && !showReceipt && !showSubmitReceipt) {
    const apps = state.applications;
    const st = standing(state);
    const ready = apps.filter((a) => isReady(a, state)).length;
    const needsDoc = apps.filter(
      (a) =>
        a.status === 'in_progress' &&
        a.needs.some(
          (id) =>
            state.artifacts[id].kind === 'confirm' &&
            state.artifacts[id].status !== 'satisfied' &&
            state.artifacts[id].owner === 'you',
        ),
    ).length;

    const parts: string[] = [];
    if (ready > 0) parts.push(`${ready} application${ready === 1 ? '' : 's'} ready to submit`);
    if (needsDoc > 0) parts.push(`${needsDoc} need a document from you`);
    if (st.waiting > 0) parts.push(`${st.waiting} ${st.waiting === 1 ? 'is waiting on Mr. Alvarez' : 'waiting on others'}`);

    return (
      <section aria-labelledby="nextup-heading" className="bg-card border border-border rounded-xl p-6">
        <h2 id="nextup-heading" className="text-base font-semibold text-foreground mb-2">
          Nothing needs you right now.
        </h2>
        <p className="text-sm text-muted-foreground">{parts.join(' · ')}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="nextup-heading" className="action-zone bg-card border border-border rounded-xl p-6">
      <div className="mb-4">
        {n > 0 ? (
          <>
            <h2 id="nextup-heading" className="text-base font-semibold text-foreground">
              {n} thing{n === 1 ? '' : 's'} you can finish right now · ~{minutes} min
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sorted by <span className="text-primary">{MODE_LABEL[tasks[0].reason]}</span>
            </p>
          </>
        ) : (
          <h2 id="nextup-heading" className="text-base font-semibold text-foreground">
            Nothing needs you right now.
          </h2>
        )}
      </div>

      {/* Held-slot receipt — essay saved */}
      {showReceipt && lastActed.artifactId && (
        <div className="mb-3 p-3 bg-muted border border-border rounded-lg">
          <p className="text-sm text-emerald-500 line-through">
            ✓ {state.artifacts[lastActed.artifactId].label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Saved. Used by {formatList(lastActed.appNames)}.
          </p>
        </div>
      )}

      {/* Submit receipt — application submitted */}
      {showSubmitReceipt && submittedApp && (
        <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg">
          <p className="text-sm font-semibold text-emerald-500">
            ✓ Submitted: {submittedApp.name}
            {submittedApp.amount > 0 && ` · $${submittedApp.amount.toLocaleString()}`}
          </p>
          {totalSubmittedValue > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              ${totalSubmittedValue.toLocaleString()} in submitted &amp; awarded applications
            </p>
          )}
        </div>
      )}

      <div className="space-y-2" aria-live="polite">
        {tasks.map((task) => (
          <TaskRow
            key={task.artifactId}
            task={task}
            isExpanded={task.artifactId === resolvedExpandedId}
            onExpand={() =>
              setExpandedArtifactId((prev) =>
                prev === task.artifactId ? null : task.artifactId,
              )
            }
            state={state}
            dispatch={dispatch}
          />
        ))}
      </div>
    </section>
  );
}

function formatList(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
