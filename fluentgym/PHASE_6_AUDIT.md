# Phase 6: UI/UX Polish & Dark Mode Audit

## Critical Requirements
1. **Dark mode EVERYWHERE** - splash, auth, onboarding, tabs, modals, components
2. **Proper spacing** - no space-x-*, actual margin/padding values
3. **User journey** - make sense from first open to practice
4. **Consistency** - same design language across all screens

## Screen-by-Screen Audit

### ❌ NEEDS FIXING

#### 1. **app/index.tsx** (Splash/Loading Screen)
- [ ] NO dark mode support (hardcoded light bg)
- [ ] Says "FluentAI" instead of "FluentGym"
- [ ] Uses gradient classes that don't work in RN
- [ ] No useTheme integration

#### 2. **app/(auth)/login.tsx**
- [ ] NO dark mode support (bg-white hardcoded)
- [ ] Hardcoded light colors throughout
- [ ] No useTheme import
- [ ] Spacing needs review

#### 3. **app/(auth)/register.tsx**
- [ ] Needs dark mode audit (likely same as login)
- [ ] Spacing needs review

#### 4. **app/(auth)/verify.tsx**
- [ ] Needs dark mode audit
- [ ] Spacing needs review

### ✅ ALREADY GOOD

#### 5. **app/onboarding.tsx**
- [x] HAS dark mode support (uses useTheme)
- [ ] Spacing needs review for consistency

#### 6. **app/(tabs)/home.tsx**
- [ ] Needs dark mode audit
- [ ] Spacing needs review

#### 7. **app/(tabs)/scenarios.tsx**
- [x] Uses isDark from useTheme
- [ ] Spacing needs review

#### 8. **app/(tabs)/practice.tsx**
- [x] Uses isDark from useTheme
- [ ] Spacing needs review for tight areas

#### 9. **app/(tabs)/progress.tsx**
- [x] Uses isDark from useTheme
- [ ] Just rebuilt, should be good

#### 10. **app/(tabs)/profile.tsx**
- [ ] Needs dark mode audit
- [ ] Spacing needs review

#### 11. **app/(tabs)/marketplace.tsx**
- [ ] To be REMOVED or hidden (Phase 7 decision)

## Component Audit

### Custom Components
- [ ] All scenario components (ScenarioCard, ScenarioSelector, ScenarioProgress)
- [ ] All correction components (CorrectionCard, CorrectionsPanel)
- [ ] All metrics components (StatsCard, ProgressChart, SkillsBreakdown, MilestoneCard)
- [ ] Fluency components (FluencyGate, FluencyMetrics)
- [ ] Tutor components (TutorAvatar, TutorSelector)

### UI Components
- [ ] Button component
- [ ] Card component
- [ ] Input component

## Spacing Issues to Fix

### Common Problems
1. **Between buttons** - Need proper mb-4 or gap-4, not space-x
2. **Card padding** - Consistent p-4 or p-6
3. **Screen padding** - Consistent px-6
4. **Section spacing** - Consistent mb-6 between sections
5. **List item spacing** - Consistent gap-3 or gap-4

### Standards to Apply
- Screen horizontal padding: `px-6`
- Section vertical spacing: `mb-6`
- Card padding: `p-4` (small) or `p-6` (large)
- Button spacing: `gap-3` or `gap-4` in flex containers
- List items: `gap-3` for tight lists, `gap-4` for looser

## User Journey Flow

### First-Time User
1. **Splash screen** → Loading (needs dark mode)
2. **Login/Register** → Auth (needs dark mode)
3. **Onboarding** → Language/Level/Goals (HAS dark mode)
4. **Home screen** → First view of app
5. **Practice** → Core feature

### Returning User
1. **Splash screen** → Loading (needs dark mode)
2. **Home screen** → Quick access
3. **Practice/Scenarios** → Continue learning

## Priority Order

### P0 (Must Fix)
1. Splash screen dark mode
2. Auth screens dark mode (login, register)
3. Home screen dark mode
4. Profile screen dark mode

### P1 (Important)
5. Spacing consistency across all tab screens
6. Button/card spacing fixes
7. Modal dark mode support

### P2 (Polish)
8. Component polish
9. Animation transitions
10. Loading states

## Implementation Plan

### Step 1: Fix Splash & Auth (P0)
- Add dark mode to index.tsx
- Add dark mode to login.tsx
- Add dark mode to register.tsx
- Fix branding (FluentAI → FluentGym)

### Step 2: Fix Tab Screens (P0)
- Add dark mode to home.tsx
- Add dark mode to profile.tsx
- Review marketplace.tsx (may remove)

### Step 3: Spacing Consistency (P1)
- Define spacing standards
- Apply to all screens systematically
- Test on device

### Step 4: Component Polish (P1)
- Review all custom components
- Ensure dark mode consistency
- Fix spacing issues

### Step 5: User Journey Testing (P2)
- Test complete flow as new user
- Test complete flow as returning user
- Identify friction points
- Polish transitions

## Success Criteria

✅ **Dark Mode**: Every screen, component, and modal supports dark mode
✅ **Spacing**: Consistent spacing throughout (no cramped UI)
✅ **User Journey**: Makes sense from first open to daily use
✅ **Branding**: Says "FluentGym" everywhere, not "FluentAI"
✅ **Polish**: Professional feel, smooth transitions
