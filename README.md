# nextgen-analytics-ai

Upload broken/messy files (or a `.zip` of a whole project), pick a free
model, and get back a corrected, production-ready version of each file with
a one-click download.

**No API keys anywhere.** Sign-in and every model call go through
[Puter.js](https://developer.puter.com) in the browser — Puter's own OAuth
popup connects your account, and its free tier proxies the actual model
calls.

**Everything deploys straight from GitHub, for free**, using
[FastAPI Cloud](https://fastapicloud.com) (the official free hosting
platform from the makers of FastAPI). One deployment serves both the API
and the built React frontend from a single URL — no Render, no separate
static host, no server to manage.

## Stack

- **Frontend:** React + Vite — OAuth sign-in, chat UI, model switcher, file
  attach, per-file / zip-all download. All AI calls happen here, straight
  from the browser to Puter.
- **Backend:** FastAPI (Python) — handles file upload/zip-extraction,
  packaging downloads, and serves the built frontend (`app.frontend()`).

## Local development

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api/*` to `localhost:8000`.
On Windows, double-click **`start.bat`** in the project root to do all of
this automatically.

## Deploying — everything through GitHub

This repo already has a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds the frontend and deploys the
whole app to FastAPI Cloud on every push to `main`. You only need to do a
**one-time setup** so GitHub is allowed to deploy on your behalf.

1. **Push this repo to GitHub** (if you haven't already).

2. **Install the FastAPI Cloud CLI locally, once**, and create the app:
   ```bash
   cd backend
   pip install "fastapi[standard]"
   fastapi login        # opens a browser to sign in / sign up (free)
   fastapi deploy        # creates the app on FastAPI Cloud and deploys it
   ```
   This gives you a live URL like `https://nextgen-analytics-ai.fastapicloud.dev`.

3. **Connect GitHub Actions to that app**, still from `backend/`:
   ```bash
   fastapi cloud setup-ci --secrets-only
   ```
   This creates a deploy token and adds `FASTAPI_CLOUD_TOKEN` and
   `FASTAPI_CLOUD_APP_ID` as secrets on your GitHub repo automatically (or
   prints them for you to paste in manually, if you don't have the `gh`
   CLI). Use `--secrets-only` because this repo already ships its own
   workflow file with the frontend build step included.

4. **Push to `main`.** From now on, every push automatically:
   - builds the React frontend (`npm run build`)
   - copies the build into `backend/static/`
   - deploys the full app to FastAPI Cloud

That's it — no server to SSH into, no manual file uploads. Check progress
under the repo's **Actions** tab, and view logs/metrics on the
[FastAPI Cloud dashboard](https://dashboard.fastapicloud.com).

## How the app works

1. **Sign in** with the button on the first screen — this opens Puter's
   OAuth popup. Once connected, you get free access to every model in the
   sidebar under your own Puter account.
2. **Attach a file** (any type — code, text, or a `.zip` of a whole folder).
   The backend unzips archives in memory and reads every text file inside;
   binaries are skipped and flagged rather than sent to the model.
3. **Type what you want fixed** (or use a quick-prompt chip) and hit send.
   The chat request goes straight from your browser to Puter.
4. The model returns each corrected file inside its own code block, each
   with a **Download** button. When a reply contains more than one file, a
   **Download all as .zip** button appears too.
5. Chat history lives in your browser's `localStorage`. Delete a single
   chat with the × next to it, or wipe everything with **Clear all** in the
   sidebar.

## Available free models

GPT-6 Astra, Claude 3.5 Sonnet, ChatGPT GPT-4o, Gemini 2.0 Flash, and
DeepSeek V3 — switch anytime from the sidebar.

## Extending it

- **Add/remove a model:** edit `FREE_MODELS` in `frontend/src/puter.js`.
- **Bigger files:** raise `MAX_FILE_CHARS` / `MAX_FILES_FROM_ZIP` in
  `backend/file_handler.py`.
- **Custom domain:** FastAPI Cloud supports custom domains on the free plan
  — see the dashboard's **Custom Domains** settings for your app.
