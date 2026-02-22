# SkillSwap India

## Current State

This is a new Caffeine project with:
- Basic frontend scaffolding (React + TypeScript + Tailwind CSS)
- Internet Identity authentication hooks
- shadcn/ui component library
- No backend implementation yet
- No application-specific pages or features

## Requested Changes (Diff)

### Add

**Backend:**
- User profile system with skills offered, skills wanted, location, and rating
- Skill matching algorithm to suggest users with complementary skills
- Swap request system (create, accept, reject, schedule sessions)
- Reviews and ratings system for completed skill swaps
- User authentication and authorization

**Frontend Pages:**
1. Home Page - Landing page with tagline, how it works section, featured skills, and sign-up CTA
2. Authentication - Sign up/login flow with Internet Identity
3. Dashboard - User profile, match suggestions, swap requests overview, session tracking
4. Skill Search - Browse users by skill category with filters (rating, location)
5. Swap Requests - View incoming/outgoing requests, accept/reject, schedule sessions
6. Reviews & Ratings - View and submit reviews for completed swaps

**Data Models:**
- User: ID, name, email, skills offered (array), skills wanted (array), location, average rating
- Swap Request: ID, sender ID, receiver ID, skill offered, skill requested, status (pending/accepted/rejected/completed), session date
- Review: ID, reviewer ID, reviewed user ID, swap request ID, rating (1-5), comment, timestamp

### Modify

None (new project)

### Remove

None (new project)

## Implementation Plan

1. **Component Selection:** Add authorization component for user management and access control
2. **Backend Development:**
   - User profile CRUD with skills management
   - Skill matching function that returns users with wanted skills matching offered skills
   - Swap request lifecycle (create, accept, reject, complete)
   - Review submission and rating calculation
   - Authorization checks for protected operations
3. **Frontend Development:**
   - Home page with hero section, feature explanation, and featured users
   - Auth flow integrated with Internet Identity
   - Dashboard with profile editor, match suggestions grid, and quick stats
   - Search page with category filters and user cards
   - Swap requests page with tabs for incoming/outgoing/completed requests
   - Reviews page with rating display and review submission form
   - Responsive navigation and routing
4. **Validation:** Typecheck, lint, build verification

## UX Notes

- Primary user flow: Sign up → Complete profile with skills → Browse matches → Send swap request → Accept/schedule → Complete swap → Leave review
- Match suggestions prioritize users whose "skills wanted" overlap with current user's "skills offered" and vice versa
- Location filter enables college/city-level connections
- Rating system builds trust and quality (visible on user cards)
- Simple status badges for swap requests (pending/accepted/completed)
- Mobile-responsive design for student accessibility
