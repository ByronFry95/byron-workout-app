'use client'

// Each series is scaled to its own min/max range so mixed units (kg/cm) or very
// different exercise loads can share one compact chart without a numeric y-axis.
export default function TrendLineChart({ series, height = 170, emptyMessage = 'No data yet.', normalize = false }) {
  const visibleSeries = series.filter(s => s.points.length > 0)

  if (visibleSeries.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    )
  }

  const width = 600
  const padding = { top: 14, right: 12, bottom: 22, left: 12 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const allX = visibleSeries.flatMap(s => s.points.map(p => p.x))
  const xMin = Math.min(...allX)
  const xMax = Math.max(...allX)
  const xRange = xMax - xMin || 1
  const scaleX = (x) => padding.left + ((x - xMin) / xRange) * plotWidth

  const allY = visibleSeries.flatMap(s => s.points.map(p => p.y))
  const sharedMin = Math.min(...allY)
  const sharedMax = Math.max(...allY)
  const sharedRange = sharedMax - sharedMin || 1

  const preparedSeries = visibleSeries.map(s => {
    const yValues = s.points.map(p => p.y)
    const yMin = normalize ? Math.min(...yValues) : sharedMin
    const yMax = normalize ? Math.max(...yValues) : sharedMax
    const yRange = yMax - yMin || 1

    const coords = s.points.map(p => {
      const cy = padding.top + (1 - (p.y - yMin) / yRange) * plotHeight
      return { cx: scaleX(p.x), cy }
    })

    return { ...s, coords }
  })

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {[0.25, 0.5, 0.75].map(fraction => (
          <line
            key={fraction}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotHeight * fraction}
            y2={padding.top + plotHeight * fraction}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {preparedSeries.map(s => (
          <polyline
            key={s.id}
            points={s.coords.map(c => `${c.cx},${c.cy}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeDasharray={s.dash || undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {preparedSeries.map(s => (
          s.coords.map((c, index) => (
            <circle key={`${s.id}-${index}`} cx={c.cx} cy={c.cy} r="3" fill={s.color} />
          ))
        ))}

        <text x={padding.left} y={height - 4} fontSize="10" fill="#94a3b8">
          {new Date(xMin).toLocaleDateString('en-GB')}
        </text>
        {!normalize && [sharedMax, (sharedMax + sharedMin) / 2, sharedMin].map((value, index) => (
          <text key={value} x={width - padding.right} y={padding.top + (plotHeight * index) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
            {Number(value).toFixed(0)}
          </text>
        ))}
        <text x={width - padding.right} y={height - 4} fontSize="10" fill="#94a3b8" textAnchor="end">
          {new Date(xMax).toLocaleDateString('en-GB')}
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {preparedSeries.map(s => {
          const latest = s.points[s.points.length - 1]
          return (
            <span key={s.id} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}: <strong className="text-slate-700">{s.formatValue ? s.formatValue(latest.y) : latest.y}</strong>
            </span>
          )
        })}
      </div>
    </div>
  )
}
