# Admission Module Bug Fixes

## Bug 1: File Uploads Failing (Critical) — Birth Certificate, All Documents

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

---

## Bug 2: Passport Photo Dimension Too Strict

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

---

## Bug 3: UI Text Still Says "Exactly 300×300px"

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

## Summary of All Changes

| # | File | Line(s) | Change |
|---|------|---------|--------|
| 1 | `DocumentUpload.tsx` | 156-158 | Remove manual `Content-Type` header from `api.post` |
| 2 | `PaymentStep.tsx` | 91-93 | Remove manual `Content-Type` header from `api.post` |
| 3 | `DocumentUpload.tsx` | 67 | Change `!==` to `>` for dimension check |
| 4 | `DocumentUpload.tsx` | 68 | Update error message "exactly" → "at most" |
| 5 | `DocumentUpload.tsx` | 306 | Update info banner "exactly" → "up to" |
| 6 | `DocumentUpload.tsx` | 261 | Update badge text "300×300px" → "≤300×300px" |
