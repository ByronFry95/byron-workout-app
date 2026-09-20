'use client'

import Link from 'next/link'
import { BarChart3, Check, Dumbbell, List, UserRound } from 'lucide-react'
import './landing.css'

const pageCards = [
  { title: 'Workouts', description: 'Your days, their exercises and when you last did each one.', icon: Dumbbell },
  { title: 'Body Metrics', description: 'Body fat by the US Navy formula with a fast, reactive measurement flow.', icon: UserRound },
  { title: 'Data', description: 'Completed sessions grouped by month with editable set history.', icon: List },
  { title: 'Stats', description: 'Strength and body composition trends across focused timeframes.', icon: BarChart3 },
]

const features = [
  ['Prefilled from last week', "Starting an exercise brings the last session's numbers into the current row."],
  ['One-tap set logging', 'Fixed set rows, a keypad sheet and a clear confirmation target for every set.'],
  ['Session timer with wake lock', 'The clock follows the active session and keeps the screen awake while you train.'],
  ['Undo, not confirm', 'Completing an exercise happens immediately and offers a short undo window.'],
  ['Editable history', 'Correct a mistyped weight or rep directly from the Data page.'],
  ['Syncs across devices', 'Firebase Authentication and Firestore keep your training history available wherever you train.'],
]

function PagePreview({ title }) {
  if (title === 'Workouts') return <><div className="landing-preview-card"><div className="flex items-center justify-between gap-2"><strong>Chest and Back day</strong><span className="bg-[var(--accent)] px-2 py-1 text-[8px] font-extrabold text-white">START DAY</span></div><p className="mt-2 text-[9px] text-[var(--n-600)]">Last completed 17-09-26</p>{['Incline Dumbbell Press', 'Barbell Row', 'Lat Pulldown'].map((name, index) => <div key={name} className="flex justify-between border-t border-[var(--hairline)] py-2 text-[10px]"><span>{name}</span><span className="text-[var(--n-600)]">{index + 3} sets</span></div>)}</div><div className="landing-preview-card flex items-center justify-between"><strong>Arms and Shoulders</strong><span className="text-[9px] text-[var(--n-600)]">5 exercises</span></div><div className="border-2 border-dashed border-[var(--divider)] p-2 text-[10px] font-extrabold">+ Add Day</div></>
  if (title === 'Body Metrics') return <><div className="grid grid-cols-3 gap-px border-2 border-[var(--divider)] bg-[var(--divider)]">{[['Body Fat', '18.4%'], ['Weight', '84.2 kg'], ['Waist', '86 cm']].map(([label, value]) => <div key={label} className="bg-[var(--surface)] p-2"><p className="text-[8px] uppercase text-[var(--n-600)]">{label}</p><p className="num mt-1 text-sm">{value}</p><p className="mt-1 text-[8px] text-[var(--n-600)]">−0.6 since last</p></div>)}</div><p className="mt-3 border-t-2 border-[var(--divider)] pt-2 text-xs font-extrabold">New measurement</p><div className="grid grid-cols-2 gap-2">{['weight', 'waist', 'neck', 'height'].map(field => <div key={field}><p className="mb-1 text-[9px] font-bold">{field}</p><div className="num border-2 border-[var(--divider)] px-2 py-1 text-[11px]">{field === 'weight' ? '84.2' : field === 'waist' ? '86' : field === 'neck' ? '38' : '180'}</div></div>)}</div><div className="mt-3 flex items-center justify-between border-y-2 border-[var(--divider)] py-2"><div><p className="text-[8px] uppercase text-[var(--n-600)]">Estimated body fat</p><p className="num text-2xl">18.4%</p></div><span className="bg-[var(--accent)] px-3 py-2 text-[10px] font-extrabold text-white">SAVE</span></div></>
  if (title === 'Data') return <><p className="border-b-2 border-[var(--divider)] pb-2 text-[9px] font-extrabold tracking-[.12em]">SEPTEMBER 2026</p>{[['Chest and Back day', '17-09-26', '58m', '4,820kg'], ['Legs', '15-09-26', '1h 04m', '7,150kg'], ['Arms and Shoulders', '13-09-26', '47m', '3,640kg']].map(([name, date, time, total], index) => <div key={name} className="border-b-2 border-[var(--divider)] py-3"><div className="grid grid-cols-[1fr_auto_14px] items-center gap-2"><span><strong className="block text-[11px]">{name}</strong><span className="text-[9px] text-[var(--n-600)]">{date}</span></span><span className="text-right text-[8px] uppercase text-[var(--n-600)]">{time}<br />{total} volume</span><span className="text-[var(--accent)]">{index === 0 ? '−' : '+'}</span></div>{index === 0 && <div className="mt-2 border-t border-[var(--hairline)] pt-2 text-[9px]"><p className="font-extrabold">Incline Dumbbell Press</p><p className="mt-1 text-[var(--n-600)]">Set 1 &nbsp; 34kg &nbsp; 10 reps</p><p className="text-[var(--n-600)]">Set 2 &nbsp; 34kg &nbsp; 9 reps</p></div>}</div>)}</>
  return <><div className="grid grid-cols-2 border-2 border-[var(--divider)]"><span className="p-2 text-center text-[9px] font-extrabold uppercase">Body</span><span className="bg-[var(--ink)] p-2 text-center text-[9px] font-extrabold uppercase text-white">Strength</span></div><div className="mt-2 grid grid-cols-5 border-2 border-[var(--divider)] text-center text-[9px] font-extrabold"><span className="p-2">1M</span><span className="bg-[var(--ink)] p-2 text-white">3M</span><span className="p-2">6M</span><span className="p-2">1Y</span><span className="p-2">ALL</span></div><div className="mt-2 grid grid-cols-3 gap-px border-2 border-[var(--divider)] bg-[var(--divider)]">{[['Top set', '34kg'], ['Change', '+6kg'], ['Est. 1RM', '45.3kg']].map(([label, value]) => <div key={label} className="bg-[var(--surface)] p-2"><p className="text-[8px] uppercase text-[var(--n-600)]">{label}</p><p className="num mt-1 text-sm">{value}</p></div>)}</div><div className="mt-2 border-2 border-[var(--divider)] bg-[var(--surface)] p-2"><div className="h-20 border-b-2 border-[var(--divider)]"><svg viewBox="0 0 300 80" className="h-full w-full"><polyline points="8,65 58,55 108,58 158,40 208,32 258,22 292,10" fill="none" stroke="var(--accent)" strokeWidth="3" /><polyline points="8,72 58,67 108,60 158,57 208,48 258,43 292,36" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 4" /></svg></div><div className="mt-2 text-[8px] text-[var(--n-600)]">Incline Press: <strong className="text-[var(--ink)]">34kg</strong> &nbsp; Barbell Row: <strong className="text-[var(--ink)]">70kg</strong></div></div></>
}

function PhonePreview() {
  return (
    <div className="landing-phone">
      <div className="landing-phone-header">
        <div className="flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1"><p className="m-0 text-[9px] font-extrabold uppercase tracking-[.12em] text-[var(--accent)]">20/09/2026</p><p className="m-0 text-[15px] font-extrabold">Chest and Back day</p></div>
          <span className="bg-[var(--accent)] px-3 py-2 text-[9px] font-extrabold text-white">END</span>
        </div>
        <div className="bg-[var(--ink)] p-3 text-white"><div className="flex items-center justify-between text-[8px] uppercase tracking-[.08em] text-[var(--n-300)]"><span>Workout timer</span><span className="bg-[var(--accent)] px-2 py-1 font-extrabold text-white">In progress</span></div><div className="num mt-1 text-3xl">00:42:18</div></div>
      </div>
      <div className="border-b-2 border-[var(--accent)] bg-[var(--accent-100)] p-3"><div className="flex flex-wrap items-center gap-2 text-xs font-semibold"><span>Incline Dumbbell Press</span><span className="bg-white px-2 py-1 text-[8px] font-extrabold text-[var(--accent)]">IN PROGRESS</span></div><div className="mt-2 flex gap-2"><span className="bg-[var(--accent)] px-2 py-1 text-[8px] font-extrabold text-white">UP NEXT</span><span className="border border-[var(--divider)] px-2 py-1 text-[8px] font-extrabold">PR 34KG</span></div><div className="mt-3 border-y-2 border-[var(--divider)]"><div className="grid grid-cols-[22px_1fr_40px_36px_26px] gap-1 py-2 text-[8px] font-extrabold uppercase tracking-wide text-[var(--n-600)]"><span>Set</span><span>Last</span><span>Kg</span><span>Reps</span><span /></div>{[1, 2, 3].map((set, index) => <div key={set} className={`grid grid-cols-[22px_1fr_40px_36px_26px] items-center gap-1 border-t border-[var(--hairline)] py-2 text-[10px] ${index < 2 ? 'opacity-45' : ''}`}><span className="num">{set}</span><span className="text-[9px] text-[var(--n-600)]">32kg / 10</span><span className="num">34</span><span className="num">{index === 2 ? '8' : '10'}</span><span className="flex h-6 items-center justify-center border-2 border-[var(--accent)] text-[var(--accent)]"><Check size={12} /></span></div>)}</div><span className="mt-3 inline-block bg-[var(--accent)] px-3 py-2 text-[9px] font-extrabold text-white">+ ADD SET</span></div>
      <div className="border-b border-[var(--hairline)] p-3 text-xs font-semibold">Barbell Row <span className="ml-2 border border-[var(--divider)] px-2 py-1 text-[8px] font-extrabold">PR 70KG</span></div>
      <div className="p-3 text-xs font-semibold text-[var(--n-600)]">Lat Pulldown</div>
      <div className="grid grid-cols-4 border-t-2 border-[var(--divider)] bg-[var(--surface)] py-2 text-center text-[8px] font-extrabold uppercase tracking-wide text-[var(--n-600)]"><span className="text-[var(--accent)]">⚖<br />Workouts</span><span>◉<br />Metrics</span><span>▤<br />Data</span><span>▥<br />Stats</span></div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="landing-container">
        <nav className="landing-nav">
          <span className="landing-brand">Training App</span>
          <span className="hidden border-l border-[var(--divider)] pl-6 text-xs text-[var(--n-600)] sm:inline">Strength & body composition tracker</span>
          <span className="flex-1" />
          <div className="landing-links flex gap-5 text-[13px] font-semibold"><a href="#pages">Pages</a><a href="#features">Features</a><a href="#stack">Stack</a></div>
          <div className="flex gap-2"><Link href="/login" className="landing-btn landing-btn-secondary">Login</Link><Link href="/login?mode=register" className="landing-btn landing-btn-primary">Register</Link></div>
        </nav>

        <section className="landing-hero">
          <div><p className="landing-kicker">Progressive overload, logged in one tap</p><h1>A training log built for the gym floor, not the desk.</h1><p className="landing-hero-copy">Training App tracks every set against the last time you did it. Open your day, start the session, and each row is already filled with what you lifted last week.</p><p className="landing-hero-copy mt-4">Body composition, raw session data and strength trends live behind the same four tabs. It installs to the home screen and keeps the screen awake while you train.</p><div className="landing-actions"><a href="#pages" className="landing-btn landing-btn-primary">See the pages</a><a href="#features" className="landing-btn landing-btn-secondary">What it does</a></div></div>
          <div className="flex justify-center"><PhonePreview /></div>
        </section>

        <div className="landing-stat-grid"><div className="landing-stat"><strong className="num">1 tap</strong><span className="text-xs text-[var(--n-600)]">to confirm a prefilled set</span></div><div className="landing-stat"><strong className="num">5</strong><span className="text-xs text-[var(--n-600)]">exercises chartable at once</span></div><div className="landing-stat"><strong className="num">44px</strong><span className="text-xs text-[var(--n-600)]">minimum touch target</span></div><div className="landing-stat"><strong className="num">0ms</strong><span className="text-xs text-[var(--n-600)]">screen sleep during a session</span></div></div>

        <section id="pages" className="landing-section"><p className="landing-kicker">The pages</p><h2 className="text-4xl">Four tabs and a session view.</h2><p className="landing-page-copy mt-3 mb-10 max-w-[60ch] text-base">Everything is one level deep. Nothing is behind a menu.</p><div className="landing-page-grid">{pageCards.map(({ title, description, icon: Icon }) => <div key={title}><div className="landing-preview"><Icon size={22} className="text-[var(--accent)]" /><h3 className="mt-5 text-xl">{title}</h3><PagePreview title={title} /></div><h3 className="mt-6 text-xl">{title}</h3><p className="landing-page-copy">{description}</p></div>)}</div></section>

        <section id="features" className="landing-section landing-section-rule"><p className="landing-kicker">Features</p><h2 className="text-4xl mb-10">Built around the set you are about to do.</h2><div className="landing-feature-grid">{features.map(([title, description]) => <div className="landing-feature" key={title}><h3>{title}</h3><p>{description}</p></div>)}</div></section>

        <section id="stack" className="landing-section landing-section-rule"><div className="grid gap-10 md:grid-cols-2"><div><p className="landing-kicker">Under the hood</p><h2 className="text-3xl">Next.js, React and Firestore.</h2><p className="landing-page-copy mt-4">A focused strength tracker with Firebase Authentication, Firestore persistence, Lucide icons, a standalone PWA manifest and lightweight SVG charts.</p></div><div className="border-t-2 border-[var(--divider)]"><div className="flex justify-between border-b border-[var(--hairline)] py-3 text-sm"><strong>Framework</strong><span className="text-[var(--n-600)]">Next.js 14, React 18</span></div><div className="flex justify-between border-b border-[var(--hairline)] py-3 text-sm"><strong>Data</strong><span className="text-[var(--n-600)]">Cloud Firestore</span></div><div className="flex justify-between border-b border-[var(--hairline)] py-3 text-sm"><strong>Auth</strong><span className="text-[var(--n-600)]">Firebase Authentication</span></div><div className="flex justify-between py-3 text-sm"><strong>Icons</strong><span className="text-[var(--n-600)]">Lucide</span></div></div></div></section>
      </div>

      <footer className="landing-footer"><div className="landing-container landing-footer-inner"><p className="mb-7 max-w-[20ch] text-5xl leading-none tracking-[-.03em]">Log the set. Not the app.</p><Link href="/login?mode=register" className="landing-btn bg-white text-[var(--accent)]">Register</Link></div></footer>
    </div>
  )
}
