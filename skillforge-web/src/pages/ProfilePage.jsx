/**
 * ============================================================================
 * ProfilePage.jsx - User Profile & Skills Management Page
 * ============================================================================
 *
 * LAYOUT:
 *   Left column  → ProfileCard (sticky)
 *   Right column → Skills Cloud + Add Skill + Account Details
 *
 * DATA FLOW:
 *   useProfile()     -> GET /api/users/profile
 *   useAddSkill()    -> POST /api/users/skills
 *   useRemoveSkill() -> DELETE /api/users/skills/{id}
 *   EditProfileForm manages its own PUT /api/users/profile mutation
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import ProfileCard from '../components/profile/ProfileCard';
import EditProfileForm from '../components/profile/EditProfileForm';
import SkillBadge from '../components/profile/SkillBadge';
import { useProfile, useAddSkill, useRemoveSkill } from '../hooks/useProfile';
import toast from 'react-hot-toast';

// ─── Popular skills for quick-add suggestions ─────────────────────────────────
const SUGGESTED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Express', 'Spring Boot', 'Java', 'Python',
  'Django', 'FastAPI', 'Docker', 'Kubernetes', 'AWS',
  'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  'Git', 'CI/CD', 'Microservices', 'TDD', 'System Design',
];

const ProfilePage = () => {
  const { data: apiResponse, isLoading, isError, error } = useProfile();
  const addSkillMutation = useAddSkill();
  const removeSkillMutation = useRemoveSkill();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Unwrap ApiResponse shape: { success, message, data: UserResponse }
  const profile = apiResponse?.data ?? apiResponse;
  const skills = profile?.skills || [];

  // ── Add skill ─────────────────────────────────────────────────────────────
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    const already = skills.some(
      (s) => s.skillName.toLowerCase() === trimmed.toLowerCase()
    );
    if (already) {
      toast.error(`"${trimmed}" is already in your profile`);
      return;
    }

    addSkillMutation.mutate(trimmed, {
      onSuccess: () => setSkillInput(''),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // ── Remove skill ──────────────────────────────────────────────────────────
  const handleRemoveSkill = (skillId) => {
    removeSkillMutation.mutate(skillId);
  };

  // ── Quick suggestion click ────────────────────────────────────────────────
  const handleSuggestionClick = (skillName) => {
    const already = skills.some(
      (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
    );
    if (already) return;
    addSkillMutation.mutate(skillName);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ margin: 0, color: '#94a3b8' }}>Loading your profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#f87171', textAlign: 'center', padding: '32px' }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <h3 style={{ margin: 0 }}>Failed to load profile</h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
          {error?.message || 'Please refresh or try again.'}
        </p>
      </div>
    );
  }

  const addPending = addSkillMutation.isPending;
  const removePending = removeSkillMutation.isPending;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Profile
        </h1>
        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9375rem' }}>
          Manage your personal details, career goals, and skills.
        </p>
      </div>

      {/* ── Two-Column Layout ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 300px) 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* ─── LEFT: Sticky ProfileCard ──────────────────────────────────── */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <ProfileCard profile={profile} onEdit={() => setIsEditModalOpen(true)} />
        </div>

        {/* ─── RIGHT: Skills + Account ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Skills Cloud */}
          <div style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0' }}>
                🛠️ My Skills
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                {skills.length} skill{skills.length !== 1 ? 's' : ''} in your toolkit — hover to remove
              </p>
            </div>

            {skills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧩</div>
                <p style={{ margin: 0 }}>No skills added yet. Use the section below!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {skills.map((skill) => (
                  <SkillBadge
                    key={skill.id}
                    skill={skill}
                    onRemove={handleRemoveSkill}
                    disabled={removePending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add Skill */}
          <div style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0' }}>
                ✨ Add New Skill
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                Type a skill name and press Enter, or click a suggestion
              </p>
            </div>

            {/* Input Row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., React, Docker, Java..."
                maxLength={60}
                disabled={addPending}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(6,182,212,0.7)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(6,182,212,0.3)'; }}
              />
              <button
                onClick={handleAddSkill}
                disabled={addPending || !skillInput.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: addPending || !skillInput.trim() ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  cursor: addPending || !skillInput.trim() ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '90px',
                  justifyContent: 'center',
                }}
              >
                {addPending ? (
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : '+ Add'}
              </button>
            </div>

            {/* Suggestions */}
            <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
              Quick suggestions
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUGGESTED_SKILLS.map((name) => {
                const alreadyAdded = skills.some((s) => s.skillName.toLowerCase() === name.toLowerCase());
                return (
                  <button
                    key={name}
                    onClick={() => !alreadyAdded && handleSuggestionClick(name)}
                    disabled={alreadyAdded || addPending}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: `1px solid ${alreadyAdded ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`,
                      background: alreadyAdded ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                      color: alreadyAdded ? '#34d399' : '#64748b',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: alreadyAdded ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!alreadyAdded && !addPending) {
                        e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)';
                        e.currentTarget.style.color = '#67e8f9';
                        e.currentTarget.style.background = 'rgba(6,182,212,0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!alreadyAdded) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }
                    }}
                  >
                    {alreadyAdded ? '✓ ' : ''}{name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Details */}
          <div style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0' }}>
                🔒 Account Details
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                Read-only account identifiers
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Email', value: profile?.email, icon: '📧' },
                { label: 'Role', value: profile?.role, icon: '🎭' },
                { label: 'Status', value: profile?.isActive ? 'Active ✅' : 'Deactivated', icon: '💚' },
                { label: 'User ID', value: `#${profile?.id}`, icon: '🔖' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {icon} {label}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9375rem', color: '#94a3b8', fontWeight: 600 }}>
                    {value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <EditProfileForm
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default ProfilePage;
