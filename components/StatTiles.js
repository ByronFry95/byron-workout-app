export default function StatTiles({ tiles }) {
  return <div style={{ gridTemplateColumns: `repeat(${Math.max(1, tiles.length)}, minmax(0, 1fr))` }} className="grid gap-px border-2 border-[var(--divider)] bg-[var(--divider)]">{tiles.map(tile => <div key={tile.label} className="bg-[var(--surface)] p-3"><p className="text-xs uppercase text-[var(--n-600)]">{tile.label}</p><p className="num mt-1 text-lg">{tile.value}</p>{tile.detail && <p className="mt-1 text-xs text-[var(--n-600)]">{tile.detail}</p>}</div>)}</div>
}
