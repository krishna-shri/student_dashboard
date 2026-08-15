import { useState } from 'react';
import type { Artifact, AppId } from '../types';
import type { Dispatch } from '../App';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Clock, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { mergeClasses } from '../lib/utils';

interface Props { artifact: Artifact; dispatch: Dispatch; appId?: AppId }

export default function RequirementRow({ artifact, dispatch, appId }: Props) {
  const isSatisfied = artifact.status === 'satisfied';
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>('idle');

  function handleUpload() {
    setUploadState('uploading');
    setTimeout(() => {
      setUploadState('done');
      dispatch({ type: 'TOGGLE_CONFIRM', artifactId: artifact.id });
    }, 2000);
  }

  if (artifact.kind === 'do-here') {
    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <div className="flex items-center gap-2">
          {isSatisfied
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            : <div className="h-4 w-4 rounded border border-border shrink-0" />}
          <span className={mergeClasses('text-sm', isSatisfied ? 'line-through text-muted-foreground' : 'text-foreground')}>
            {artifact.label}
          </span>
        </div>
        {!isSatisfied && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: 'OPEN_ARTIFACT', artifactId: artifact.id, appId })}
          >
            Answer here
          </Button>
        )}
      </div>
    );
  }

  if (artifact.kind === 'confirm' && artifact.owner === 'you') {
    return (
      <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
        <Checkbox
          id={`confirm-${artifact.id}`}
          checked={isSatisfied}
          onCheckedChange={() => dispatch({ type: 'TOGGLE_CONFIRM', artifactId: artifact.id })}
          aria-label={artifact.label}
        />
        <label
          htmlFor={`confirm-${artifact.id}`}
          className={mergeClasses('text-sm cursor-pointer flex-1', isSatisfied ? 'line-through text-muted-foreground' : 'text-foreground')}
        >
          {artifact.label}
        </label>

        {artifact.outboundLabel && !isSatisfied && uploadState === 'idle' && (
          <Button variant="outline" size="sm" onClick={handleUpload}>
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        )}
        {uploadState === 'uploading' && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading…
          </span>
        )}
        {uploadState === 'done' && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Upload successful
          </span>
        )}
      </div>
    );
  }

  if (artifact.kind === 'confirm' && artifact.owner !== 'you') {
    const owner = artifact.owner;
    return (
      <div className="py-2 border-b border-border last:border-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {isSatisfied
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                : <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
              <span className="text-sm text-foreground">
                {artifact.label} — {owner.name} ({owner.role})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-6">
              {artifact.reminded
                ? 'Reminder sent today'
                : `Requested ${owner.requestedDaysAgo} days ago · no reply`}
            </p>
          </div>
          {artifact.nudgeable && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => { if (!artifact.reminded) dispatch({ type: 'NUDGE', artifactId: artifact.id }); }}
              disabled={!!artifact.reminded}
            >
              Send reminder
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
