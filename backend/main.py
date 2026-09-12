import io
import os
import zipfile

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from file_handler import read_upload

app = FastAPI(title="nextgen-analytics-ai")

# The AI chat itself happens client-side via Puter (OAuth, free models) -
# this backend only handles reading uploads (incl. zip extraction) and
# packaging downloads. No API keys live on the server.
origins = [os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"), "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatFile(BaseModel):
    name: str
    content: str


class DownloadRequest(BaseModel):
    filename: str
    content: str


class DownloadZipRequest(BaseModel):
    files: list[ChatFile]
    zip_name: str = "nextgen-fixed-files.zip"


@app.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    results = []
    for f in files:
        raw = await f.read()
        results.extend(read_upload(f.filename, raw))
    return {"files": results}


@app.post("/api/download")
def download_file(req: DownloadRequest):
    buf = io.BytesIO(req.content.encode("utf-8"))
    return StreamingResponse(
        buf,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{req.filename}"'},
    )


@app.post("/api/download-zip")
def download_zip(req: DownloadZipRequest):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in req.files:
            zf.writestr(f.name, f.content)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{req.zip_name}"'},
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serves the built React frontend (frontend/dist, copied here as ./static
# during the GitHub Actions deploy step) from the same app as the API.
# In local dev the frontend runs separately via `npm run dev`, so this
# directory won't exist yet - check_dir=False avoids crashing on import.
app.frontend("/", directory="static", fallback="index.html", check_dir=False)
