import type { State } from '../types';
import type { Dispatch } from '../App';
import { visibleApplications, waitingOnOthers } from '../selectors';
import ApplicationRow from './ApplicationRow';

interface Props { state: State; dispatch: Dispatch; }

const EMPTY_COPY: Record<string, string> = {
  'needs-you': "Nothing is waiting on you.",
  waiting: "Nobody is holding you up right now.",
  ready: "Nothing is ready yet. Finish one more item and something will land here.",
  closed: "Nothing closed yet.",
  all: "",
};

export default function ApplicationList({ state, dispatch }: Props) {
  const apps = visibleApplications(state);

  if (apps.length === 0) {
    let emptyText: string;
    if (state.filter === 'needs-you') {
      const waitingCount = state.applications.filter((a) => waitingOnOthers(a, state)).length;
      emptyText = `Nothing is waiting on you.${waitingCount > 0 ? ` ${waitingCount} application${waitingCount === 1 ? '' : 's'} waiting on Mr. Alvarez.` : ''}`;
    } else {
      emptyText = EMPTY_COPY[state.filter] ?? '';
    }
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        {emptyText}
      </p>
    );
  }

  return (
    <ul aria-label="Applications" className="space-y-0">
      {apps.map((app) => (
        <li key={app.id}>
          <ApplicationRow app={app} state={state} dispatch={dispatch} />
        </li>
      ))}
    </ul>
  );
}
