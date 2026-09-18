/**
 * ============================================================================
 * SkillBadge.jsx - Interactive Skill Pill with Delete Capability
 * ============================================================================
 *
 * A glassmorphism pill badge that displays a single user skill.
 * Renders an animated × remove button when the user hovers over it.
 *
 * Props:
 *   skill    - { id: number, skillName: string } — from UserResponse.skills[]
 *   onRemove - (skillId: number) => void          — callback from parent
 *   disabled - boolean                            — true while a delete is pending
 *
 * Design:
 *   - Purple-to-teal gradient border via box-shadow
 *   - Hover lifts pill slightly + reveals remove button
 *   - Micro-animation: pill scales in on mount
 * ============================================================================
 */

import React, { useState } from 'react';

const SkillBadge = ({ skill, onRemove, disabled = false }) => {
  const [hovered, setHovered] = useState(false);

  const handleRemove = (e) => {
    e.stopPropagation();
    if (!disabled && onRemove) {
      onRemove(skill.id);
    }
  };

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '999px',
        background: hovered
          ? 'rgba(139, 92, 246, 0.25)'
          : 'rgba(139, 92, 246, 0.12)',
        border: '1px solid rgba(139, 92, 246, 0.45)',
        color: '#c4b5fd',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'default',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 4px 15px rgba(139, 92, 246, 0.25)'
          : '0 2px 6px rgba(139, 92, 246, 0.1)',
        opacity: disabled ? 0.6 : 1,
        animation: 'skillPillIn 0.3s ease both',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          flexShrink: 0,
        }}
      />
      {skill.skillName}

      {/* Remove button — appears on hover */}
      {hovered && (
        <button
          onClick={handleRemove}
          disabled={disabled}
          title={`Remove ${skill.skillName}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.7)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 0,
            lineHeight: 1,
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.7)';
          }}
        >
          x
        </button>
      )}

      <style>{`
        @keyframes skillPillIn {
          from { opacity: 0; transform: scale(0.85) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </span>
  );
};

export default SkillBadge;
