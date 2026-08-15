import { useState } from 'react';
import type { Task } from '../selectors';
import type { State } from '../types';
import type { Dispatch } from '../App';
import type { ReasonCode } from '../types';
import LeveragePanel from './LeveragePanel';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const SUGGESTIONS: Record<string, string> = {
  'answer-major': `I chose environmental engineering the summer my hometown's water plant failed. For six weeks my family boiled everything we drank, and I watched a two-person county crew try to explain turbidity readings to four hundred people at a school gymnasium. Nobody in that room lacked intelligence — they lacked a translator. I want to be the engineer who can both fix the filtration and stand up at the microphone afterward. I am two years into a program that has let me do a little of each: I model stormwater systems for a professor on Tuesdays and volunteer as a translator at county health meetings on Saturdays. The scholarship matters because I am the first in my family to attend a four-year school, and every semester I fund is a semester I do not have to defer.`,

  'answer-leadership': `The week before our regional science fair, our team's data logger stopped recording. Nobody in our four-person group had touched the firmware, and our faculty advisor was at a conference.

I didn't have any official role — I'd joined the project late as a data analyst. But I'd taken an embedded systems course the semester before, so I spent two nights reverse-engineering the logger's configuration file. The bug was a timezone offset causing the timestamp to overflow. One-line fix.

What I learned wasn't about firmware. It was that leadership in technical teams usually means being the person willing to sit with the problem longest, not the person with the most authority. Our team submitted on time.

I've been that person twice more since — always in a situation where the title didn't matter, only the willingness to stay.`,

  'answer-community': `For the past two years I've volunteered as a coding instructor at the Eastside Public Library's after-school program. My students are mostly middle schoolers whose schools don't offer computer science until high school, if at all.

The first session I prepared a lesson on variables and loops. By the end of the hour, three students had built a working calculator. Two of them asked if they could come back the following week.

What I've learned is that the barrier to technical education isn't aptitude — it's access and confidence. Most of my students had never been told that programming was something they could do. Once they believed it, they moved fast.

I now run the program two afternoons a week and have trained two other volunteers to teach alongside me. The library extended the program through the school year based on attendance. That's the part I'm most proud of.`,
};

const CHIP_COPY: Record<ReasonCode, (t: Task) => string> = {
  closes: (t) => `closes in ${t.soonestDueInDays} days`,
  unblocks: (t) => `used by ${t.unblocks} applications`,
  'last-step': () => 'last thing left',
  quick: (t) => `${t.estMinutes} min`,
};

interface Props {
  task: Task;
  isExpanded: boolean;
  onExpand: () => void;
  state: State;
  dispatch: Dispatch;
}

export default function TaskRow({ task, isExpanded, onExpand, state, dispatch }: Props) {
  const artifact = state.artifacts[task.artifactId];
  const chipText = CHIP_COPY[task.reason](task);
  const [thinkingFor, setThinkingFor] = useState<string | null>(null);

  function handleSuggest(artifactId: string) {
    setThinkingFor(artifactId);
    setTimeout(() => {
      dispatch({ type: 'EDIT_DRAFT', artifactId: artifactId as import('../types').ArtifactId, value: SUGGESTIONS[artifactId] });
      setThinkingFor(null);
    }, 3000);
  }

  if (!isExpanded) {
    return (
      <button
        onClick={onExpand}
        className="w-full text-left flex items-center justify-between py-2 px-3 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={`Open task: ${artifact.label}`}
      >
        <span className="text-sm text-foreground">{artifact.label}</span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">{chipText}</span>
          <span className="text-xs text-muted-foreground">~{task.estMinutes} min</span>
        </div>
      </button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-foreground">{artifact.label}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          task.reason === 'closes' ? 'bg-destructive/15 text-destructive'
          : task.reason === 'unblocks' ? 'bg-primary/15 text-primary'
          : 'bg-muted text-muted-foreground',
        )}>{chipText}</span>
        <span className="text-xs text-muted-foreground">~{task.estMinutes} min</span>
      </div>

      {artifact.prompt && (
        <p className="text-xs text-muted-foreground mb-3">{artifact.prompt}</p>
      )}

      {task.unblocks > 1 && (
        <LeveragePanel
          appIds={task.appIds}
          applications={state.applications}
          dispatch={dispatch}
        />
      )}

      {artifact.control === 'textarea' && (
        <>
          {SUGGESTIONS[artifact.id] && (
            <div className="flex justify-end mb-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => !thinkingFor && handleSuggest(artifact.id)}
                disabled={thinkingFor === artifact.id}
                title="Fill with AI suggestion"
              >
                {thinkingFor === artifact.id ? (
                  <>
                    <span className="inline-flex gap-0.5 items-end">
                      <span className="thinking-dot h-1 w-1 rounded-full bg-primary inline-block" style={{ animationDelay: '0ms' }} />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-primary inline-block" style={{ animationDelay: '150ms' }} />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-primary inline-block" style={{ animationDelay: '300ms' }} />
                    </span>
                    Thinking
                  </>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" />Suggest</>
                )}
              </Button>
            </div>
          )}
          <Textarea
            value={state.drafts[artifact.id] ?? ''}
            onChange={(e) => dispatch({ type: 'EDIT_DRAFT', artifactId: artifact.id, value: e.target.value })}
            aria-label={artifact.label}
            autoFocus
          />
        </>
      )}

      {artifact.control === 'select' && (
        <select
          className="border border-input bg-background rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={state.drafts[artifact.id] ?? ''}
          onChange={(e) => dispatch({ type: 'EDIT_DRAFT', artifactId: artifact.id, value: e.target.value })}
          aria-label={artifact.label}
          autoFocus
        >
          <option value="">Select…</option>
          {artifact.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      <div className="flex gap-2 mt-3">
        <Button
          onClick={() => dispatch({ type: 'SAVE_ARTIFACT', artifactId: artifact.id })}
          disabled={!state.drafts[artifact.id]}
        >
          Save answer
        </Button>
        <Button
          variant="ghost"
          disabled={!state.drafts[artifact.id]}
          onClick={() => dispatch({ type: 'EDIT_DRAFT', artifactId: artifact.id, value: '' })}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
