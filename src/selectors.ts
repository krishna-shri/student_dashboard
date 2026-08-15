import type {
  AppId, Application, Artifact, ArtifactId, ReasonCode, State,
} from './types';

export function remaining(app: Application, s: State): Artifact[] {
  return app.needs
    .map((id) => s.artifacts[id])
    .filter((a) => a.status !== 'satisfied');
}

export function isThirdParty(a: Artifact): boolean {
  return a.owner !== 'you';
}

export function ownerName(a: Artifact): string {
  return a.owner === 'you' ? 'you' : a.owner.name;
}

export function needsYou(app: Application, s: State): boolean {
  if (app.status !== 'in_progress') return false;
  return remaining(app, s).some((a) => a.owner === 'you');
}

export function waitingOnOthers(app: Application, s: State): boolean {
  if (app.status !== 'in_progress') return false;
  const r = remaining(app, s);
  return r.length > 0 && r.every(isThirdParty);
}

export function isReady(app: Application, s: State): boolean {
  return app.status === 'in_progress' && remaining(app, s).length === 0;
}

export function hasWorkYouCanDoHere(app: Application, s: State): boolean {
  return remaining(app, s).some((a) => a.kind === 'do-here');
}

export function blockerLabel(app: Application, s: State): string {
  if (app.status === 'awarded') return 'Awarded';
  if (app.status === 'submitted') return 'Submitted';
  if (isReady(app, s)) return 'Ready to submit';
  if (needsYou(app, s)) return 'Needs you';
  const third = remaining(app, s).find(isThirdParty)!;
  return `Waiting on ${ownerName(third)}`;
}

export interface Task {
  artifactId: ArtifactId;
  appIds: AppId[];
  appNames: string[];
  unblocks: number;
  urgentTier: 0 | 1;
  minRemaining: number;
  estMinutes: number;
  reason: ReasonCode;
  soonestDueInDays: number;
}

export const URGENT_DAYS = 3;
export const MAX_TOP_SLOT_MINUTES = 5;

export function buildTasks(s: State): Task[] {
  const open = s.applications.filter((a) => a.status === 'in_progress');

  return Object.values(s.artifacts)
    .filter(
      (a) =>
        a.kind === 'do-here' &&
        a.status === 'missing' &&
        (a.estMinutes ?? 99) <= MAX_TOP_SLOT_MINUTES,
    )
    .map((artifact) => {
      const apps = open.filter((app) => app.needs.includes(artifact.id));
      const dues = apps.map((app) => app.dueInDays ?? 999);
      const soonest = dues.length ? Math.min(...dues) : 999;
      const minRemaining = apps.length
        ? Math.min(...apps.map((app) => remaining(app, s).length))
        : 99;
      const urgentTier: 0 | 1 = soonest <= URGENT_DAYS ? 0 : 1;
      const unblocks = apps.length;

      const reason: ReasonCode =
        urgentTier === 0 ? 'closes'
        : unblocks > 1 ? 'unblocks'
        : minRemaining === 1 ? 'last-step'
        : 'quick';

      return {
        artifactId: artifact.id,
        appIds: apps.map((a) => a.id),
        appNames: apps.map((a) => a.name),
        unblocks,
        urgentTier,
        minRemaining,
        estMinutes: artifact.estMinutes!,
        reason,
        soonestDueInDays: soonest,
      };
    })
    .filter((t) => t.unblocks > 0);
}

export function taskRank(t: Task): (number | string)[] {
  return [t.urgentTier, -t.unblocks, t.minRemaining, t.estMinutes, t.artifactId];
}

export function rankedTasks(s: State): Task[] {
  return [...buildTasks(s)].sort((a, b) => cmp(taskRank(a), taskRank(b)));
}

export function appRank(app: Application, s: State): (number | string)[] {
  const statusTier = app.status === 'in_progress' ? 0 : 1;
  const readyTier = isReady(app, s) ? 0 : 1;
  const blockedTier = hasWorkYouCanDoHere(app, s) ? 0 : 1;
  return [
    statusTier,
    readyTier,
    blockedTier,
    remaining(app, s).length,
    app.dueInDays ?? 999,
    app.id,
  ];
}

export function rankedApplications(s: State): Application[] {
  return [...s.applications].sort((a, b) => cmp(appRank(a, s), appRank(b, s)));
}

export function cmp(a: (number | string)[], b: (number | string)[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

export function matchesFilter(app: Application, s: State): boolean {
  switch (s.filter) {
    case 'all': return true;
    case 'needs-you': return needsYou(app, s);
    case 'waiting': return waitingOnOthers(app, s);
    case 'ready': return isReady(app, s);
    case 'closed': return app.status !== 'in_progress';
  }
}

export function visibleApplications(s: State): Application[] {
  return rankedApplications(s).filter(
    (app) => matchesFilter(app, s) || s.lastActed.appIds.includes(app.id),
  );
}

export function filterCounts(s: State) {
  const apps = s.applications;
  return {
    all: apps.length,
    'needs-you': apps.filter((a) => needsYou(a, s)).length,
    waiting: apps.filter((a) => waitingOnOthers(a, s)).length,
    ready: apps.filter((a) => isReady(a, s)).length,
    closed: apps.filter((a) => a.status !== 'in_progress').length,
  };
}

export function standing(s: State) {
  const apps = s.applications;
  const awarded = apps.filter((a) => a.status === 'awarded');
  const dues = apps
    .filter((a) => a.status === 'in_progress' && a.dueInDays !== undefined)
    .map((a) => a.dueInDays!);
  return {
    total: apps.length,
    submitted: apps.filter((a) => a.status === 'submitted').length,
    awardedCount: awarded.length,
    awardedAmount: awarded.reduce((n, a) => n + a.amount, 0),
    ready: apps.filter((a) => isReady(a, s)).length,
    needsYou: apps.filter((a) => needsYou(a, s)).length,
    waiting: apps.filter((a) => waitingOnOthers(a, s)).length,
    nextCloses: dues.length ? Math.min(...dues) : null,
  };
}
