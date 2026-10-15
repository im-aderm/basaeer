# Basa'er Landing Page Application (`apps/landing`)

This is the standalone public landing page and marketing website for **Basa'er Schools & Colleges**.

It has been completely decoupled from the main school management portal (`frontend`) so that it can be hosted independently (on Vercel, Netlify, Docker, AWS, or any static/Node hosting) with ultra-fast performance, zero authentication overhead, and 100% exact visual fidelity.

## Features & Pages

- **Home Page (`/`)**: 100% exact match to the original design with:
  - Responsive animated **Navbar**
  - High-definition Hero video background with fallback and aurora glow effects
  - **Certifications & Accreditations Marquee** (NBAIS, UBEC, KDUBEC, WAEC, NECO, NSSCE, CAC)
  - **About Section** (Mission, Vision, Core Values)
  - **The Basaer Edge** Bento Grid (Qur'anic & Academic distinction)
  - **Academics & Program Slider** (Early Years, Primary, Secondary, STEM, Tahfeez)
  - **Key Statistics & Achievements**
  - **Campuses Overview** (Kaduna, Kano, Plateau, Bauchi)
  - **Parent Testimonials** interactive spotlight
  - **Mobile App CTA** (App Store & Google Play)
  - **News & Insights**
  - **Admission CTA**
  - **Footer** with quick links, community, social links, and newsletter toast feedback
- **Public Subpages**:
  - `/about`: School history, philosophy, and values
  - `/academics/*`: Tahfeez, Islamic Studies, Primary, Secondary, Nursery
  - `/admission`: Admission procedures, timeline, and requirements
  - `/campuses` & `/campuses/[campus]`: Campus details and section information
  - `/events` & `/events/[slug]`: Public campus events
  - `/contact`: Campus contacts, addresses, and inquiry form
  - `/faq`: Frequently asked questions
  - `/careers`: Vacancies and application process
  - `/gallery`: Campus photo gallery
  - `/news`: Announcements and updates
  - `/alumni`: Alumni association
  - `/student-life`: Student activities, clubs, and boarding life

## Environment Variables

Create a `.env.local` or configure your hosting environment with:

```env
# Optional: URL of the main school management portal (where users login)
# Example: https://app.basaerschools.com.ng or http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Backend API URL for dynamic event data
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

If `NEXT_PUBLIC_APP_URL` is omitted, the "Login" button defaults to `/login`.

## Local Development

```bash
cd apps/landing
npm install
npm run dev
```

The landing site runs on `http://localhost:3002`.

## Production Build

```bash
npm run build
npm start
```

## Docker Deployment

To build and run as a standalone Docker container:

```bash
cd apps/landing
docker build -t basaer-landing .
docker run -p 3000:3000 -e NEXT_PUBLIC_APP_URL=https://app.basaerschools.com.ng basaer-landing
```
