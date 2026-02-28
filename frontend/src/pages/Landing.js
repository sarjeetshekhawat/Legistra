import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

/** Intersection Observer — triggers once */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/** Animated counter (0 → target), eased */
function AnimatedCounter({ target, suffix = '', duration = 2200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setCount(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/** Reveal wrapper with staggered delay */
function Reveal({ children, className = '', delay = 0, y = 24 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] ease-[cubic-bezier(.21,1.02,.73,1)] ${
        visible ? 'opacity-100 translate-y-0 blur-0' : `opacity-0 blur-[2px]`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms`, transform: visible ? undefined : `translateY(${y}px)` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

const FEATURES = [
  { icon: <DocumentTextIcon className="w-6 h-6" />, title: 'Smart Document Analysis', desc: 'Advanced AI extracts key information and clauses from any legal document instantly.' },
  { icon: <ShieldCheckIcon className="w-6 h-6" />,  title: 'Risk Detection',           desc: 'Automatically identify high-risk clauses and flag potential legal issues before they escalate.' },
  { icon: <SparklesIcon className="w-6 h-6" />,     title: 'Clause Extraction',         desc: 'Intelligent parsing breaks down complex documents into organized, searchable clause categories.' },
  { icon: <ChartBarIcon className="w-6 h-6" />,     title: 'Visual Analytics',          desc: 'Beautiful dashboards transform complex legal data into clear, actionable insights at a glance.' },
  { icon: <BoltIcon className="w-6 h-6" />,         title: 'AI Summarization',          desc: 'Get concise, accurate summaries of entire documents in seconds — not hours.' },
  { icon: <ArrowPathIcon className="w-6 h-6" />,    title: 'Lightning Fast',            desc: 'Process hundreds of documents with lightning-fast AI analysis, typically under 30 seconds each.' },
];

const STEPS = [
  { num: '01', title: 'Upload Document',        desc: 'Drag-and-drop your contract in PDF, DOCX, or TXT format. Batch uploads supported.', gradient: 'from-blue-500 to-cyan-400' },
  { num: '02', title: 'AI Analyzes Content',     desc: 'Our advanced ML engine processes your document — extracting clauses and assessing risks in real-time.', gradient: 'from-violet-500 to-blue-400' },
  { num: '03', title: 'Get Insights & Reports',  desc: 'Receive comprehensive analysis with interactive dashboards, summaries, and one-click PDF export.', gradient: 'from-purple-500 to-violet-400' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen',      role: 'Law Student',        text: 'Legistra helped me analyze 50+ contracts in hours instead of weeks. The risk detection is incredibly accurate.',  avatar: '👩‍💼' },
  { name: 'Marcus Johnson',  role: 'Corporate Attorney', text: 'The AI insights are precise and save us substantial billable hours on contract review.',                         avatar: '👨‍⚖️' },
  { name: 'Priya Patel',     role: 'Startup Founder',    text: 'As a startup, we needed fast contract analysis without breaking the bank. Legistra is a game-changer.',           avatar: '👩‍💻' },
];

const BENEFITS = [
  { icon: '⚡', title: 'Save Hours of Work',  desc: 'Analyze contracts in minutes, not days. Instant insights on key clauses and risk flags.' },
  { icon: '🛡️', title: 'Reduce Legal Risks', desc: 'Advanced AI catches potential issues and red flags you might miss in manual review.' },
  { icon: '💡', title: 'Intuitive Interface',  desc: 'No legal background needed. Clean, modern UI designed for everyone.' },
  { icon: '🚀', title: 'Instant Results',      desc: 'Process documents in seconds with real-time analysis and comprehensive reports.' },
];

/* ═══════════════════════════════════════════════════════════
   INLINE KEYFRAMES (injected once)
   ═══════════════════════════════════════════════════════════ */

const KEYFRAMES = `
@keyframes float{0%,100%{transform:perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(0)}50%{transform:perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(-14px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes glowPulse{0%,100%{opacity:.25}50%{opacity:.5}}
@keyframes heroFadeUp{from{opacity:0;transform:translateY(28px) blur(4px)}to{opacity:1;transform:translateY(0) blur(0)}}
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  /* staggered hero entrance */
  const heroDelay = (i) => ({ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(28px)', transition: `all 0.8s cubic-bezier(.21,1.02,.73,1) ${200 + i * 120}ms` });

  return (
    <div className="min-h-screen bg-[#04070f] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">

      {/* Inject keyframes */}
      <style>{KEYFRAMES}</style>

      {/* ───── Ambient background ───── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Gradient mesh orbs */}
        <div className="absolute top-[-25%] left-[-12%] w-[800px] h-[800px] rounded-full bg-blue-600/[0.06] blur-[140px]" style={{ animation: 'gradientShift 12s ease infinite', backgroundSize: '200% 200%' }} />
        <div className="absolute bottom-[-15%] right-[-12%] w-[700px] h-[700px] rounded-full bg-purple-600/[0.07] blur-[140px]" style={{ animation: 'gradientShift 15s ease infinite 3s', backgroundSize: '200% 200%' }} />
        <div className="absolute top-[35%] left-[55%] w-[500px] h-[500px] rounded-full bg-violet-500/[0.04] blur-[120px]" style={{ animation: 'gradientShift 18s ease infinite 6s', backgroundSize: '200% 200%' }} />
        <div className="absolute top-[60%] left-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #04070f 80%)' }} />
      </div>

      {/* ═══════ NAV ═══════ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        isScrolled
          ? 'bg-[#04070f]/70 backdrop-blur-2xl border-b border-white/[0.05] shadow-2xl shadow-black/30'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-[68px]">
          <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Legistra
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/[0.04]">
              Sign In
            </button>
            <button onClick={() => navigate('/register')}
              className="relative px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="min-h-screen flex items-center pt-20 pb-24 relative">
        {/* Hero-specific glow behind dashboard */}
        <div className="absolute top-[15%] right-[5%] w-[500px] h-[500px] bg-blue-600/[0.08] rounded-full blur-[150px] pointer-events-none" style={{ animation: 'glowPulse 6s ease-in-out infinite' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-violet-600/[0.06] rounded-full blur-[120px] pointer-events-none" style={{ animation: 'glowPulse 8s ease-in-out infinite 2s' }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 xl:gap-20 items-center">

            {/* ── Left ── */}
            <div className="space-y-7">
              {/* Badge */}
              <div style={heroDelay(0)} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/[0.06] backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
                </span>
                <span className="text-[13px] font-medium text-blue-300 tracking-wide">AI-Powered Legal Analysis</span>
              </div>

              {/* Headline */}
              <h1 style={heroDelay(1)} className="text-[3.25rem] sm:text-[3.75rem] lg:text-[4.5rem] font-extrabold leading-[1.06] tracking-[-0.025em]">
                Analyze Legal{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'gradientShift 6s ease infinite' }}>
                    Documents
                  </span>
                  {/* underline glow */}
                  <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-gradient-to-r from-blue-500/60 via-violet-500/60 to-purple-500/60 blur-[1px]" />
                </span>
                <br />
                in Seconds
              </h1>

              {/* Subtitle */}
              <p style={heroDelay(2)} className="text-[1.05rem] text-gray-400/90 leading-[1.7] max-w-md">
                Upload contracts, detect risks, and extract key clauses instantly with advanced NLP. Built for law students, lawyers, and businesses.
              </p>

              {/* CTA Buttons */}
              <div style={heroDelay(3)} className="flex flex-col sm:flex-row gap-4 pt-1">
                <button onClick={() => navigate('/register')}
                  className="group relative px-8 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden">
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }} />
                  <span className="relative">Get Started Free</span>
                  <ChevronRightIcon className="w-4 h-4 relative transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button onClick={() => navigate('/login')}
                  className="px-8 py-3.5 rounded-xl font-semibold text-[15px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 transform hover:-translate-y-0.5">
                  View Demo
                </button>
              </div>

              {/* Stats */}
              <div style={heroDelay(4)} className="flex gap-10 pt-7 border-t border-white/[0.05]">
                {[
                  { val: 500,  suf: '+',   label: 'Documents Analyzed', color: 'from-blue-400 to-blue-300' },
                  { val: 95,   suf: '%',   label: 'Faster Review',      color: 'from-violet-400 to-violet-300' },
                  { val: 99,   suf: '.8%', label: 'Accuracy Rate',      color: 'from-cyan-400 to-cyan-300' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className={`text-[1.75rem] font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                      <AnimatedCounter target={s.val} suffix={s.suf} />
                    </div>
                    <div className="text-[11px] text-gray-500/80 mt-1 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right — Dashboard with 3D tilt + float ── */}
            <div className="relative hidden lg:block" style={heroDelay(2)}>
              {/* Multi-layer glow behind card */}
              <div className="absolute -inset-6 rounded-3xl pointer-events-none" style={{ animation: 'glowPulse 5s ease-in-out infinite' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-violet-500/15 to-purple-600/20 rounded-3xl blur-3xl" />
              </div>

              {/* 3D tilted card with float animation */}
              <div
                className="relative rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 shadow-2xl shadow-black/50"
                style={{ animation: 'float 6s ease-in-out infinite', transformStyle: 'preserve-3d' }}
              >
                {/* Title bar dots */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  <span className="ml-3 text-[11px] text-gray-500/70 font-mono tracking-wider">legistra — analysis dashboard</span>
                </div>

                {/* Chart */}
                <div className="rounded-xl bg-[#080d1c] border border-white/[0.04] p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-gray-400 tracking-wide">Risk Distribution</span>
                    <span className="text-[10px] text-emerald-400/70 font-medium">● Live</span>
                  </div>
                  <div className="h-32 flex items-end gap-2.5 px-1">
                    {[40, 72, 55, 88, 65, 45, 78, 60].map((h, i) => (
                      <div key={i} className="flex-1 relative group cursor-default">
                        <div
                          className="rounded-t transition-all duration-300 group-hover:brightness-130 group-hover:shadow-lg"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, ${i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4'}, ${i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#a78bfa' : '#67e8f9'})`,
                            opacity: 0.9,
                            transformOrigin: 'bottom',
                            animation: `barGrow 0.8s cubic-bezier(.21,1.02,.73,1) ${i * 80 + 500}ms both`,
                            boxShadow: `0 0 12px ${i % 3 === 0 ? 'rgba(59,130,246,0.3)' : i % 3 === 1 ? 'rgba(139,92,246,0.3)' : 'rgba(6,182,212,0.3)'}`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { val: '47',   label: 'Clauses Found', color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
                    { val: '8',    label: 'High Risk',      color: 'text-orange-400',  glow: 'shadow-orange-500/10' },
                    { val: '2.3s', label: 'Process Time',  color: 'text-blue-400',    glow: 'shadow-blue-500/10' },
                  ].map((m, i) => (
                    <div key={i} className={`rounded-lg bg-[#080d1c] border border-white/[0.04] p-3 text-center transition-shadow hover:shadow-lg ${m.glow}`}>
                      <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
                      <div className="text-[9px] text-gray-500/70 mt-0.5 uppercase tracking-widest">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="py-10 border-y border-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 mb-5">Trusted by students and professionals worldwide</p>
          <div className="flex justify-center flex-wrap gap-3">
            {['👨‍🎓 Students', '⚖️ Attorneys', '🏢 Enterprises', '🚀 Startups'].map((t, i) => (
              <div key={i} className="px-5 py-2 rounded-lg border border-white/[0.05] bg-white/[0.015] text-[13px] text-gray-500 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-20">
            <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-[0.2em] mb-4">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Everything You Need</h2>
            <p className="mt-5 text-[1.05rem] text-gray-500/90 max-w-xl mx-auto leading-relaxed">Analyze legal documents faster and smarter with AI-powered tools designed for precision.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="group relative p-7 rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm hover:bg-white/[0.04] hover:border-blue-500/20 transition-all duration-500 h-full overflow-hidden">
                  {/* Hover shine */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), rgba(59,130,246,0.06), transparent 60%)' }}
                  />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/[0.04] flex items-center justify-center text-blue-400 group-hover:text-violet-400 group-hover:shadow-lg group-hover:shadow-violet-500/10 transition-all duration-500 mb-5">
                      {f.icon}
                    </div>
                    <h3 className="text-[15px] font-semibold mb-2 tracking-tight">{f.title}</h3>
                    <p className="text-[13px] text-gray-500/80 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <Reveal className="text-center mb-20">
            <p className="text-xs font-semibold text-violet-400/80 uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Three Simple Steps</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 130}>
                <div className="relative group h-full">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.gradient} opacity-[0.04] group-hover:opacity-[0.1] transition-opacity duration-700`} />
                  <div className="relative rounded-2xl border border-white/[0.06] group-hover:border-white/[0.1] p-8 h-full flex flex-col transition-all duration-500">
                    <span className={`text-6xl font-black bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent opacity-20 leading-none`}>{s.num}</span>
                    <h3 className="text-xl font-bold mt-5 mb-3 tracking-tight">{s.title}</h3>
                    <p className="text-[13px] text-gray-500/80 leading-relaxed flex-1">{s.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-gray-700/50">
                      <ChevronRightIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRODUCT SHOWCASE ═══════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-20">
            <p className="text-xs font-semibold text-cyan-400/80 uppercase tracking-[0.2em] mb-4">Product</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Visual Analytics Dashboard</h2>
            <p className="mt-5 text-[1.05rem] text-gray-500/90 max-w-xl mx-auto leading-relaxed">Transform complex legal data into actionable insights with interactive charts and reports.</p>
          </Reveal>

          <Reveal>
            <div className="relative group" style={{ perspective: '1200px' }}>
              {/* Outer glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-purple-500/30 blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-700" />

              <div className="relative rounded-2xl border border-white/[0.06] bg-[#080d1c] p-7 md:p-10 transition-transform duration-700 group-hover:rotate-x-1">
                <div className="grid md:grid-cols-3 gap-5">
                  {/* Risk bars */}
                  <div className="rounded-xl bg-[#0a1020] border border-white/[0.04] p-5">
                    <h3 className="text-[12px] font-semibold text-gray-300/90 mb-5 tracking-wide">Risk Distribution</h3>
                    {[
                      { label: 'Critical', pct: 15, color: 'bg-red-500',     glow: '0 0 8px rgba(239,68,68,0.3)' },
                      { label: 'High',     pct: 28, color: 'bg-orange-500',  glow: '0 0 8px rgba(249,115,22,0.3)' },
                      { label: 'Medium',   pct: 32, color: 'bg-yellow-500',  glow: '0 0 8px rgba(234,179,8,0.3)' },
                      { label: 'Low',      pct: 25, color: 'bg-emerald-500', glow: '0 0 8px rgba(16,185,129,0.3)' },
                    ].map((r, i) => (
                      <div key={i} className="mb-4">
                        <div className="flex justify-between text-[11px] text-gray-500/70 mb-2">
                          <span>{r.label}</span><span className="font-medium">{r.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%`, boxShadow: r.glow, transition: 'width 1.5s cubic-bezier(.21,1.02,.73,1)' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clause breakdown */}
                  <div className="rounded-xl bg-[#0a1020] border border-white/[0.04] p-5">
                    <h3 className="text-[12px] font-semibold text-gray-300/90 mb-5 tracking-wide">Clause Breakdown</h3>
                    {[
                      { label: 'Liability',      n: '4', dot: 'bg-blue-400' },
                      { label: 'Payment Terms',   n: '3', dot: 'bg-violet-400' },
                      { label: 'Confidentiality', n: '2', dot: 'bg-cyan-400' },
                      { label: 'Indemnification', n: '2', dot: 'bg-purple-400' },
                      { label: 'Termination',     n: '1', dot: 'bg-pink-400' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} style={{ boxShadow: `0 0 6px currentColor` }} />
                          <span className="text-[12px] text-gray-400/80">{c.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-300/90">{c.n}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl bg-[#0a1020] border border-white/[0.04] p-5 flex flex-col">
                    <h3 className="text-[12px] font-semibold text-gray-300/90 mb-4 tracking-wide">AI Summary</h3>
                    <p className="text-[12px] text-gray-400/70 leading-[1.7] flex-1">
                      Service agreement containing 47 identifiable clauses across 6 categories. Key risks detected in liability limitation and payment terms sections. Confidentiality obligations require specific attention before execution.
                    </p>
                    <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px]">
                      <span className="text-gray-600">Processed in 2.3s</span>
                      <span className="text-emerald-400/80 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ BENEFITS ═══════ */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-600/[0.012] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <p className="text-xs font-semibold text-purple-400/80 uppercase tracking-[0.2em] mb-4">Benefits</p>
              <h2 className="text-4xl font-bold mb-10 tracking-tight">Why Choose Legistra?</h2>
              <div className="space-y-8">
                {BENEFITS.map((b, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="text-2xl mt-0.5 transition-transform duration-300 group-hover:scale-110">{b.icon}</div>
                    <div>
                      <h3 className="font-semibold text-[15px] mb-1.5 group-hover:text-blue-300 transition-colors duration-300 tracking-tight">{b.title}</h3>
                      <p className="text-[13px] text-gray-500/80 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm p-12 text-center relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/[0.08] rounded-full blur-[60px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/[0.08] rounded-full blur-[60px]" />
                <div className="relative">
                  <div className="text-7xl mb-5">📊</div>
                  <h3 className="text-4xl font-bold mb-3 tracking-tight">
                    <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                      <AnimatedCounter target={10} suffix="x" />
                    </span>{' '}Faster
                  </h3>
                  <p className="text-gray-500/80 text-sm">Average contract analysis time reduced from 2 hours to 12 minutes.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-20">
            <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-[0.2em] mb-4">Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">What Users Say</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  onClick={() => setActiveTestimonial(i)}
                  className={`cursor-pointer p-7 rounded-2xl border transition-all duration-500 h-full flex flex-col ${
                    activeTestimonial === i
                      ? 'bg-gradient-to-br from-blue-600/[0.06] to-violet-600/[0.06] border-blue-500/25 shadow-xl shadow-blue-500/[0.08] scale-[1.02]'
                      : 'border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08]'
                  }`}
                >
                  <p className="text-[13px] text-gray-300/90 italic leading-[1.7] flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.05]">
                    <span className="text-2xl">{t.avatar}</span>
                    <div>
                      <div className="font-semibold text-[13px]">{t.name}</div>
                      <div className="text-[11px] text-gray-500/70">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-32 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] right-[8%] w-[600px] h-[600px] bg-purple-600/[0.05] rounded-full blur-[130px]" style={{ animation: 'glowPulse 7s ease-in-out infinite' }} />
          <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-blue-600/[0.05] rounded-full blur-[130px]" style={{ animation: 'glowPulse 9s ease-in-out infinite 3s' }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <Reveal>
            <h2 className="text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-[-0.025em]">
              Start Analyzing Your{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'gradientShift 6s ease infinite' }}>Documents</span>{' '}
              Today
            </h2>
            <p className="mt-7 text-[1.05rem] text-gray-400/85 max-w-lg mx-auto leading-relaxed">
              Join law students, attorneys, and businesses saving hours on contract analysis every week.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <button onClick={() => navigate('/register')}
                className="relative px-10 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-blue-600/25 hover:shadow-blue-500/40 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }} />
                <span className="relative">Get Started Free</span>
              </button>
              <button onClick={() => navigate('/login')}
                className="px-10 py-4 rounded-xl font-semibold text-lg border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 transform hover:-translate-y-0.5">
                View Demo
              </button>
            </div>

            <p className="mt-7 text-[12px] text-gray-600/80 tracking-wide">No credit card required · Start analyzing in 30 seconds</p>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.03] bg-[#030508] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-3">Legistra</div>
              <p className="text-[13px] text-gray-600/80 leading-relaxed">AI-powered legal document analysis for everyone.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact'] },
              { title: 'Legal',   links: ['Privacy', 'Terms', 'GitHub'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-[12px] font-semibold text-gray-400 mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#top" className="text-[13px] text-gray-600/70 hover:text-gray-300 transition-colors duration-300">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.03] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-gray-600/60">© {new Date().getFullYear()} Legistra. All rights reserved.</p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s, i) => (
                <a key={i} href="#top" className="text-[11px] text-gray-600/60 hover:text-gray-400 transition-colors duration-300">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
