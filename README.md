# DevQueens

DevQueens is a girls-focused technology learning and community initiative by IshConnect. The project includes a public website, a member learning portal, an administrator workspace, and a Node.js API backed by MongoDB.

## Stack

- React, TypeScript, Vite, Tailwind CSS and React Router
- Express 5 API, Mongoose, Zod request validation
- Shared JWT session in an HTTP-only, same-site cookie; database-backed member/admin roles
- Cloudinary image uploads, PDFKit certificates and QR-code verification
- Vitest unit tests

## Local development

Requirements: Node.js 20 or later, npm, and a MongoDB instance.

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.
3. Start the API: `npm run dev:api`
4. In a second terminal, start Vite: `npm run dev`
5. Open `http://localhost:8080`.

The Vite development server proxies `/api` requests to `http://127.0.0.1:3001`. Override this with `VITE_PROXY_TARGET` if the API runs elsewhere.

## Deployment: Render API + Vercel website

The repository includes a Render Blueprint at `render.yaml` for the API and a Vercel configuration at `vercel.json` for the SPA, `/api` proxy, and deep-link rewrites. The Vercel rewrite forwards API requests to `https://devqueens.onrender.com`.

1. Create/provision a MongoDB database reachable from Render. Keep its connection string private.
2. In Render, create a Blueprint from this repository and set the prompted `MONGODB_URI`. The Blueprint generates a secure `JWT_SECRET`; set all three Cloudinary values to enable profile, community, and chat images. The API health check is `/api/health`.
3. Import the repository into Vercel with the repository root as the project root. Use the `dist` output directory and `npm run build:web` build command from `vercel.json`.
4. Add `devqueens.ishconnect.rw` to the Vercel project’s Domains settings and configure the DNS records shown by Vercel at the domain provider. Vercel handles HTTPS and the `/api/*` rewrite to Render.
5. In Render, confirm `CLIENT_ORIGIN` and `APP_URL` are exactly `https://devqueens.ishconnect.rw`. If the production domain changes, update those values and the Vercel API destination in `vercel.json`.
6. Deploy Render before Vercel, then verify `https://devqueens.ishconnect.rw/`, `https://devqueens.onrender.com/api/health`, `/api/health` through the website domain, `/sitemap.xml`, and a nested route such as `/learn/<published-course-slug>`.
7. To bootstrap the production administrator, temporarily set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the Render service environment, run `npm run seed:admin` once from the Render Shell, and then remove the seed-only password variable. Never place production credentials in source control.

The web app uses same-origin `/api` requests so the authentication cookie works through the Vercel rewrite. Do not set `VITE_API_URL` to a separate cross-origin host for this deployment. Never commit production credentials or a populated `.env` file.

### First administrator

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (at least 12 characters), then run:

```sh
npm run seed:admin
```

The seed command creates the administrator only if the email is unused. It refuses to promote an existing member account. There is no public admin registration endpoint.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `PORT` | No | API port; defaults to `3001` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Random signing key (minimum 32 characters; replace the example before deployment) |
| `CLIENT_ORIGIN` | Yes | Exact browser origin allowed by API CORS |
| `APP_URL` | Yes | Public site URL used in member profiles and certificate QR codes |
| `VITE_API_URL` | Deployment-dependent | API base URL embedded into the frontend build; defaults to `/api` |
| `VITE_PROXY_TARGET` | No | Local Vite proxy target |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret; keep server-side |
| `CERTIFICATE_SIGNER_NAME` | No | Signatory printed on course certificates |
| `CERTIFICATE_SIGNER_TITLE` | No | Signatory title printed on course certificates |
| `ADMIN_EMAIL` | Seed only | Initial administrator email |
| `ADMIN_PASSWORD` | Seed only | Initial administrator password |

Profile, community-post and chat image uploads return a configuration error until all Cloudinary values are set. Uploads are limited to 5 MB and transformed by Cloudinary.

## Workspaces and journeys

- Public: `/`, `/register`, `/login`, `/learn/:slug`, `/courses/:slug`, `/members/:memberId`, `/verify/:certificateId`
- Member: `/portal`, `/portal/community`, `/portal/analytics`, `/portal/inbox`, `/portal/courses`, `/portal/courses/:slug`, `/portal/profile`, `/portal/certificates`, `/portal/card`
- Administrator: `/admin` and sections for members, inbox, courses, assessments, certificates, team, badges, alumni, top achievers, partners, gallery, testimonials, reports and settings

Member registration asks for the member's name, email, country, school or other organization, district, and age range (not date of birth). These registration details are stored privately and are not included on public member profiles or verification pages. Public member registration and sign-in remain available at `/register` and `/login`. Administrators use the separate `/admin/login` page; non-admin credentials are rejected by its admin-only login endpoint. Signed-in administrators can create additional admin accounts at `/admin/register` while admin account creation is enabled in settings. This registration route and API require an existing administrator session; no public admin registration endpoint is exposed. Bootstrap the first administrator only with the seed command described above. A member cannot access administrator APIs by changing a URL.

Course completion and assessment eligibility are checked by the API. Multiple-choice and true/false answers are graded server-side; practical responses require administrator review. Certificates are issued only after required course progress and a passing assessment. Certificate PDFs include a public verification QR code and are downloadable by the certificate owner or an administrator. Public member profiles honor the member's visibility setting and expose only public profile fields, community posts, and non-revoked course completions. Members can share profile links, follow other public members, publish text/image posts, comment and like posts, and review follower, post, like, and comment metrics in their analytics dashboard. Authenticated members can start a private chat with the admin team; admins can reply and send community-wide inbox announcements. Chats update automatically while open and support emoji and image attachments. Administrators manage the public alumni, achiever, gallery, and testimonial stories from their corresponding content sections.

### Course JSON

The course builder accepts a JSON object with this shape. Use **Validate & preview** before import; the API validates the full document before saving it.

```json
{
  "title": "Foundations of Web Development",
  "slug": "foundations-web-development",
  "description": "Learn the foundations of the web and build your first accessible page.",
  "level": "Beginner",
  "duration": "6 weeks",
  "status": "draft",
  "completionRequirementPercent": 100,
  "modules": [
    {
      "title": "Getting started",
      "lessons": [
        {
          "title": "How the web works",
          "content": "Lesson text and instructions.",
          "exercise": "A short practice task.",
          "resources": [{ "title": "MDN", "url": "https://developer.mozilla.org/" }]
        }
      ]
    }
  ],
  "assessment": {
    "passingScore": 70,
    "attemptLimit": 3,
    "timeLimitMinutes": 45,
    "questions": [
      {
        "prompt": "Which language structures a web page?",
        "type": "multiple-choice",
        "options": ["HTML", "CSS"],
        "correctAnswer": "HTML",
        "marks": 1
      }
    ]
  }
}
```

Assessment question types are `multiple-choice`, `true-false`, and `practical`. Practical questions require `practicalInstructions`; objective answer keys are stored in the database and never returned through public course or member-enrollment APIs.

## API overview

- Authentication: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Learning: `GET /api/courses`, `POST /api/courses/:id/enroll`, lesson completion, assessment start/submit, member certificates and card data
- Public content: `GET /api/content/:kind`, `GET /api/profiles/:memberId`, `GET /api/certificates/verify/:certificateId`
- Messaging: member inbox and member-initiated admin conversations at `/api/messages/*`; administrator replies and community-wide inbox announcements at `/api/admin/inbox/*`
- Community: `GET /api/social/members` and public member profiles; authenticated feed, follows, posts, likes, comments, and personal analytics under `/api/social/*`
- Administrator APIs are under `/api/admin/*` and require the database role `admin`.

All API input is validated server-side. Authentication endpoints are rate-limited; security headers, exact-origin CORS, HTTP-only cookies, password hashing, role checks and upload size limits are enabled.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run dev:api` requires a reachable MongoDB instance. Full live workflow checks (account registration through certificate issuance and administrator content management) require MongoDB and, for image uploads, Cloudinary credentials.

## Deployment

1. Provision MongoDB and a Cloudinary account. Restrict database credentials and Cloudinary secrets to the API service.
2. Set production `NODE_ENV`, `MONGODB_URI`, a cryptographically random `JWT_SECRET`, exact `CLIENT_ORIGIN`, and `APP_URL`.
3. Serve the built `dist/` frontend from a static host. Set `VITE_API_URL` at build time to the same-site API URL or a same-origin `/api` reverse-proxy path.
4. Run `npm run build` to generate the static frontend and `server-dist/` API. Run `npm run start:api` on the API host and route `/api` to it. Keep the frontend and API on the same site so the `SameSite=Lax` session cookie is sent.
5. Enable HTTPS. Production cookies are marked `Secure`; do not expose `.env` or serve environment files publicly.
6. Configure Cloudinary and certificate signatory variables. Run the initial `npm run seed:admin` command from the built application with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set.

The public certificate record and verification endpoint are authoritative. Certificate signatory details must be reviewed and configured by IshConnect before production issuance.

The public landing page displays published alumni, achiever, gallery, and testimonial records managed from the matching administrator sections. The “Verify a member card” form looks up active public member profiles and their non-revoked course completions. The IshConnect QuickLink destination (`https://quicklink.ishconnect.rw/login`) is described on the landing page for bootcamps, instructor-led training, e-classes, and other organized programs.
