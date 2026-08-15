export type ArtifactId =
  | 'answer-major'
  | 'answer-leadership'
  | 'answer-community'
  | 'gpa'
  | 'transcript'
  | 'rec-alvarez'
  | 'rec-chen'
  | 'fafsa';

export type AppId =
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6'
  | 'a7' | 'a8' | 'a9' | 'a10' | 'a11';

export type ArtifactKind = 'do-here' | 'confirm';
export type ArtifactStatus = 'missing' | 'requested' | 'satisfied';
export type ControlKind = 'textarea' | 'select';

export interface ThirdParty {
  name: string;
  role: string;
  requestedDaysAgo: number;
}

export interface Artifact {
  id: ArtifactId;
  label: string;
  kind: ArtifactKind;
  status: ArtifactStatus;
  owner: 'you' | ThirdParty;
  estMinutes?: number;
  control?: ControlKind;
  prompt?: string;
  options?: string[];
  outboundLabel?: string;
  nudgeable?: boolean;
  reminded?: boolean;
}

export type ApplicationStatus = 'in_progress' | 'submitted' | 'awarded';

export interface Application {
  id: AppId;
  name: string;
  sponsor: string;
  amount: number;
  dueInDays?: number;
  needs: ArtifactId[];
  status: ApplicationStatus;
  matchReasons: string[];
}

export type Filter = 'all' | 'needs-you' | 'waiting' | 'ready' | 'closed';
export type ReasonCode = 'closes' | 'unblocks' | 'last-step' | 'quick';

export interface State {
  artifacts: Record<ArtifactId, Artifact>;
  applications: Application[];
  drafts: Record<string, string>;
  openArtifactId: ArtifactId | null;
  openArtifactAppId: AppId | null;
  expandedAppIds: AppId[];
  filter: Filter;
  lastActed: {
    artifactId: ArtifactId | null;
    appIds: AppId[];
    appNames: string[];
    verb: 'saved' | 'confirmed' | 'nudged' | 'submitted' | null;
  };
}
