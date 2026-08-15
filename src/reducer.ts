import type { AppId, ArtifactId, Filter, State } from './types';
import { remaining } from './selectors';

export type Action =
  | { type: 'EDIT_DRAFT'; artifactId: ArtifactId; value: string }
  | { type: 'SAVE_ARTIFACT'; artifactId: ArtifactId }
  | { type: 'TOGGLE_CONFIRM'; artifactId: ArtifactId }
  | { type: 'NUDGE'; artifactId: ArtifactId }
  | { type: 'SUBMIT_APP'; appId: AppId }
  | { type: 'OPEN_ARTIFACT'; artifactId: ArtifactId | null; appId?: AppId }
  | { type: 'TOGGLE_EXPAND'; appId: AppId }
  | { type: 'SET_FILTER'; filter: Filter };

function affected(s: State, artifactId: ArtifactId) {
  const apps = s.applications.filter(
    (a) => a.status === 'in_progress' && a.needs.includes(artifactId),
  );
  return { appIds: apps.map((a) => a.id), appNames: apps.map((a) => a.name) };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'EDIT_DRAFT':
      return {
        ...state,
        drafts: { ...state.drafts, [action.artifactId]: action.value },
      };

    case 'SAVE_ARTIFACT': {
      const { appIds, appNames } = affected(state, action.artifactId);
      return {
        ...state,
        artifacts: {
          ...state.artifacts,
          [action.artifactId]: {
            ...state.artifacts[action.artifactId],
            status: 'satisfied',
          },
        },
        openArtifactId: null,
        openArtifactAppId: null,
        lastActed: { artifactId: action.artifactId, appIds, appNames, verb: 'saved' },
      };
    }

    case 'TOGGLE_CONFIRM': {
      const a = state.artifacts[action.artifactId];
      const next = a.status === 'satisfied' ? 'missing' : 'satisfied';
      const { appIds, appNames } = affected(state, action.artifactId);
      return {
        ...state,
        artifacts: { ...state.artifacts, [a.id]: { ...a, status: next } },
        lastActed:
          next === 'satisfied'
            ? { artifactId: a.id, appIds, appNames, verb: 'confirmed' }
            : { artifactId: null, appIds: [], appNames: [], verb: null },
      };
    }

    case 'NUDGE': {
      const a = state.artifacts[action.artifactId];
      const { appIds, appNames } = affected(state, action.artifactId);
      return {
        ...state,
        artifacts: { ...state.artifacts, [a.id]: { ...a, reminded: true } },
        lastActed: { artifactId: a.id, appIds, appNames, verb: 'nudged' },
      };
    }

    case 'SUBMIT_APP': {
      const app = state.applications.find((a) => a.id === action.appId)!;
      if (remaining(app, state).length > 0) return state;
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.appId ? { ...a, status: 'submitted' as const } : a,
        ),
        expandedAppIds: state.expandedAppIds.filter((id) => id !== action.appId),
        lastActed: {
          artifactId: null,
          appIds: [app.id],
          appNames: [app.name],
          verb: 'submitted',
        },
      };
    }

    case 'OPEN_ARTIFACT':
      return {
        ...state,
        openArtifactId: action.artifactId,
        openArtifactAppId: action.artifactId !== null ? (action.appId ?? null) : null,
      };

    case 'TOGGLE_EXPAND':
      return {
        ...state,
        expandedAppIds: state.expandedAppIds.includes(action.appId)
          ? state.expandedAppIds.filter((id) => id !== action.appId)
          : [...state.expandedAppIds, action.appId],
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.filter,
        lastActed: { artifactId: null, appIds: [], appNames: [], verb: null },
      };
  }
}
