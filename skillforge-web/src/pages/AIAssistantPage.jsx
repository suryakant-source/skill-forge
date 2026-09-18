/**
 * ============================================================================
 * AIAssistantPage.jsx - Groq-Powered AI Career Mentor UI
 * ============================================================================
 *
 * LAYOUT:
 *   Header     → Title + Groq badge + status pill
 *   Quick Pills → 4 preset career prompts (click to prefill textarea)
 *   Input Area → Textarea + "Generate with Groq ⚡" button
 *   Results    → Structured AIResponse rendered in glassmorphism cards:
 *                  - Current Level Summary
 *                  - Skill Gaps (red pills)
 *                  - Recommended Topics (blue pills)
 *                  - Weekly Plan (timeline cards)
 *                  - Suggested Projects (project cards)
 *                  - Estimated Timeline
 *                  - Copy Roadmap button
 *
 * DATA FLOW:
 *   User types query → click "Generate with Groq ⚡"
 *   → useAIRecommendation().mutate(query)
 *   → POST /api/ai/recommend { query }
 *   → Backend calls Groq Cloud (Llama 3.3 70B) with user context from DB
 *   → Response parsed into AIResponse JSON
 *   → Results rendered here in real-time
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import { useAIRecommendation, extractAIData } from '../hooks/useAI';
import toast from 'react-hot-toast';

// ─── Quick prompt presets ─────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  {
    emoji: '🎯',
    label: '6-Month Roadmap to Senior Spring Boot & Microservices',
    query: 'Create a detailed 6-month roadmap to become a Senior Spring Boot & Microservices Architect. Include what to learn each month, key projects to build, and how to measure my progress.',
  },
  {
    emoji: '⚡',
    label: 'Full-Stack Developer: What skills am I missing?',
    query: 'Analyze my current skills and tell me exactly what I am missing to become a job-ready Full Stack Developer. Be specific about which gaps to close first and why.',
  },
  {
    emoji: '🛠️',
    label: 'Top 3 Portfolio Projects to crack FAANG/Product Companies',
    query: 'Suggest the top 3 portfolio projects I should build right now to maximize my chances of getting hired at a product company or FAANG. Include the tech stack and unique features for each.',
  },
  {
    emoji: '☁️',
    label: 'Cloud & Docker Roadmap for Backend Engineers',
    query: 'I am a backend Java developer. Create a practical roadmap for learning Docker, Kubernetes, AWS, and cloud-native architecture. Include a weekly study plan and hands-on projects.',
  },
];

// ─── Glassmorphism card wrapper ───────────────────────────────────────────────
const GlassCard = ({ children, style = {}, accent = 'purple' }) => {
  const accentColors = {
    purple: 'rgba(139, 92, 246, 0.2)',
    cyan:   'rgba(6, 182, 212, 0.2)',
    green:  'rgba(16, 185, 129, 0.2)',
    red:    'rgba(239, 68, 68, 0.2)',
    amber:  'rgba(245, 158, 11, 0.2)',
  };
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${accentColors[accent] || accentColors.purple}`,
        borderRadius: '18px',
        padding: '24px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Pill badge component ─────────────────────────────────────────────────────
const Pill = ({ children, color = 'purple' }) => {
  const colors = {
    purple: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', text: '#c4b5fd' },
    cyan:   { bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.4)',  text: '#67e8f9' },
    red:    { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)', text: '#fca5a5' },
    green:  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)',text: '#6ee7b7' },
    amber:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)',text: '#fcd34d' },
  };
  const c = colors[color] || colors.purple;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 14px',
        borderRadius: '999px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: '0.8125rem',
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
};

// ─── Section heading inside result cards ──────────────────────────────────────
const ResultSection = ({ icon, title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3
      style={{
        margin: '0 0 14px',
        fontSize: '1rem',
        fontWeight: 700,
        color: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const AIAssistantPage = () => {
  const [query, setQuery] = useState('');
  const { mutate, isPending, data: mutationData, reset } = useAIRecommendation();
  const textareaRef = useRef(null);

  // Unwrap ApiResponse envelope: { success, message, data: AIResponse }
  const aiData = extractAIData(mutationData);

  // ── Handle quick prompt click: prefill textarea ───────────────────────────
  const handleQuickPrompt = (promptQuery) => {
    setQuery(promptQuery);
    textareaRef.current?.focus();
  };

  // ── Trigger Groq AI generation ────────────────────────────────────────────
  const handleGenerate = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Please enter a question first');
      return;
    }
    mutate(trimmed);
  };

  // ── Copy roadmap to clipboard ─────────────────────────────────────────────
  const handleCopy = () => {
    if (!aiData) return;
    const text = [
      `=== SkillForge AI Roadmap (Groq Cloud LPU™) ===\n`,
      `CURRENT LEVEL:\n${aiData.currentLevel}\n`,
      `SKILL GAPS:\n${aiData.skillGaps?.map((s) => `• ${s}`).join('\n')}\n`,
      `RECOMMENDED TOPICS:\n${aiData.recommendedTopics?.map((t) => `• ${t}`).join('\n')}\n`,
      `WEEKLY PLAN:\n${aiData.weeklyPlan}\n`,
      `SUGGESTED PROJECTS:\n${aiData.suggestedProjects?.map((p) => `• ${p}`).join('\n')}\n`,
      `ESTIMATED TIMELINE:\n${aiData.estimatedTimeline}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Roadmap copied to clipboard! 📋');
    });
  };

  // ── Restart / new query ───────────────────────────────────────────────────
  const handleReset = () => {
    reset();
    setQuery('');
  };

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.875rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI Career Mentor & Roadmap Architect
          </h1>

          {/* ── Groq Status Badge ──────────────────────────────────────────── */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '999px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              color: '#22d3ee',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
              animation: 'glow 2.5s ease-in-out infinite alternate',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>⚡</span>
            Powered by Groq Cloud LPU™
          </span>
        </div>

        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9375rem' }}>
          Instant career roadmaps powered by Groq LPU™ Ultra-Fast Cloud Inference.
          Your skills, goals, and progress — fully analyzed in under 2 seconds.
        </p>
      </div>

      {/* ── Quick Prompt Pills ───────────────────────────────────────────────── */}
      {!aiData && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(p.query)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                background: 'rgba(139, 92, 246, 0.08)',
                color: '#a78bfa',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Query Input Area ─────────────────────────────────────────────────── */}
      {!aiData && (
        <GlassCard accent="purple" style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '8px',
              }}
            >
              🧠 Ask Your Groq AI Career Mentor
            </label>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your Groq AI Career Mentor anything about your career goals, interview prep, or technical skill gaps..."
              rows={4}
              maxLength={1000}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#f1f5f9',
                fontSize: '0.9375rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(139, 92, 246, 0.7)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(139, 92, 246, 0.35)'; }}
            />
            <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '0.75rem', color: query.length > 900 ? '#f87171' : '#475569' }}>
              {query.length}/1000
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isPending || !query.trim()}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: isPending || !query.trim()
                ? 'rgba(139, 92, 246, 0.3)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isPending || !query.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.25s',
              boxShadow: isPending || !query.trim() ? 'none' : '0 8px 30px rgba(139, 92, 246, 0.35)',
            }}
            onMouseEnter={(e) => {
              if (!isPending && query.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isPending || !query.trim() ? 'none' : '0 8px 30px rgba(139, 92, 246, 0.35)';
            }}
          >
            {isPending ? (
              <>
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2.5px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Groq is processing...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                Generate with Groq
              </>
            )}
          </button>

          {/* Loading indicator text */}
          {isPending && (
            <div
              style={{
                marginTop: '12px',
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: '#64748b',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              ⚡ Groq Cloud AI is analyzing your profile... usually done in 1-2 seconds
            </div>
          )}
        </GlassCard>
      )}

      {/* ── AI Results ───────────────────────────────────────────────────────── */}
      {aiData && (
        <div style={{ animation: 'fadeSlideIn 0.4s ease both' }}>

          {/* Result Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>
                ⚡ Your Personalized Groq AI Roadmap
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                Generated by Groq Cloud LPU™ • Tailored to your profile
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#22d3ee',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; }}
              >
                📋 Copy Roadmap
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
              >
                🔄 New Query
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>

            {/* Current Level */}
            <GlassCard accent="cyan">
              <ResultSection icon="🎯" title="Executive Level Summary">
                <p
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: '#e2e8f0',
                    lineHeight: 1.7,
                    padding: '14px 18px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '12px',
                    borderLeft: '4px solid #06b6d4',
                  }}
                >
                  {aiData.currentLevel}
                </p>
              </ResultSection>
            </GlassCard>

            {/* Skill Gaps + Recommended Topics (side by side) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              <GlassCard accent="red">
                <ResultSection icon="🔴" title="Skill Gaps to Close">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {aiData.skillGaps?.map((gap, i) => (
                      <Pill key={i} color="red">{gap}</Pill>
                    ))}
                  </div>
                </ResultSection>
              </GlassCard>

              <GlassCard accent="cyan">
                <ResultSection icon="📘" title="Topics to Study Next">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {aiData.recommendedTopics?.map((topic, i) => (
                      <Pill key={i} color="cyan">{topic}</Pill>
                    ))}
                  </div>
                </ResultSection>
              </GlassCard>
            </div>

            {/* Weekly Plan */}
            <GlassCard accent="purple">
              <ResultSection icon="📅" title="Week-by-Week Learning Plan">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {aiData.weeklyPlan?.split(/\\n|\n/).map(s => s.trim()).filter(Boolean).map((week, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(139, 92, 246, 0.07)',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                        animation: `fadeSlideIn 0.4s ${i * 0.07}s both`,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {i + 1}
                      </span>
                      <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {week}
                      </p>
                    </div>
                  ))}
                </div>
              </ResultSection>
            </GlassCard>

            {/* Suggested Projects */}
            <GlassCard accent="green">
              <ResultSection icon="🛠️" title="Real-World Projects to Build">
                <div style={{ display: 'grid', gap: '10px' }}>
                  {aiData.suggestedProjects?.map((project, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.07)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        animation: `fadeSlideIn 0.4s ${i * 0.1}s both`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1.2rem',
                          flexShrink: 0,
                        }}
                      >
                        {['🚀', '⚙️', '🌐', '🔧', '💡'][i % 5]}
                      </span>
                      <span style={{ color: '#a7f3d0', fontSize: '0.9rem', fontWeight: 500 }}>
                        {project}
                      </span>
                    </div>
                  ))}
                </div>
              </ResultSection>
            </GlassCard>

            {/* Timeline */}
            <GlassCard accent="amber">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2.5rem' }}>⏱️</span>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Estimated Timeline
                  </p>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#fcd34d' }}>
                    {aiData.estimatedTimeline}
                  </p>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      )}

      {/* ── Animations ──────────────────────────────────────────────────────────*/}
      <style>{`
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes pulse       { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes glow        { from { box-shadow: 0 0 10px rgba(6,182,212,0.2); }
                                  to   { box-shadow: 0 0 25px rgba(6,182,212,0.5); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); }
                                  to   { opacity: 1; transform: translateY(0);    } }
      `}</style>
    </>
  );
};

export default AIAssistantPage;
