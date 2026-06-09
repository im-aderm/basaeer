# R2 (Cloudflare) Setup Guide

## Environment Variables

```env
# Required — R2 credentials (from Cloudflare Dashboard → R2 → Manage API Tokens)
R2_ACCOUNT_ID=<your-account-id>
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>

# Optional — public URL for serving uploaded files
# If set, uploaded files are served directly from this R2 public endpoint
# If empty/null/not set, files fall back to local filesystem via Nginx
R2_PUBLIC_DOMAIN=
R2_BUCKET_NAME=basaer-uploads
```

## Option 1: R2 Public Domain (Recommended for Production)

1. In Cloudflare Dashboard, go to **R2 → your bucket → Settings**
2. Under **Public URL**, click **Connect Domain**
3. Choose either:
   - **`<bucket>.r2.dev`** — free subdomain (e.g. `https://basaer-uploads.r2.dev`)
   - A custom domain you own (e.g. `https://cdn.basaerschools.com.ng`)
4. Copy the full URL (with `https://`) into `R2_PUBLIC_DOMAIN`

**Example:**
```env
R2_PUBLIC_DOMAIN=https://basaer-uploads.r2.dev
```

When set, uploaded files return URLs like:
```
https://basaer-uploads.r2.dev/events/123_abc.jpg
```

## Option 2: No Public Domain (Local Fallback via Nginx)

Leave `R2_PUBLIC_DOMAIN` **empty or unset**:

```env
R2_PUBLIC_DOMAIN=
```

When unset:
- Files are uploaded to R2 for storage but served via Nginx on your own domain
- The upload controller constructs the URL using the request's Host header
- Nginx proxies `/uploads/` to the local fallback directory

**Important:** With this option, the Nginx config must have this location block (already in `nginx/conf.d/default.conf`):
```nginx
location /uploads/ {
    alias /var/www/uploads/;
}
```

URLs will look like:
```
https://basaerschools.com.ng/uploads/fallback/events/123_abc.jpg
```

## Common Issues

### "pub-xxxxxxxxxxxx" domain doesn't resolve
The `pub-xxxxxxxxxxxx` string is the **bucket ID**, not a valid domain. You must append `.r2.dev` or a custom domain:
```
❌ https://pub-1d6edd65786446ab9ffa
✅ https://pub-1d6edd65786446ab9ffa.r2.dev
✅ https://cdn.yourdomain.com
```

### "must be a URL address" validation errors
The `@IsUrl()` validator rejects localhost and relative URLs by default. The app now uses:
```
@IsUrl({ require_tld: false, require_protocol: false, require_host: false })
```
This accepts localhost, relative paths, and any domain format.

### Files upload successfully but images don't load
1. Check the returned URL in browser DevTools → Network tab
2. If it ends with `.r2.dev`, ensure the R2 bucket has **public access** enabled
3. If it's a relative path, ensure Nginx is proxying `/uploads/` correctly
4. Verify `app.set('trust proxy', 1)` is set in `backend/src/main.ts`

### R2 credentials exist but uploads fail
The service falls back to local filesystem automatically:
```
backend/src/upload/upload.service.ts:124-128
```
Check the backend logs for: `"R2 upload failed, falling back to local filesystem"`
