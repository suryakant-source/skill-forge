/**
 * ============================================================================
 * ProfileCard.jsx - User Identity & Stats Display Card
 * ============================================================================
 *
 * Left-side profile card showing:
 *   - Avatar initials with gradient ring
 *   - Name, email, role badge
 *   - Experience level badge
 *   - Bio & career goal
 *   - Member since date
 *   - Edit Profile button (opens parent's modal)
 *
 * Props:
 *   profile   - UserResponse object from backend
 *   onEdit    - () => void — opens EditProfileForm modal
 * ============================================================================
 */

import React from 'react';

// ─── Experience level helpers ─────────────────────────────────────────────────
const LEVEL_CONFIG = {
  BEGINNER: { label: 'Beginner', emoji: '🌱', color: '#10b981' },
  INTERMEDIATE: { label: 'Intermediate', emoji: '⚡', color: '#f59e0b' },
  ADVANCED: { label: 'Advanced', emoji: '🚀', color: '#8b5cf6' },
};

// ─── Generate 2-character initials from full name ────────────────────────────
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '??';

// ─── Format ISO date string to "Sep 2025" ────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const ProfileCard = ({ profile, onEdit }) => {
  const level = LEVEL_CONFIG[profile?.experienceLevel] || LEVEL_CONFIG.BEGINNER;

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '20px',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top gradient glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '80px',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Avatar ────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            padding: '3px',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
              color: '#c4b5fd',
              letterSpacing: '1px',
            }}
          >
            {getInitials(profile?.name)}
          </div>
        </div>

        {/* Online indicator */}
        <span
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#10b981',
            border: '3px solid #0f172a',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          }}
        />
      </div>

      {/* ── Name & Email ──────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '1.375rem',
            fontWeight: 700,
            color: '#f1f5f9',
            lineHeight: 1.2,
          }}
        >
          {profile?.name || 'Loading...'}
        </h2>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '0.875rem',
            color: '#94a3b8',
          }}
        >
          {profile?.email}
        </p>
      </div>

      {/* ── Role Badge ────────────────────────────────────────────────── */}
      <span
        style={{
          padding: '4px 14px',
          borderRadius: '999px',
          background:
            profile?.role === 'ADMIN'
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(139, 92, 246, 0.15)',
          border:
            profile?.role === 'ADMIN'
              ? '1px solid rgba(245, 158, 11, 0.4)'
              : '1px solid rgba(139, 92, 246, 0.4)',
          color: profile?.role === 'ADMIN' ? '#fbbf24' : '#a78bfa',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
        }}
      >
        {profile?.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
      </span>

      {/* ── Experience Level ──────────────────────────────────────────── */}
      <span
        style={{
          padding: '6px 16px',
          borderRadius: '999px',
          background: `${level.color}20`,
          border: `1px solid ${level.color}50`,
          color: level.color,
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}
      >
        {level.emoji} {level.label}
      </span>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
        }}
      />

      {/* ── Bio ───────────────────────────────────────────────────────── */}
      {profile?.bio ? (
        <div style={{ width: '100%', textAlign: 'left' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            About
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: 1.6,
            }}
          >
            {profile.bio}
          </p>
        </div>
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: '0.8125rem',
            color: '#475569',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          No bio yet. Click Edit to add one!
        </p>
      )}

      {/* ── Career Goal ───────────────────────────────────────────────── */}
      {profile?.careerGoal && (
        <div
          style={{
            width: '100%',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#0891b2',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '4px',
            }}
          >
            Career Goal
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#67e8f9',
              lineHeight: 1.5,
            }}
          >
            🎯 {profile.careerGoal}
          </p>
        </div>
      )}

      {/* ── Member Since ──────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '16px',
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Member Since
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>
            {formatDate(profile?.createdAt)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Skills
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '1.25rem', color: '#a78bfa', fontWeight: 700 }}>
            {profile?.skills?.length || 0}
          </p>
        </div>
      </div>

      {/* ── Edit Profile Button ───────────────────────────────────────── */}
      <button
        onClick={onEdit}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(139, 92, 246, 0.5)',
          background: 'rgba(139, 92, 246, 0.1)',
          color: '#a78bfa',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        ✏️ Edit Profile
      </button>
    </div>
  );
};

export default ProfileCard;
