interface Segment { label: string; count: number; color: string; bgColor: string }
interface Props { segments: Segment[]; total: number }

export default function SegmentedBar({ segments, total }: Props) {
  const visible = segments.filter(s => s.count > 0);
  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {visible.map(seg => (
          <div
            key={seg.label}
            className={seg.bgColor}
            style={{ width: `${(seg.count / total) * 100}%` }}
            title={`${seg.label}: ${seg.count}`}
            role="presentation"
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {visible.map(seg => (
          <span key={seg.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`w-2.5 h-2.5 rounded-sm inline-block ${seg.bgColor}`} />
            {seg.count} {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
