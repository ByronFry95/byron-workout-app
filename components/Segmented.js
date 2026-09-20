export default function Segmented({ options, value, onChange, columns = options.length }) {
  return <div className="grid border-2 border-[var(--divider)]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{options.map(option => <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`min-h-11 text-xs font-bold uppercase tracking-wide ${value === option.value ? 'bg-[var(--ink)] text-white' : 'bg-transparent text-[var(--ink)] hover:bg-[var(--n-300)]'}`}>{option.label}</button>)}</div>
}
