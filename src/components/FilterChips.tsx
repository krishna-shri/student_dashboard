import type { State } from '../types';
import type { Dispatch } from '../App';
import { filterCounts } from '../selectors';
import { mergeClasses } from '../lib/utils';

const LABELS: Record<string, string> = {
  all: 'All', 'needs-you': 'Needs you',
  waiting: 'Waiting on others', ready: 'Ready to submit', closed: 'Closed',
};
const FILTERS = ['all', 'needs-you', 'waiting', 'ready', 'closed'] as const;

interface Props { state: State; dispatch: Dispatch }

export default function FilterChips({ state, dispatch }: Props) {
  const counts = filterCounts(state);
  return (
    <div role="tablist" aria-label="Filter applications" className="flex gap-2 flex-wrap mb-4">
      {FILTERS.map(f => (
        <button
          key={f}
          role="tab"
          aria-selected={state.filter === f}
          onClick={() => dispatch({ type: 'SET_FILTER', filter: f })}
          className={mergeClasses(
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
            state.filter === f
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
          )}
        >
          {LABELS[f]} {counts[f]}
        </button>
      ))}
    </div>
  );
}
