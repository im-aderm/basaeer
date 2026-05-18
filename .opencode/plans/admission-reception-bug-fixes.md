# Admission + Reception Module Bug Fixes

## Part A: Admission Module

### Bug 1: File Uploads Failing (Critical) — Birth Certificate, All Documents

**Files:**
- `frontend/src/components/admission/steps/DocumentUpload.tsx` line 156-158
- `frontend/src/components/admission/steps/PaymentStep.tsx` line 91-93

**Root Cause:** Both components manually set `Content-Type: multipart/form-data` header. When axios sends `FormData`, it must auto-generate the Content-Type with a boundary string (e.g., `multipart/form-data; boundary=----WebKitFormBoundary...`). Manually overriding it strips the boundary, so the backend's Multer cannot parse the request body. The file arrives as `undefined`, triggering `BadRequestException('No file uploaded')`.

**Fix — DocumentUpload.tsx line 156-158:**
```diff
- const response = await api.post(url, formData, {
-   headers: { "Content-Type": "multipart/form-data" },
- });
+ const response = await api.post(url, formData);
```

**Fix — PaymentStep.tsx line 91-93:**
```diff
- const response = await api.post("/upload/payment-proof", formDataUpload, {
-   headers: { "Content-Type": "multipart/form-data" },
- });
+ const response = await api.post("/upload/payment-proof", formDataUpload);
```

### Bug 2: Passport Photo Dimension Too Strict

**File:** `frontend/src/components/admission/steps/DocumentUpload.tsx` line 67

**Current:** Requires exactly 300×300px
```typescript
if (width !== PASSPORT_WIDTH || height !== PASSPORT_HEIGHT) {
```

**Fix:** Accept images up to 300×300px (≤300 width AND ≤300 height)
```diff
- if (width !== PASSPORT_WIDTH || height !== PASSPORT_HEIGHT) {
+ if (width > PASSPORT_WIDTH || height > PASSPORT_HEIGHT) {
```

Also update the error message on line 68:
```diff
- showError(`${label}: Photo must be exactly ${PASSPORT_WIDTH}×${PASSPORT_HEIGHT}px (current: ${width}×${height}px)`);
+ showError(`${label}: Photo must be at most ${PASSPORT_WIDTH}×${PASSPORT_HEIGHT}px (current: ${width}×${height}px)`);
```

### Bug 3: UI Text Still Says "Exactly 300×300px"

**File:** `frontend/src/components/admission/steps/DocumentUpload.tsx`

**Line 306 — Info banner:**
```diff
- Passport photo must be ≤200KB, exactly 300×300px, with white background.
+ Passport photo must be ≤200KB, up to 300×300px, with white background.
```

**Line 261 — Validation badge:**
```diff
- 300×300px
+ ≤300×300px
```

---

## Part B: Reception Module — Dialog Responsiveness & Scrollability

### Root Cause (All 5 Reception Pages)
All reception dialogs share the same two problems:

1. **No scrollable content area:** `DialogContent` has no `overflow-y-auto` or `max-h` constraint. When the form content exceeds viewport height (common on mobile/small screens), the bottom of the form and the submit button are cut off and unreachable — the page becomes unscrollable.

2. **No mobile viewport-height constraint:** `DialogContent` uses Radix UI's default `fixed left-[50%] top-[50%] translate-y-[-50%]` centering. On small screens, the dialog extends beyond the top and bottom edges of the viewport with no way to scroll to see the overflow.

### Affected Pages & Dialogs

| Page | Dialogs Affected | DialogContent class |
|------|-----------------|---------------------|
| `enquiry/page.tsx` | New Enquiry (line 212), Edit Enquiry (line 324) | `rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl` |
| `call-log/page.tsx` | Record Call (line 165), Edit Call Log (line 241) | `rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl border-border shadow-2xl` |
| `visitor-log/page.tsx` | Add Entry (line 206), Edit Visitor (line 296) | `rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl border-border shadow-2xl` |
| `complaint/page.tsx` | Log Complaint (line 207), Edit Complaint (line 289) | `rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl border-border shadow-2xl` |
| `postal/page.tsx` | New Record (line 171), Edit Postal (line 248) | `rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl border-border shadow-2xl` |

### Fix Pattern (Apply to ALL 10 DialogContent instances)

**Current:**
```tsx
<DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl border-border shadow-2xl">
```

**Fixed:**
```tsx
<DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
```

Key additions:
- `max-h-[90vh]` — caps dialog height at 90% of viewport
- `overflow-y-auto` — enables vertical scrolling when content exceeds the cap

Additionally, the form content wrapper inside each dialog should have `overflow-y-auto` applied to the form element itself for better scroll behavior on mobile:

```diff
- <form onSubmit={handleCreate} className="space-y-6 pt-4">
+ <form onSubmit={handleCreate} className="space-y-6 pt-4 overflow-y-auto">
```

### Per-File Changes Summary

| # | File | Line(s) | Change |
|---|------|---------|--------|
| 7 | `enquiry/page.tsx` | 212 | Add `max-h-[90vh] overflow-y-auto` to DialogContent |
| 8 | `enquiry/page.tsx` | 217 | Add `overflow-y-auto` to form element |
| 9 | `enquiry/page.tsx` | 324 | Add `max-h-[90vh] overflow-y-auto` to DialogContent (edit) |
| 10 | `enquiry/page.tsx` | 329 | Add `overflow-y-auto` to form element (edit) |
| 11 | `call-log/page.tsx` | 165 | Add `max-h-[90vh] overflow-y-auto` to DialogContent |
| 12 | `call-log/page.tsx` | 170 | Add `overflow-y-auto` to form element |
| 13 | `call-log/page.tsx` | 241 | Add `max-h-[90vh] overflow-y-auto` to DialogContent (edit) |
| 14 | `call-log/page.tsx` | 246 | Add `overflow-y-auto` to form element (edit) |
| 15 | `visitor-log/page.tsx` | 206 | Add `max-h-[90vh] overflow-y-auto` to DialogContent |
| 16 | `visitor-log/page.tsx` | 211 | Add `overflow-y-auto` to form element |
| 17 | `visitor-log/page.tsx` | 296 | Add `max-h-[90vh] overflow-y-auto` to DialogContent (edit) |
| 18 | `visitor-log/page.tsx` | 301 | Add `overflow-y-auto` to form element (edit) |
| 19 | `complaint/page.tsx` | 207 | Add `max-h-[90vh] overflow-y-auto` to DialogContent |
| 20 | `complaint/page.tsx` | 212 | Add `overflow-y-auto` to form element |
| 21 | `complaint/page.tsx` | 289 | Add `max-h-[90vh] overflow-y-auto` to DialogContent (edit) |
| 22 | `complaint/page.tsx` | 294 | Add `overflow-y-auto` to form element (edit) |
| 23 | `postal/page.tsx` | 171 | Add `max-h-[90vh] overflow-y-auto` to DialogContent |
| 24 | `postal/page.tsx` | 176 | Add `overflow-y-auto` to form element |
| 25 | `postal/page.tsx` | 248 | Add `max-h-[90vh] overflow-y-auto` to DialogContent (edit) |
| 26 | `postal/page.tsx` | 253 | Add `overflow-y-auto` to form element (edit) |

---

## Complete Summary

| # | Module | File | Change |
|---|--------|------|--------|
| 1 | Admission | `DocumentUpload.tsx` | Remove manual `Content-Type` header |
| 2 | Admission | `PaymentStep.tsx` | Remove manual `Content-Type` header |
| 3 | Admission | `DocumentUpload.tsx` | Change `!==` to `>` for dimension check |
| 4 | Admission | `DocumentUpload.tsx` | Update error message "exactly" → "at most" |
| 5 | Admission | `DocumentUpload.tsx` | Update info banner text |
| 6 | Admission | `DocumentUpload.tsx` | Update badge text |
| 7-10 | Reception | `enquiry/page.tsx` | Fix dialog scrollability (2 dialogs × 2 changes each) |
| 11-14 | Reception | `call-log/page.tsx` | Fix dialog scrollability (2 dialogs × 2 changes each) |
| 15-18 | Reception | `visitor-log/page.tsx` | Fix dialog scrollability (2 dialogs × 2 changes each) |
| 19-22 | Reception | `complaint/page.tsx` | Fix dialog scrollability (2 dialogs × 2 changes each) |
| 23-26 | Reception | `postal/page.tsx` | Fix dialog scrollability (2 dialogs × 2 changes each) |

**Total: 26 changes across 7 files**
