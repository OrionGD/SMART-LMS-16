================================================================================
                      SMART LMS: UI/UX DESIGN SPECIFICATIONS
================================================================================

1. DESIGN PHILOSOPHY
   The Smart LMS interface is built on a "Learner-Centric" design philosophy. It prioritizes clarity, accessibility, and engagement. The visual language is modern and clean, reducing cognitive load to allow users to focus on educational content. The system employs a "Glassmorphism" inspired aesthetic in parts (modals, overlays) combined with flat design principles for core navigation.

2. COLOR PALETTE & THEME
   The application utilizes a consistent color system based on the Tailwind CSS palette, supporting both Light and Dark modes for visual comfort.

   2.1 Primary Colors
       - Indigo-600 (#4F46E5): Primary action buttons, active states, links, and branding. Chosen for trust and stability.
       - Purple-600 (#9333EA): used for AI-related features (Magic/Sparkles) to distinguish machine-generated content.

   2.2 Status Colors
       - Green-500/600: Success states, completion badges, correct quiz answers.
       - Red-500/600: Error messages, destructive actions (delete), incorrect quiz answers.
       - Yellow-400/500: Warnings, Ratings (Stars), Certificates, Leaderboard trophies.

   2.3 Backgrounds & Surfaces
       - Light Mode:
         * Background: Gray-50 (Off-white) for reduced eye strain compared to pure white.
         * Surface: White (#FFFFFF) for cards and content areas.
       - Dark Mode:
         * Background: Gray-900 (#111827) for deep contrast.
         * Surface: Gray-800 (#1F2937) for cards, preserving hierarchy.

3. TYPOGRAPHY
   - Font Family: System Sans-Serif stack (Inter, Roboto, Segoe UI) for maximum legibility and cross-platform consistency.
   - Hierarchy:
     * H1 (Text-4xl/3xl): Page Titles (e.g., "Student Dashboard").
     * H2 (Text-2xl): Section Headers (e.g., "My Courses").
     * H3 (Text-lg/xl): Card Titles.
     * Body (Text-sm/base): Course content, descriptions.
     * Metadata (Text-xs): Timestamps, captions, small badges.

4. LAYOUT & NAVIGATION STRUCTURE

   4.1 Global Navigation (Header)
       - Sticky positioning to ensure access to utility functions at all times.
       - Contains: Logo, App Title, Profile Avatar, Theme Toggle (Sun/Moon), and Role-specific actions (e.g., Preferences).

   4.2 Dashboard Strategy (Role-Based)
       - Student View: Sidebar navigation + Main Content Area. Focus on "My Courses", "Insights", and "Leaderboard".
       - Instructor View: Tab-based navigation ("My Courses" vs "Student Messages") for workflow efficiency.
       - Admin View: Tab-based navigation ("Analytics", "Users", "Courses", "Messages") for system governance.

   4.3 Grid System
       - Responsive Grid Layout using CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
       - Adapts seamlessly from Mobile (stacked) to Tablet (2 columns) to Desktop (3 columns).

5. COMPONENT DESIGN

   5.1 Course Cards
       - Visuals: Large cover image with a gradient overlay for text readability.
       - Interaction: Hover effects (`scale-[1.03]`, `shadow-lg`) provide tactile feedback.
       - Progress: Visual progress bar integrated directly into the card footer.

   5.2 Modals
       - Behavior: Center-aligned overlays with backdrop blur (`backdrop-blur-sm`) to focus attention.
       - Animation: `animate-scale-in` or `animate-fade-in-up` for smooth entry.
       - Usage: Login, Profile Editing, Quizzes, Legal Documents, Certificate view.

   5.3 Buttons
       - Primary: Solid Indigo background, white text, rounded corners (`rounded-lg`).
       - Secondary: Light gray/indigo tint background, dark text.
       - Icon Buttons: Circular touch targets for actions like "Bookmark", "Edit", "Delete".

6. INTERACTIVE ELEMENTS & MICRO-INTERACTIONS

   6.1 Animations
       - Page Transitions: Elements fade in (`animate-fade-in`) to smooth navigation.
       - Loading States: Skeleton screens (pulsing gray boxes) used during AI content generation instead of generic spinners.
       - Celebrations: `animate-bounce` on Trophies/Certificates and confetti backgrounds for course completion.

   6.2 AI Feedback Visuals
       - "Sparkles" Icon: Universally used to denote AI-generated content (Summaries, Adaptive Text).
       - Typing Effect: Simulated in Chat interfaces for realism.

   6.3 Chat Interface
       - Floating/Modal Hybrid: Chat windows appear as overlays.
       - Message Bubbles: Distinct colors for Sender (Indigo) vs Receiver (Gray/White) with "seen" indicators.

7. RESPONSIVENESS & ACCESSIBILITY
   - Mobile First: All layouts stack vertically on small screens.
   - Touch Targets: Buttons and inputs sized minimum 44px height for touch accuracy.
   - Contrast: Dark mode utilizes lighter gray text (Gray-300) on dark backgrounds to meet WCAG AA standards.
   - Screen Readers: Use of semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<article>`) and `aria-labels` on icon-only buttons.

8. SPECIFIC UX FLOWS

   8.1 Adaptive Mode Toggle
       - A prominent switch in the Course Detail view.
       - UX: Switching it instantly triggers a skeleton load state, followed by the replacement of static text with AI-personalized content, reinforced by a visual badge ("Adapted for Visual Learners").

   8.2 Assessment Flow
       - Quiz UI appears inline within the lesson content (no page reload).
       - Immediate feedback upon submission (Green/Red highlights).
       - Explanation accordion expands to show AI reasoning.

   8.3 Certificate Generation
       - Upon 100% completion, a "Claim Certificate" button animates into view.
       - The certificate opens in a print-friendly modal with high-resolution text suitable for PDF export.