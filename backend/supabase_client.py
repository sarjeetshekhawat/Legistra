"""
Supabase client initializer for Legistra.
Provides a singleton Supabase client and Storage helpers.
"""

import os
import logging
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Singleton client
# ---------------------------------------------------------------------------
_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Return (and lazily create) the Supabase client singleton."""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set in the environment / .env file."
            )
        _supabase_client = create_client(url, key)
        logger.info("Supabase client initialised (%s)", url)
    return _supabase_client


# ---------------------------------------------------------------------------
# Storage helpers
# ---------------------------------------------------------------------------
STORAGE_BUCKET = "documents"


def upload_file_to_storage(file_bytes: bytes, storage_path: str, content_type: str = "application/octet-stream") -> str:
    """
    Upload a file to Supabase Storage.

    Args:
        file_bytes:    Raw bytes of the file.
        storage_path:  Object path inside the bucket, e.g. "user-uuid/filename.pdf".
        content_type:  MIME type of the file.

    Returns:
        The storage_path that was written (same as input).
    """
    sb = get_supabase()
    try:
        sb.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "true"},
        )
        logger.info("Uploaded %s to storage bucket '%s'", storage_path, STORAGE_BUCKET)
        return storage_path
    except Exception as e:
        logger.error("Storage upload failed for %s: %s", storage_path, e)
        raise


def get_file_url(storage_path: str, expires_in: int = 3600) -> str:
    """
    Generate a signed URL for a stored file.

    Args:
        storage_path:  Object path inside the bucket.
        expires_in:    Seconds until the URL expires (default 1 hour).

    Returns:
        Signed URL string.
    """
    sb = get_supabase()
    try:
        result = sb.storage.from_(STORAGE_BUCKET).create_signed_url(
            path=storage_path, expires_in=expires_in
        )
        return result["signedURL"]
    except Exception as e:
        logger.error("Failed to create signed URL for %s: %s", storage_path, e)
        raise


def download_file(storage_path: str) -> bytes:
    """
    Download a file from Supabase Storage.

    Args:
        storage_path:  Object path inside the bucket.

    Returns:
        Raw bytes of the file.
    """
    sb = get_supabase()
    try:
        data = sb.storage.from_(STORAGE_BUCKET).download(storage_path)
        return data
    except Exception as e:
        logger.error("Storage download failed for %s: %s", storage_path, e)
        raise
