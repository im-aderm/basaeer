# 🏫 Basaeer School Management System — Comprehensive Codebase Audit

> **Audit Date:** April 7, 2026  
> **Auditor Role:** Senior Software Architect · Senior Frontend Engineer · Senior UI/UX Designer  
> **Scope:** Full-stack codebase — Frontend (Next.js 16), Backend (NestJS 11), Database (PostgreSQL/Prisma)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Features & Capabilities](#3-features--capabilities)
4. [Issues & Bugs](#4-issues--bugs)
5. [UI/UX Audit](#5-uiux-audit)
6. [Landing Page Assessment & Improvements](#6-landing-page-assessment--improvements)
7. [Code Quality Review](#7-code-quality-review)
8. [Performance & Security](#8-performance--security)
9. [Final Recommendations — Prioritized Roadmap](#9-final-recommendations--prioritized-roadmap)

---

## 1. Executive Summary

Basaeer is a **full-featured Islamic school management platform** serving a dual purpose: a public-facing school website (landing page) and a multi-role administrative dashboard for school operations. The system is impressively broad in scope with **150+ frontend pages** and **34 backend modules**, covering everything from student admissions to HR payroll, library management, and online examinations.

However, the codebase currently sits at an **early MVP stage with significant production gaps**:

- **~28 of 150 pages (~19%)** render only a "Restoration Placeholder" — meaning they are visually present in the navigation but functionally empty.
- **Critical security gaps exist** (no rate limiting, no input validation on auth endpoints, JWT secret in `.env` is non-configurable and the env file is committed to the repo via `.env` being present in the git index).
- **Brand and content inconsistencies** are pervasive — the landing page references "Boston, MA" and describes the school as "America's first public Islamic school," while the footer uses a Nigerian phone number and `.edu.ng` domain. These are mutually exclusive identities.
- The **ThemeProvider (dark mode) is wired up but never activated** — it is literally dead code today.
- The **`GlobalSearch` component is built but never rendered** in the Header, so users cannot access the search functionality even though the backend module exists.
- **The sidebar has two duplicate "Library" navigation groups**, creating visual clutter and confusion.

**Overall Production Readiness Score: 4/10.** The architecture is sound, the design system is coherent, and the module coverage is impressive — but blocked features, security holes, and identity inconsistencies must be resolved before any public launch.

---

## 2. Architecture Overview

### 2.1 Project Structure

```
basaeer/
├── frontend/         # Next.js 16 App Router (React 19)
│   ├── src/app/      # File-based routing — 150+ pages
│   ├── src/components/
│   │   ├── landing/  # Public marketing site components
│   │   ├── ui/       # shadcn/ui-style primitives (16 components)
│   │   └── ...       # Dashboard components (Sidebar, Header, etc.)
│   ├── src/services/ # 26 API service modules (axios-based)
│   ├── src/context/  # AuthContext only
│   └── src/lib/      # api.ts (axios instance), utils.ts
├── backend/          # NestJS 11 monolith
│   ├── src/          # 34 feature modules
│   ├── prisma/       # Schema (52 KB), migrations, seed
│   └── api/          # Netlify/serverless function handler
└── docs/             # Markdown docs, progress reports
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Next.js (App Router) | 16.1.1 |
| UI Language | React | 19.2.3 |
| Styling | Tailwind CSS v4 | ^4 |
| Animation | Framer Motion | ^12 |
| Slider | Swiper | ^12 |
| Backend Framework | NestJS | ^11 |
| ORM | Prisma (PostgreSQL adapter) | ^7.2 |
| Database | PostgreSQL (Supabase) | — |
| Auth | JWT + Passport | — |
| PDF/Excel | pdfkit, ExcelJS, Puppeteer | — |
| E2E Testing | Playwright | ^1.58 |

### 2.3 Architecture Pattern

- **Frontend:** Component-based, file-system routing (Next.js App Router). Logic is kept in pages/components — no global state management library (Zustand, Redux) is used. Auth state is the only persisted context.
- **Backend:** **Modular NestJS monolith** — each domain (students, finance, attendance, etc.) is its own NestJS module with its own controller, service, and DTOs. This is a sound architectural pattern.
- **Data Access:** All frontend API calls go through a single axios instance (`src/lib/api.ts`) that auto-attaches JWT tokens. Backend uses Prisma ORM with a pg-native adapter for Supabase connection pooling.
- **Communication:** REST API only. No GraphQL, no WebSocket (despite "Live Classes" feature in the nav).
- **Deployment Target:** Netlify (both frontend and backend use `netlify` config directories). The backend has a `serverless-http` adapter — it is being treated as a serverless function which has cold-start and execution-time implications for Puppeteer-based PDF generation.

---

## 3. Features & Capabilities

### 3.1 What Is Working Today

| Module | Status | Notes |
|---|---|---|
| Authentication (Login/JWT) | ✅ Functional | JWT via localStorage — no refresh tokens |
| Protected Routing | ✅ Functional | ProtectedRoute + RolesGuard on backend |
| Student CRUD | ✅ Functional | Full create/read/update/delete with extended profile |
| Student Stats | ✅ Functional | Stats endpoint consumed by dashboard |
| Employee/Staff Management | ✅ Functional | Departments, designations |
| Branch Management | ✅ Functional | Multi-branch support in DB schema |
| Finance Module | ✅ Functional | Fee structures, invoices, expenses, vouchers |
| Transport Module | ✅ Functional | Routes, vehicles, student assignment |
| Hostel Management | ✅ Functional | Rooms, bookings, bed status |
| Attendance (Student) | ✅ Functional | Class and subject-wise |
| Library | ✅ Functional | Books, borrowing, return |
| Exams (Offline) | ✅ Functional | Scheduling, marks entry, grading scales |
| Online Exams | ✅ Functional | Question bank, attempt flow |
| Inventory | ✅ Functional | Products, store, purchases, sales |
| Certificates | ✅ Functional | Template + PDF generation |
| ID Cards | ✅ Functional | Student and employee cards |
| Reception | ✅ Functional | Enquiry, postal, visitor log |
| Academic Setup | ✅ Functional | Classes, sections, subjects, schedules |
| Global Search | ⚠️ Built but hidden | Component exists; not rendered in Header |
| Bulk SMS/Email | 🚫 Placeholder | 6 sub-pages exist but all show placeholder |
| QR Attendance | ⚠️ Partial | Attendance page works; reports/submissions are placeholders |
| Alumni Management | 🚫 Placeholder | Both pages are stubs |
| HR (Payroll, Leave) | ⚠️ Partial | Backend exists; frontend pages are incomplete |
| Dark Mode | 🚫 Dead Code | ThemeProvider imported and wired; never activated / no toggle |
| Password Reset | 🚫 Missing | "Forgot Password?" link on login goes to href="#" |
| Notifications (Bell) | 🚫 Stub | Bell icon in header has red dot but no functionality |

### 3.2 Missing but Expected Features

- **Password Reset Flow** (email-based token)
- **Real-time notifications** (WebSocket or polling)
- **Dark mode toggle** (ThemeProvider is imported but never used in JSX)
- **Student/Parent portal** (My Portal in nav for STUDENT role, but pages are stubs)
- **Bulk Communications** (SMS/Email sending — all 6 pages are placeholders)
- **Multi-factor authentication**
- **Audit log / activity feed** (beyond dead static hardcoded text in dashboard)
- **Search keyboard shortcut** (Ctrl+K defined in GlobalSearch but component never mounted in Header)

---

## 4. Issues & Bugs

### 4.1 Critical Bugs

#### BUG-01: GlobalSearch Component Is Never Rendered

**Location:** `src/components/Header.tsx`  
**Problem:** The `GlobalSearch` component with real API integration, debounced search, and keyboard shortcut (Ctrl+K) support exists at `src/components/GlobalSearch.tsx`, but `Header.tsx` has a static dumb `<Input>` that does nothing. The `GlobalSearch` is never imported or rendered anywhere in the app.  
**Impact:** Users cannot search across students, staff, inventory, or events — despite the backend `/search` endpoint existing.

#### BUG-02: Duplicate "Library" Navigation Group in Sidebar

**Location:** `src/components/Sidebar.tsx`, lines 269–277 and 310–317  
**Problem:** There are two completely separate `NavItem` objects for "Library" in the `navigation` array. The first maps to `/dashboard/library/books`, `/dashboard/library/category`, etc. The second "Library Management" maps to `/dashboard/library` — creating a confusing duplicate with overlapping routes.  
**Impact:** Users see two "Library" entries in the sidebar. Route `/dashboard/library/books` appears in both groups. Breaks information architecture.

#### BUG-03: Role-Based Access Control Not Enforced on Frontend

**Location:** `src/components/ProtectedRoute.tsx`, lines 16–21  
**Problem:** The code detects when a user's role doesn't match `allowedRoles`, then falls through to render the page anyway. A commented-out redirect (`// router.push("/unauthorized")`) is never executed. The backend guards are in place, but the frontend completely bypasses RBAC.  
**Impact:** A `STUDENT` user visiting `/dashboard/finance` sees the full admin finance dashboard.

#### BUG-04: Race Condition in Auth Context

**Location:** `src/context/AuthContext.tsx`, lines 59–68  
**Problem:** The `login()` function stores the token, sets the user from the login response payload, then fires an asynchronous `/auth/profile` call that is not awaited before `router.push("/dashboard")`. If the profile request is slow, the user lands on the dashboard with stale data, then the state updates again mid-render.  
**Impact:** Potential flash of incorrect user data; micro-flickering of the user's displayed name/role.

#### BUG-05: `style jsx global` Used in Next.js App Router — Wrong Syntax

**Location:** `HeroSlider.tsx` (line 256), `admission/apply/page.tsx` (line 247), `students/admission/page.tsx` (line 417)  
**Problem:** `<style jsx global>` is a Next.js **Pages Router** styled-jsx API. In the **App Router** (which this project uses), this syntax is not supported and will either be silently ignored or cause a hydration error.  
**Impact:** The `.swiper-button-disabled` CSS rule in `HeroSlider.tsx` is never applied. Swiper nav buttons may render incorrectly when disabled.

#### BUG-06: `openMenus` Missing Dependency in useEffect

**Location:** `src/components/Sidebar.tsx`, lines 375–383  
**Problem:** The `useEffect` that auto-opens the active menu depends on `pathname` but reads `openMenus` inside the callback without including it in the dependency array. React hook dependency violation that will cause stale closure bugs.

#### BUG-07: Promise.all Silently Discards Two API Call Results

**Location:** `src/app/dashboard/students/page.tsx`, lines 29–44  
**Problem:** `Promise.all([StudentService.getStats(), StudentService.getAll(), ClassService.getAll()])` destructures only `[statsData]`. The results of `getAll()` and `ClassService.getAll()` are fetched from the API but completely discarded. Two unnecessary API calls made on every page load, wasting bandwidth and API quota.

#### BUG-08: Plain-Text Password in Seed File Committed to Repo

**Location:** `backend/prisma/seed.ts`, line 19  
**Problem:** `const defaultPassword = 'password123'` is in plain text in a tracked file. Indicates poor security hygiene and should use env vars.

### 4.2 Medium Bugs

#### BUG-09: href="#" Dead Links Throughout Landing Page
All navigation links on the landing page and login page's "Forgot Password" use `href="#"` with no actual routing. Count: 9+ dead links across Navbar, Footer, and login page.

#### BUG-10: Brand / Content Identity Mismatch
The landing page describes the school as "America's first public Islamic school" in "Boston, MA" — but the footer email is `admissions@basaeer.edu.ng` (Nigerian domain), the phone is a `+234` number, and the backend seed uses a generic address. This contradiction destroys credibility. The school cannot simultaneously be American and Nigerian.

#### BUG-11: ThemeProvider Is Imported But Not Used in JSX
`ThemeProvider` from `next-themes` is imported in `Providers.tsx` but never actually appears in the JSX. Meanwhile, 341 `dark:` Tailwind classes exist across the app, creating phantom styling that will never activate since there is no theme toggle anywhere.

#### BUG-12: Core Student Model Typed as `any`
`Student.user`, `Student.parent`, `Student.class`, `Student.section`, `Student.certificates`, `Student.attendance` are all typed as `any` in `studentService.ts`. Defeats TypeScript's purpose.

#### BUG-13: No 401 Response Interceptor in api.ts
There is only a request interceptor. No response interceptor to handle expired JWTs globally. Every API call will silently fail when tokens expire rather than redirecting to login.

---

## 5. UI/UX Audit

### 5.1 Design System Assessment

**Strengths:**
- CSS design tokens in `globals.css` are well-constructed. Brand colors (`--brand-navy`, `--brand-gold`, `--brand-cream`) are consistent across the landing page.
- Typography scale (`--text-h1` through `--text-small`) is properly defined and used via utility classes.
- Sidebar component is polished — collapse/expand behavior, keyboard-accessible chevrons, mobile overlay, role-based visibility all present.

**Inconsistencies Found:**

| Issue | Location | Severity |
|---|---|---|
| Dashboard uses `#2563EB` (blue) as primary; landing page uses `#0A1F44` (navy) — two incompatible design languages | Sidebar vs globals.css | High |
| GlobalSearch uses raw `gray-*` Tailwind tokens, not design system tokens | GlobalSearch.tsx | Medium |
| Testimonials use `<img>` (not Next.js `<Image>`) for avatars | TestimonialsSection.tsx | Medium |
| StatsSection uses emoji icons with `contrast-0` hover toggle — unprofessional, inconsistent | StatsSection.tsx | Medium |
| Login page uses `#2563EB` blue, not brand gold/navy — no design continuity with landing page | login/page.tsx | High |
| Dashboard hero uses `border-t-8` with `rounded-[3.5rem]` — overly stylized, inconsistent with rest of dashboard | dashboard/page.tsx | Medium |
| RestorationPlaceholder on 28 pages — provides zero user value or ETA | Multiple pages | High |

### 5.2 Responsiveness Issues

- On mobile, `HeroSlider`'s "Visual Panel" takes `h-[50vh]` and "Content Panel" takes `h-full` in a flex column, potentially overflowing on small screens.
- Dashboard stat cards use `max-w-7xl mx-auto` without adjusting for sidebar offset — content can feel too wide at 768–1024px viewport.

### 5.3 Accessibility Issues

| Issue | Impact |
|---|---|
| No `aria-label` on icon-only buttons (Bell, Menu, Collapse toggle) | Screen reader users cannot identify controls |
| `<img>` in TestimonialsSection without optimization | Not LCP-optimized |
| StatsSection emoji icons have no `aria-hidden="true"` | Screen readers announce emoji Unicode names |
| Form inputs in login lack `id`+`htmlFor` pairing for `<label>` | Label clicks won't focus inputs |
| `brand-cream/60` on `brand-navy` may fail WCAG AA contrast | Potential accessibility violation |
| ProtectedRoute spinner has no `role="status"` or `aria-label` | Inaccessible loading state |

### 5.4 Code Duplication in Sidebar

The Sidebar has complete code duplication between its desktop (lines 437–499) and mobile (lines 561–615) rendering. ~80 lines of identical JSX navigation rendering code. Should be extracted to a `NavList` sub-component.

The `cn()` utility function is defined locally in `Sidebar.tsx` (lines 45–47) instead of imported from `src/lib/utils.ts`. If the `utils.ts` implementation changes, `Sidebar.tsx` won't benefit.

---

## 6. Landing Page Assessment & Improvements

### 6.1 Current State: Grade B+

The hero slider is visually impressive with a split-panel layout, video backgrounds, and smooth Framer Motion animations. The brand palette (navy/gold/cream) is premium and distinctive. However, several critical issues undermine the execution.

### 6.2 Critical Issues

1. **No Logo:** The Navbar has no central logo — just link groups on left and right with empty center. On mobile, only a hamburger menu is visible — no school identity anchor at all.

2. **No CTA Above the Fold:** The hero has undersized text links, but no primary call-to-action button (e.g., "Apply Now" or "Book a Tour"). The CTA button in the bottom metadata bar says only "Explore" with no context.

3. **All 7 Navbar Links Are Dead (`href="#"`):** "Campus Map," "Curriculum," "Islamic Values," "Plan Your Visit" — all go to `#`. Destroys credibility instantly.

4. **Geographic Identity Crisis:** "America's first public Islamic school" in "Boston, MA" vs. Nigerian `.edu.ng` email and `+234` phone number. Pick one identity and commit to it.

5. **No Online Admissions Flow:** A school website's primary conversion goal is admission enquiries. There is no prominent "Apply Now" button linking to a real form.

6. **Static / Potentially Fictional Stats:** 38+ years, 2,500+ students, 500+ Huffadh — all hardcoded. Must be verified against real data.

7. **Testimonial Avatars from pravatar.cc:** Generic third-party service. Should use real photos or initials-based avatars.

### 6.3 Concrete Improvement Recommendations

**Layout:**
- Add a centered logo mark to the Navbar center: `[left links] [LOGO] [right links]`
- Add a primary "Apply for Admission" CTA button in the hero content panel
- Add a sticky enrollment-season announcement banner above the navbar
- Add a Trust Bar below the hero (accreditations, partnerships, awards)

**Content:**
- Resolve geographic identity — commit to one location
- Replace hardcoded stats with verified figures
- Replace pravatar.cc avatars with real photos or branded initials avatars
- Wire all nav links to real pages with smooth scroll anchors

**Visual / UX:**
- Add scroll-triggered animations to About and Program sections using `useInView`
- Replace emoji icons in StatsSection with Lucide icons in brand palette
- Add a Video Modal for the "Cambridge Curriculum" featured item in the hero
- Add backend integration for the newsletter form in the Footer
- Add an "Admission Form" section with a link to `/admission/apply/[branchId]`

---

## 7. Code Quality Review

### 7.1 Frontend Code Quality

| Issue | File | Severity |
|---|---|---|
| 163 `console.error` calls left in production code | All pages | High |
| `any` type used pervasively in Student, AuthContext, service params | Multiple | High |
| `cn()` re-defined locally instead of imported from lib | Sidebar.tsx | Medium |
| Desktop and mobile sidebar nav lists duplicated (~80 lines each) | Sidebar.tsx | Medium |
| `ThemeProvider` imported but not used in JSX | Providers.tsx | Medium |
| `exceljs` in frontend bundle — Excel generation should be backend-only | package.json | Medium |
| Business logic mixed into page components instead of custom hooks | Multiple pages | Medium |
| Named vs. default export inconsistency across components | Multiple | Low |

### 7.2 Backend Code Quality

| Issue | File | Severity |
|---|---|---|
| `@Post('login')` body is untyped `@Body() req` — no DTO | auth.controller.ts | Critical |
| No `ValidationPipe` applied globally in `main.ts` | main.ts | Critical |
| No rate limiting on auth endpoints | main.ts | Critical |
| `/auth/bootstrap` is unauthenticated and creates SuperAdmin | auth.controller.ts | Critical |
| `getProfile()` returns raw JWT payload, not full DB user record | auth.controller.ts | High |
| 9 debug `console.log` statements in backend source | Various | Medium |
| `seed.ts` uses `Date.now()` suffixes — duplicate records on re-run | seed.ts | High |
| `academicSession.create` (no upsert) — duplicate sessions on re-run | seed.ts | High |

### 7.3 Project-Level Issues

- 7 progress/verification markdown files and 9 shell/PowerShell scripts in the backend root are development artifacts that should be moved to `/docs` or gitignored.
- `annual_test.pdf` and `test_batch.zip` are binary test files committed to the repo root — should be removed.
- `.env` is present in the backend directory and if git-tracked, exposes Supabase credentials (including the actual password in the DATABASE_URL). **Critical security vulnerability.**

---

## 8. Performance & Security

### 8.1 Performance Issues

| Issue | Impact | Recommendation |
|---|---|---|
| Puppeteer running on serverless (Netlify Functions) | PDF generation cold-starts and frequently times out (10s limit) | Use Cloudflare Browser Rendering, or move to pdfkit-only, or a persistent server |
| HeroSlider loads 2 external video URLs on initial render, even for non-active slides | High bandwidth; poor LCP on mobile | Lazy-load videos for non-active slides using IntersectionObserver |
| External Unsplash images have no `sizes` or `quality` prop | Oversized images downloaded on mobile | Add `sizes="(max-width: 768px) 100vw, 50vw"` and `quality={85}` |
| Promise.all fires 3 API calls (2 discarded) in students/page.tsx | Unnecessary network usage | Remove the two unused calls |
| `exceljs` (large library ~1MB) in the frontend bundle | Bundle size inflation | Move Excel generation to backend |
| `html5-qrcode` loaded globally even on non-QR pages | Bundle bloat | Use `next/dynamic` with `{ ssr: false }` |
| Swiper and Framer Motion not code-split | Larger initial JS bundle | Dynamically import only on pages that need them |

### 8.2 Security Vulnerabilities

| Vulnerability | Severity | Detail |
|---|---|---|
| `.env` possibly committed to git | 🔴 CRITICAL | Supabase DB credentials, JWT secret in version control |
| No `ValidationPipe` globally in `main.ts` | 🔴 CRITICAL | All request bodies bypass class-validator rules |
| `/auth/bootstrap` is publicly accessible | 🔴 CRITICAL | Anyone can POST and create a Super Admin account |
| No rate limiting on login endpoint | 🔴 CRITICAL | Unlimited brute-force attacks against POST /auth/login |
| No helmet.js / security headers | 🟠 HIGH | Missing CSP, X-Frame-Options, X-Content-Type-Options |
| JWT stored in localStorage (not httpOnly cookie) | 🟠 HIGH | Vulnerable to XSS token theft |
| `ENCRYPTION_SALT=basaeer-salt-2026` (predictable) | 🟠 HIGH | Weak salt reduces bcrypt security |
| No CSRF protection | 🟡 MEDIUM | Good practice even for JWT-based auth |
| `/auth/register` accepts `any` body | 🟡 MEDIUM | SUPER_ADMIN could inject arbitrary fields |

---

## 9. Final Recommendations — Prioritized Roadmap

### 🔴 Critical — Fix Before Any Launch

| # | Action | Effort |
|---|---|---|
| C1 | Remove `.env` from git tracking; rotate all Supabase credentials and JWT secret | 1 hour |
| C2 | Delete or secure `/auth/bootstrap` endpoint behind env-level secret | 30 min |
| C3 | Add `ValidationPipe` globally in `main.ts` with `whitelist: true, forbidNonWhitelisted: true` | 30 min |
| C4 | Add rate limiting to auth endpoints using `@nestjs/throttler` | 2 hours |
| C5 | Resolve brand identity — remove all "Boston, MA" / "America's first" content if school is Nigerian, or vice versa | 3 hours |
| C6 | Add `401` response interceptor to `api.ts` to handle token expiry globally | 1 hour |

### 🟠 High Priority — Within 2 Weeks

| # | Action | Effort |
|---|---|---|
| H1 | Wire `GlobalSearch` into the `Header` — replace dummy input with real component | 2 hours |
| H2 | Fix the duplicate "Library" sidebar group — consolidate to one entry | 30 min |
| H3 | Complete frontend RBAC in `ProtectedRoute` — execute the redirect for unauthorized roles | 1 hour |
| H4 | Add `helmet` middleware to NestJS for security headers | 30 min |
| H5 | Create `LoginDto` with `@IsEmail()` and `@IsString()` for `POST /auth/login` | 30 min |
| H6 | Fix all `any` types in `studentService.ts` and `AuthContext` | 4 hours |
| H7 | Fix race condition in `AuthContext.login()` — await profile fetch before pushing to dashboard | 30 min |
| H8 | Import `cn()` from `lib/utils.ts` in Sidebar instead of redefining it | 15 min |
| H9 | Remove development artifacts from repo root (verify scripts, test files, debug logs, pdf/zip) | 1 hour |
| H10 | Fix `<style jsx global>` usage — replace with CSS Modules or Tailwind @layer in globals.css | 1 hour |

### 🟡 Medium Priority — Within 1 Month

| # | Action | Effort |
|---|---|---|
| M1 | Implement Password Reset flow (backend token + frontend page) | 2 days |
| M2 | Wire all Landing Page nav links to real pages/sections | 4 hours |
| M3 | Add a school logo to Navbar and Footer | Design + 2 hours |
| M4 | Add "Apply Now" primary CTA button to hero and navbar | 2 hours |
| M5 | Refactor Sidebar — extract `NavList` sub-component to eliminate duplication | 3 hours |
| M6 | Replace emoji in StatsSection with Lucide icons | 30 min |
| M7 | Remove `exceljs` from frontend; generate reports on backend and serve as file downloads | 1 day |
| M8 | Dynamically import Swiper, Framer Motion, and html5-qrcode | 3 hours |
| M9 | Fix `Promise.all` in students/page.tsx — remove the two unused API calls | 15 min |
| M10 | Add accessibility attributes: `aria-label` on icon buttons, `role="status"` on spinners, `htmlFor` on labels | 3 hours |
| M11 | Connect newsletter form to a backend endpoint or email service | 1 day |

### 🟢 Low Priority — Next Quarter

| # | Action | Effort |
|---|---|---|
| L1 | Implement Dark Mode properly — add toggle in Header, configure ThemeProvider | 1 day |
| L2 | Complete all placeholder (Bulk SMS/Email, QR reports, Alumni) pages | 1 week |
| L3 | Implement real-time notifications — bell icon with polling or WebSocket | 3 days |
| L4 | Extract custom hooks from page components (`useStudentStats`, `useDashboardData`) | 2 days |
| L5 | Add proper Student/Parent portal views for STUDENT and PARENT roles | 1 week |
| L6 | Write unit tests for auth service and finance service (currently near zero coverage) | 1 week |
| L7 | Replace Puppeteer on serverless with pdfkit or move to persistent server | 3 days |
| L8 | Add scroll-triggered animations to landing page sections using Framer Motion `useInView` | 4 hours |
| L9 | Add missing `sizes` prop to all Next.js `<Image>` components | 2 hours |
| L10 | Migrate JWT from localStorage to httpOnly cookies with refresh token strategy | 3 days |

---

## Appendix: Quick Stats

| Metric | Value |
|---|---|
| Total Frontend Pages | 150 |
| Pages Behind RestorationPlaceholder | 28 (18.7%) |
| Backend Modules | 34 |
| Frontend Services | 26 |
| UI Components (primitives) | 16 |
| `console.error` calls in frontend | 163 |
| Dead `href="#"` links (landing + login) | 9+ |
| Lines of duplicate Sidebar code | ~80 |
| Critical Security Issues | 4 |
| TypeScript `any` violations in core interfaces | 15+ |
| Overall Production Readiness Score | 4 / 10 |

---

*End of Audit Report — Basaeer School Management System*  
*Generated: April 7, 2026*
