'use client';
import { Bar, BarChart, ComposedChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import { dayStartMinutesToHM } from '@/lib/time';

const C = { accent: '#4c4fd8', soft: '#dcdcf8', ink: '#17171c', ink3: '#85858e', fill: '#efeeea' };
const tick = { fill: C.ink3, fontSize: 12 };

type Tip = { active?: boolean; payload?: ReadonlyArray<{ payload?: Record<string, unknown> }> };

export function DailyBarChart({ data }: { data: { label: string; mg: number }[] }) {
  const max = Math.max(100, ...data.map((d) => d.mg));
  const yMax = Math.ceil(max / 100) * 100;
  return (
    <div role="img" aria-label="일별 총 카페인 막대 그래프">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={tick} interval={data.length > 7 ? 1 : 0} />
          <YAxis domain={[0, yMax]} ticks={[0, yMax / 2, yMax]} axisLine={false} tickLine={false} tick={tick} width={38} />
          <Tooltip
            cursor={{ fill: C.fill, radius: 8 }}
            content={({ active, payload }: Tip) =>
              active && payload?.length ? (
                <div className="rounded-2xl bg-ink px-3.5 py-2.5 text-white">
                  <p className="text-caption text-white/70">{String(payload[0].payload?.label)}</p>
                  <p className="num text-sub font-bold">{Math.round(Number(payload[0].payload?.mg))} mg</p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="mg" fill={C.accent} radius={[8, 8, 8, 8]} maxBarSize={22} animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 날짜별 마지막 섭취(●)와 취침 예정(○)을 잇는 dumbbell 그래프. 값은 하루 시작 기준 분. */
export function LastVsBedtimeChart({ data }: { data: { label: string; last: number | null; bed: number | null }[] }) {
  const vals = data.flatMap((d) => [d.last, d.bed]).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  const lo = Math.floor((Math.min(...vals) - 60) / 120) * 120;
  const hi = Math.ceil((Math.max(...vals) + 60) / 120) * 120;
  const ticks: number[] = [];
  const step = hi - lo > 720 ? 240 : 120;
  for (let t = lo; t <= hi; t += step) ticks.push(t);
  const rows = data.map((d) => ({ ...d, span: d.last !== null && d.bed !== null ? [d.last, d.bed] : null }));
  return (
    <div role="img" aria-label="날짜별 마지막 카페인 섭취 시각과 취침 예정 시각 그래프">
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={tick} interval={data.length > 7 ? 1 : 0} />
          <YAxis
            domain={[lo, hi]}
            ticks={ticks}
            tickFormatter={(v: number) => dayStartMinutesToHM(v)}
            axisLine={false}
            tickLine={false}
            tick={tick}
            width={44}
            allowDataOverflow
          />
          <Tooltip
            cursor={{ fill: C.fill, radius: 8 }}
            content={({ active, payload }: Tip) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as unknown as { label: string; last: number | null; bed: number | null };
              return (
                <div className="rounded-2xl bg-ink px-3.5 py-2.5 text-sub text-white">
                  <p className="text-caption text-white/70">{p.label}</p>
                  <p className="num">마지막 섭취 {p.last !== null ? dayStartMinutesToHM(p.last) : '-'}</p>
                  <p className="num">취침 예정 {p.bed !== null ? dayStartMinutesToHM(p.bed) : '-'}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="span" fill={C.soft} barSize={6} radius={3} isAnimationActive={false} />
          <Scatter dataKey="last" fill={C.accent} shape={(p: { cx?: number; cy?: number }) => (p.cx && p.cy ? <circle cx={p.cx} cy={p.cy} r={6} fill={C.accent} /> : <g />)} />
          <Scatter
            dataKey="bed"
            fill="#fff"
            shape={(p: { cx?: number; cy?: number }) => (p.cx && p.cy ? <circle cx={p.cx} cy={p.cy} r={5.5} fill="#fff" stroke={C.ink} strokeWidth={2.5} /> : <g />)}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
