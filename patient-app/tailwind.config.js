/** @type {import('tailwindcss').Config} */
module.exports = {
  // Apply Tailwind to all React/Next.js files across the three apps
  content: [
    './patient-app/**/*.{js,ts,jsx,tsx,mdx}',
    './clinic-app/**/*.{js,ts,jsx,tsx,mdx}',
    './scanning-app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // --- Typography for Accessibility & Clarity (Patient App Focus) ---
      fontFamily: {
        // A clear, legible sans-serif font suitable for medical text
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // For emphasis or professional headers (Clinic/Scanning Apps)
        serif: ['Merriweather', 'serif'],
      },

      // --- Custom Color Palette (MediBridge Branding) ---
      colors: {
        // Primary brand color: Trustworthy, authoritative medical blue
        primary: {
          DEFAULT: '#0070F3', // MediBridge Blue (Matches Next.js Blue for tech stack)
          50: '#E6F0FF',
          100: '#B3D3FF',
          500: '#0070F3',
          700: '#005ACB',
          900: '#003A8F',
        },
        // Secondary color: Used for critical actions/reminders (Next Critical Action)
        secondary: {
          DEFAULT: '#FF6347', // Tomato Red/Orange for alerts (like next dose countdown) [cite: 3]
          50: '#FFEBEA',
          700: '#E0503D',
        },
        // Success color: Used for logging adherence (Adherence Score) [cite: 11]
        success: {
          DEFAULT: '#10B981', // Green for positive status
        },
        // Report/Alert color: Used for report summaries (e.g., 'Slightly high cholesterol') [cite: 6]
        warning: {
          DEFAULT: '#FBBF24', // Yellow/Amber for caution
        },
        // Neutral background/text for high contrast
        background: "#f5f7fa",
        text: '#1F2937',
      },

      // --- Spacing for Intuitive Design ---
      spacing: {
        '18': '4.5rem', // For prominent dashboards/cards [cite: 3]
        '100': '25rem',
      },
      
      // --- Custom Utility for Large, Prominent Button (Play Audio) ---
      // This enforces the requirement for a prominent, large "Play Audio" button 
      minHeight: {
        'button-lg': '4.5rem', // Minimum height for critical buttons
      },
      
      // --- Card Shadow for Separation and Clarity ---
      boxShadow: {
        // Subtle shadow for reports and prescription cards [cite: 46]
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        // Stronger shadow for critical actions (Next Dose countdown) [cite: 3]
        'critical': '0 10px 15px -3px rgba(0, 112, 243, 0.1), 0 4px 6px -4px rgba(0, 112, 243, 0.05)',
      },

      // --- Animation for Status Monitoring (Scanning App) ---
      keyframes: {
        processing: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      },
      animation: {
        // Animation for AI Processing status monitor [cite: 35]
        'ai-pulse': 'processing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    // Include Tailwind's forms plugin for better styling of structured inputs (Clinic/Scanning Apps)
    require('@tailwindcss/forms'),
  ],
}