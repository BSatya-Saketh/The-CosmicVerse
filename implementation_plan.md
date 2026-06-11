# Implementation Plan — The CosmicVerse Agile Sprints

This plan details a 6-sprint technical roadmap to transform **The CosmicVerse** from a static reference manual into a deploy-ready, feature-rich, and AI-native 2026 educational platform.

## User Review Required

> [!IMPORTANT]
> **API Keys & AI Credentials:**
> Sprints 5 and 6 rely on external AI inference (e.g. Gemini, OpenAI, or Anthropic API) and Voice synthesis services. We will configure backend routes to securely forward requests to these services using environment variables (`.env`).
> Please verify if you have existing developer API keys we should target, or if we should set up lightweight web fallbacks (e.g., client-side Web Speech API for TTS, and local model inference) for local development.

> [!WARNING]
> **Database Host:**
> Sprint 3 introduces MongoDB persistence. We will design the backend to run with local MongoDB or MongoDB Atlas via a connection string. You will need a MongoDB URI to run and test Sprint 3 onwards.

---

## Open Questions

1. **AI Model Preference:** Which LLM provider (Gemini, OpenAI, Anthropic, or local Ollama) do you prefer for the inline code tutor and grading backend? We recommend **Gemini 1.5/2.0 Pro** or **Flash** for speed, cost-effectiveness, and code reasoning.
2. **React Version Upgrade:** Do you want to upgrade the package dependencies from React 18.3.1 to React 19 now in Sprint 1, or keep the existing dependencies to ensure complete compatibility with other packages? (We recommend doing it in Sprint 1).

---

## Proposed Changes

### Sprint 1: Deploy-Readiness & Authentic Progress

Refactor core systems to build correct progress states, upgrade React, and add crash resilience.

#### [MODIFY] [Sidebar.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/Sidebar.jsx)
* Replace the route-index progress bar with a checklist aggregator.
* Progress should read completed sub-topics from a `localStorage` registry of finished page sections.

#### [NEW] [PageTOC.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/PageTOC.jsx) (Improvement)
* Add interactive checklist boxes next to headings so users can mark sections as completed. This will trigger updates to `Sidebar.jsx`'s progress bar.

#### [MODIFY] [package.json](file:///l:/Projects/fullStackCompass-main/client/package.json)
* Upgrade React & React-DOM to version `19.0.0` to match instructions and README statements.

#### [NEW] [ErrorBoundary.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/ErrorBoundary.jsx)
* Create a React Error Boundary wrapper around routing pages to catch client crashes and show a stylized 404/Error panel instead of a white screen.

---

### Sprint 2: Core Platform Extensions (Search, Bookmarks, & Notes)

Add essential navigational and note-taking utilities.

#### [NEW] [SearchOverlay.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/SearchOverlay.jsx)
* Implement a client-side fuzzy search bar overlaying the dashboard.
* Indexes headers and curriculum keywords defined in `navData.js`.

#### [MODIFY] [CodeBlock.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/CodeBlock.jsx)
* Add a "Bookmark" button next to code headers. Bookmarks will save to `localStorage` (later synced to DB).

#### [NEW] [BookmarksPage.jsx](file:///l:/Projects/fullStackCompass-main/client/src/pages/BookmarksPage.jsx)
* Create a dashboard route displaying all starred code blocks categorized by technology.

#### [NEW] [NotesDrawer.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/NotesDrawer.jsx)
* Create a toggleable overlay drawer where users can type rich text notes for the current topic, auto-saving to local storage.

---

### Sprint 3: The MERN Backend Foundation (Auth, DB, & Sync)

Integrate a secure Node/Express backend and MongoDB persistence layer to back up user profiles.

#### [NEW] [server/package.json](file:///l:/Projects/fullStackCompass-main/server/package.json)
* Set up a backend Node service with dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, and `nodemon`.

#### [NEW] [server/server.js](file:///l:/Projects/fullStackCompass-main/server/server.js)
* Initialize Express server, configure middleware, connect to MongoDB, and handle routes.

#### [NEW] [server/models/](file:///l:/Projects/fullStackCompass-main/server/models/)
* Create database schemas:
  * `User.js` (email, hashPassword)
  * `Progress.js` (completed items map, user association)
  * `Bookmark.js` (code block snippet references)
  * `Note.js` (user notes, associated topics)

#### [NEW] [server/routes/](file:///l:/Projects/fullStackCompass-main/server/routes/)
* Create auth middleware and routes `/api/auth`, `/api/progress`, `/api/bookmarks`, and `/api/notes`.

---

### Sprint 4: Interactive Native Playgrounds & Quizzes

Replace the link-farm with native browser compilers and test sheets.

#### [NEW] [QuizArena.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/QuizArena.jsx)
* Replace external links with native in-page MCQ quiz forms with score calculators, validation, and explanations.

#### [NEW] [CodePlayground.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/CodePlayground.jsx)
* Implement a Monaco Editor panel.
* Add an iframe compiler to run Javascript, HTML, and CSS directly in the dashboard, letting users experiment with MERN examples.

---

### Sprint 5: AI-Native Upgrades (Socrates AI Code Tutor & Reviews)

Add generative AI code feedback directly into the study materials.

#### [MODIFY] [CodeBlock.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/CodeBlock.jsx)
* Add an "Ask Socrates" AI button to trigger a context panel.

#### [NEW] [server/routes/ai.js](file:///l:/Projects/fullStackCompass-main/server/routes/ai.js)
* Implement endpoints:
  * `/api/ai/explain`: Receives code content and yields a step-by-step chat description.
  * `/api/ai/grade`: Analyzes user-submitted mini-projects and provides grade assessments.

---

### Sprint 6: Multimodal AI Upgrades (Adaptive Quizzes & Voice Podcasts)

Complete the 2026 AI capability suite.

#### [NEW] [server/routes/podcast.js](file:///l:/Projects/fullStackCompass-main/server/routes/podcast.js)
* Set up TTS synthesis integrations to generate MP3 streams.

#### [NEW] [AudioPlayer.jsx](file:///l:/Projects/fullStackCompass-main/client/src/components/AudioPlayer.jsx)
* Build a premium widget at the top of curriculum modules to play AI voice audio overviews.

---

## Verification Plan

### Automated Tests
* Set up Vitest on the frontend client to verify routing stability and progress calculation.
* Run API integration tests on Node backend endpoints using Supertest.

### Manual Verification
* Deploy client to Vercel and backend to Render/Fly.io.
* Test persistent checklist progression by logging in on multiple browser instances.
* Verify real-time AI code explanation panels and MCQ scoring accuracy.
