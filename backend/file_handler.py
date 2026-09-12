"""Reading uploaded files (including zip archives) into plain text safely."""

import io
import zipfile
import chardet

MAX_FILE_CHARS = 60_000          # per-file cap so one huge file can't blow the prompt
MAX_FILES_FROM_ZIP = 30          # ignore extra files in a huge zip
SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf",
    ".zip", ".rar", ".7z", ".exe", ".dll", ".so", ".mp4", ".mp3",
    ".woff", ".woff2", ".ttf", ".eot", ".bin",
}


def _decode(raw: bytes) -> str | None:
    if not raw:
        return ""
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        guess = chardet.detect(raw)
        enc = guess.get("encoding")
        if not enc:
            return None
        try:
            return raw.decode(enc, errors="replace")
        except Exception:
            return None


def read_upload(filename: str, raw: bytes) -> list[dict]:
    """
    Returns a list of {name, content} dicts.
    A plain text/code file returns a single-item list.
    A .zip returns one item per readable file inside it.
    Unreadable/binary files are skipped with a note.
    """
    lower = filename.lower()

    if lower.endswith(".zip"):
        return _read_zip(raw)

    ext = "." + lower.rsplit(".", 1)[-1] if "." in lower else ""
    if ext in SKIP_EXTENSIONS:
        return [{"name": filename, "content": "[binary file - skipped, not sent to the AI]"}]

    text = _decode(raw)
    if text is None:
        return [{"name": filename, "content": "[could not decode file - skipped]"}]
    return [{"name": filename, "content": text[:MAX_FILE_CHARS]}]


def _read_zip(raw: bytes) -> list[dict]:
    out = []
    try:
        with zipfile.ZipFile(io.BytesIO(raw)) as zf:
            names = [n for n in zf.namelist() if not n.endswith("/")][:MAX_FILES_FROM_ZIP]
            for name in names:
                ext = "." + name.lower().rsplit(".", 1)[-1] if "." in name else ""
                if ext in SKIP_EXTENSIONS:
                    out.append({"name": name, "content": "[binary file - skipped, not sent to the AI]"})
                    continue
                try:
                    text = _decode(zf.read(name))
                except Exception:
                    text = None
                if text is None:
                    out.append({"name": name, "content": "[could not decode file - skipped]"})
                else:
                    out.append({"name": name, "content": text[:MAX_FILE_CHARS]})
    except zipfile.BadZipFile:
        out.append({"name": "archive", "content": "[not a valid zip file]"})
    return out
