/**
 * ============================================================================
 * EditProfileForm.jsx - Modal for Editing Profile Details
 * ============================================================================
 *
 * A full-screen glassmorphism modal with:
 *   - Name (required, 2-50 chars)
 *   - Bio (optional, textarea, 500 char limit)
 *   - Career Goal (optional, 200 char limit)
 *   - Experience Level (BEGINNER / INTERMEDIATE / ADVANCED dropdown)
 *   - Character counters on textarea fields
 *   - Real-time validation errors (client-side, mirrors backend constraints)
 *   - Spinner on submit while mutation pending
 *
 * Props:
 *   profile    - Current UserResponse (pre-fills form)
 *   onClose    - () => void — closes modal
 *   isOpen     - boolean
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useUpdateProfile } from '../../hooks/useProfile';

const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: '🌱 Beginner', desc: 'Just starting out' },
  { value: 'INTERMEDIATE', label: '⚡ Intermediate', desc: '1-3 years of experience' },
  { value: 'ADVANCED', label: '🚀 Advanced', desc: 'Senior / expert level' },
];

const EditProfileForm = ({ profile, isOpen, onClose }) => {
  const updateProfileMutation = useUpdateProfile();

  const [form, setForm] = useState({
    name: '',
    bio: '',
    careerGoal: '',
    experienceLevel: 'BEGINNER',
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form whenever the modal opens or profile data changes
  useEffect(() => {
    if (profile && isOpen) {
      setForm({
        name: profile.name || '',
        bio: profile.bio || '',
        careerGoal: profile.careerGoal || '',
        experienceLevel: profile.experienceLevel || 'BEGINNER',
      });
      setErrors({});
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  // ── Validation (client-side mirrors backend @Valid constraints) ──────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    else if (form.name.trim().length > 50) e.name = 'Name must not exceed 50 characters';

    if (form.bio.length > 500) e.bio = 'Bio must not exceed 500 characters';
    if (form.careerGoal.length > 200) e.careerGoal = 'Career goal must not exceed 200 characters';
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    updateProfileMutation.mutate(
      {
        name: form.name.trim(),
        bio: form.bio.trim() || null,
        careerGoal: form.careerGoal.trim() || null,
        experienceLevel: form.experienceLevel,
      },
      { onSuccess: onClose }
    );
  };

  const isPending = updateProfileMutation.isPending;

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.3)'}`,
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#f1f5f9',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  };

  const errorStyle = {
    marginTop: '4px',
    fontSize: '0.78rem',
    color: '#f87171',
  };

  return (
    // ── Modal Overlay ──────────────────────────────────────────────────────
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* ── Modal Box ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUp 0.25s ease',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ✏️ Edit Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#94a3b8',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Display Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your full name"
              style={inputStyle(errors.name)}
              maxLength={50}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.7)'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.name ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.3)'; }}
            />
            {errors.name && <p style={errorStyle}>{errors.name}</p>}
          </div>

          {/* Bio */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Bio</label>
              <span style={{ fontSize: '0.75rem', color: form.bio.length > 480 ? '#f87171' : '#475569' }}>
                {form.bio.length}/500
              </span>
            </div>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={500}
              rows={3}
              style={{ ...inputStyle(errors.bio), resize: 'vertical', minHeight: '80px' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.7)'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.bio ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.3)'; }}
            />
            {errors.bio && <p style={errorStyle}>{errors.bio}</p>}
          </div>

          {/* Career Goal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Career Goal</label>
              <span style={{ fontSize: '0.75rem', color: form.careerGoal.length > 180 ? '#f87171' : '#475569' }}>
                {form.careerGoal.length}/200
              </span>
            </div>
            <input
              type="text"
              value={form.careerGoal}
              onChange={(e) => handleChange('careerGoal', e.target.value)}
              placeholder="e.g., Become a Full Stack Developer"
              maxLength={200}
              style={inputStyle(errors.careerGoal)}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.7)'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.careerGoal ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.3)'; }}
            />
            {errors.careerGoal && <p style={errorStyle}>{errors.careerGoal}</p>}
          </div>

          {/* Experience Level */}
          <div>
            <label style={labelStyle}>Experience Level</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {EXPERIENCE_LEVELS.map((lvl) => {
                const selected = form.experienceLevel === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => handleChange('experienceLevel', lvl.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `1px solid ${selected ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.1)'}`,
                      background: selected
                        ? 'rgba(139, 92, 246, 0.15)'
                        : 'rgba(255,255,255,0.03)',
                      color: selected ? '#c4b5fd' : '#64748b',
                      fontSize: '0.9rem',
                      fontWeight: selected ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{lvl.label}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lvl.desc}</span>
                    {selected && <span style={{ color: '#8b5cf6', marginLeft: '8px' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Action Buttons ───────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#64748b',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: isPending
                  ? 'rgba(139, 92, 246, 0.4)'
                  : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                color: '#fff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isPending ? (
                <>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Saving...
                </>
              ) : (
                '✓ Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp  { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin     { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default EditProfileForm;
