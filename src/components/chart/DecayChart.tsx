'use client';
import { useMemo } from 'react';
import {
  Area, ComposedChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { decayCurve, estimateAt, type Dose } from '@/lib/caffeine';
import { HOUR, hm } from '@/lib/time';

const C = { accent: '#4c4fd8', soft: '#e3e3fa', ink: '#17171c', ink3: '#85858e' };

type Props = {
  doses: Dose[];
  start: number;
  end: number;
  bedtime: number;
  now: number;
  variant?: 'full' | 'mini';
};

function MarkerLabel({ viewBox, text, color, align = 'end' }: { viewBox?: { x: number; y: number }; text: string; color: string; align?: 'start' | 'end' }) {
  if (!viewBox) return null;
  const dx = align === 'end' ? -6 : 6;
  return (
    <text x={viewBox.x + dx} y={viewBox.y + 13} textAnchor={align} fill={color} fontSize={12} fontWeight={700}>
      {text}
    </text>
  );
}

function TipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { mid: number } }>; label?: number }) {
  if (!active || !payload?.length || label === undefined) return null;
  return (
    <div className="rounded-2xl bg-ink px-3.5 py-2.5 text-white shadow-card">
      <p className="num text-caption text-white/70">{hm(label)}</p>
      <p className="num text-sub font-bold">예상 {Math.round(payload[0].payload.mid)} mg</p>
    </div>
  );
}

export function DecayChart({ doses, start, end, bedtime, now, variant = 'full' }: Props) {
  const mini = variant === 'mini';
  const data = useMemo(() => decayCurve(doses, start, end, mini ? 10 : 5), [doses, start, end, mini]);
  const max = Math.max(10, ...data.map((d) => d.range[1]));
  const yMax = Math.ceil(max / 50) * 50;
  const ticks = useMemo(() => {
    const out: number[] = [];
    const step = (end - start > 16 * HOUR ? 6 : 3) * HOUR;
    const first = new Date(start);
    first.setMinutes(0, 0, 0);
    let t = first.getTime();
    while (new Date(t).getHours() % (step / HOUR) !== 0) t += HOUR;
    for (; t <= end; t += step) if (t >= start) out.push(t);
    return out;
  }, [start, end]);
  const bedtimeMid = estimateAt(doses, bedtime).mid;
  const showNow = now > start && now < end && Math.abs(now - bedtime) > 0.6 * HOUR;

  return (
    <div role="img" aria-label={`시간에 따른 예상 잔존 카페인 그래프. 취침 예정 ${hm(bedtime)}에 약 ${Math.round(bedtimeMid)} mg.`}>
      <ResponsiveContainer width="100%" height={mini ? 120 : 240}>
        <ComposedChart data={data} margin={{ top: mini ? 16 : 24, right: mini ? 4 : 8, bottom: 0, left: mini ? 4 : 0 }}>
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[start, end]}
            ticks={ticks}
            tickFormatter={(t: number) => hm(t)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: C.ink3, fontSize: 12 }}
            hide={mini}
            allowDataOverflow
          />
          <YAxis
            domain={[0, yMax]}
            ticks={[0, yMax / 2, yMax]}
            axisLine={false}
            tickLine={false}
            width={mini ? 0 : 38}
            tick={{ fill: C.ink3, fontSize: 12 }}
            hide={mini}
          />
          {!mini && <Tooltip content={<TipContent />} cursor={{ stroke: C.ink3, strokeWidth: 1, strokeDasharray: '3 3' }} />}
          <Area
            dataKey="range"
            stroke="none"
            fill={C.soft}
            fillOpacity={mini ? 0.7 : 0.9}
            isAnimationActive={!mini}
            animationDuration={900}
            activeDot={false}
          />
          <Line
            dataKey="mid"
            stroke={C.accent}
            strokeWidth={mini ? 2.5 : 3}
            dot={false}
            activeDot={{ r: 5, fill: '#fff', stroke: C.accent, strokeWidth: 2.5 }}
            strokeLinecap="round"
            animationDuration={900}
            animationEasing="ease-out"
          />
          {showNow && (
            <ReferenceLine
              x={now}
              stroke={C.ink3}
              strokeWidth={1}
              label={mini ? undefined : <MarkerLabel text="지금" color={C.ink3} align="start" />}
            />
          )}
          <ReferenceLine
            x={bedtime}
            stroke={C.ink}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={<MarkerLabel text="취침 예정" color={C.ink} />}
          />
          {!mini &&
            doses
              .filter((d) => d.at >= start && d.at <= end)
              .map((d) => (
                <ReferenceDot key={d.at} x={d.at} y={estimateAt(doses, d.at).mid} r={5} fill="#fff" stroke={C.accent} strokeWidth={2.5} />
              ))}
          <ReferenceDot x={bedtime} y={bedtimeMid} r={mini ? 4.5 : 6} fill={C.accent} stroke="#fff" strokeWidth={2.5} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
