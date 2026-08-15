import type { State } from '../types';
import { standing } from '../selectors';
import SegmentedBar from './SegmentedBar';

interface Props { state: State }

export default function StatusStrip({ state }: Props) {
  const st = standing(state);

  const parts: string[] = [];
  if (st.submitted > 0)    parts.push(`${st.submitted} of ${st.total} submitted`);
  if (st.awardedCount > 0) parts.push(`$${st.awardedAmount.toLocaleString()} awarded`);
  if (st.needsYou > 0)     parts.push(`${st.needsYou} need you`);
  if (st.waiting > 0)      parts.push(`${st.waiting} waiting on ${st.waiting === 1 ? 'Mr. Alvarez' : 'others'}`);
  if (st.nextCloses !== null) parts.push(`next closes in ${st.nextCloses} days`);

  const segments = [
    { label: 'awarded',           count: st.awardedCount, color: 'text-primary',       bgColor: 'bg-primary' },
    { label: 'submitted',         count: st.submitted,    color: 'text-muted-foreground', bgColor: 'bg-muted-foreground' },
    { label: 'ready to submit',   count: st.ready,        color: 'text-emerald-500',    bgColor: 'bg-emerald-500' },
    { label: 'need you',          count: st.needsYou,     color: 'text-blue-500',       bgColor: 'bg-blue-500' },
    { label: 'waiting on others', count: st.waiting,      color: 'text-amber-500',      bgColor: 'bg-amber-500' },
  ];

  return (
    <section aria-labelledby="strip-heading" className="bg-card border border-border rounded-xl p-4">
      <h2 id="strip-heading" className="sr-only">Where you stand</h2>
      <p className="text-sm text-foreground mb-3">{parts.join(' · ')}</p>
      <SegmentedBar segments={segments} total={st.total} />
    </section>
  );
}
