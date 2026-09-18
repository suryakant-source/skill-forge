import React from 'react';

/**
 * Loader Component for SkillForge Web Application.
 * 
 * Purpose:
 * Provides a clean, full-screen loading overlay during asynchronous events,
 * such as initial authentication state hydration (verifying token and user from localStorage),
 * route transitions, and blocking data operations.
 * 
 * Design Details:
 * - Fixed full-screen overlay with dark translucent background (#0F0F1A / backdrop blur).
 * - Dual-color gradient spinner utilizing SkillForge's brand colors (Purple #6C63FF to Teal #3ECFCF).
 * - Smooth CSS spinning animation with accompanying pulsing status text.
 */
export const Loader = ({ message = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing blur ring */}
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary blur-xl opacity-40 animate-pulse pointer-events-none" />

        {/* Outer rotating gradient ring */}
        <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary border-r-secondary border-b-primary/30 border-l-secondary/20 animate-spin" />

        {/* Inner subtle reverse spinner */}
        <div className="absolute w-10 h-10 rounded-full border-2 border-transparent border-t-secondary border-b-primary/50 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>

      {/* Accompanying loading label */}
      <p className="mt-4 text-sm font-medium tracking-wide text-gray-300 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loader;
