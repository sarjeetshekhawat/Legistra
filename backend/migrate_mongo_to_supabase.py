"""
Data Migration Script: JSON files → Supabase
---------------------------------------------
Reads the existing data from backend/data/ JSON files (and optionally from
MongoDB) and inserts it into the Supabase PostgreSQL tables.

Usage:
    cd backend
    python migrate_mongo_to_supabase.py
"""

import json
import os
import sys
import logging
from datetime import datetime, timezone

# Ensure the backend directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

from supabase_client import get_supabase

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        logger.warning("File not found: %s — skipping", path)
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def safe_iso(value):
    """Normalise a date value into an ISO string that Supabase accepts."""
    if isinstance(value, str):
        return value
    if isinstance(value, datetime):
        return value.isoformat()
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Migration functions
# ---------------------------------------------------------------------------
def migrate_users(sb):
    users = load_json("users.json")
    if not users:
        logger.info("No users to migrate.")
        return 0

    inserted = 0
    for uid, u in users.items():
        row = {
            "id": u.get("_id", uid),
            "email": u["email"],
            "password_hash": u["password_hash"],
            "first_name": u.get("first_name", ""),
            "last_name": u.get("last_name", ""),
            "created_at": safe_iso(u.get("created_at")),
            "updated_at": safe_iso(u.get("updated_at")),
        }
        try:
            sb.table("users").upsert(row, on_conflict="id").execute()
            inserted += 1
        except Exception as e:
            logger.error("Failed to insert user %s: %s", uid, e)

    logger.info("Users migrated: %d / %d", inserted, len(users))
    return inserted


def migrate_documents(sb):
    documents = load_json("documents.json")
    if not documents:
        logger.info("No documents to migrate.")
        return 0

    inserted = 0
    for did, d in documents.items():
        row = {
            "id": d.get("_id", did),
            "user_id": d.get("user_id"),
            "filename": d.get("filename", "unknown"),
            "content": d.get("content"),
            "file_path": d.get("file_path"),
            "file_size": d.get("file_size", 0),
            "text_length": len(d.get("content", "")) if d.get("content") else 0,
            "document_type": d.get("file_type", d.get("document_type", "txt")),
            "status": d.get("status", "uploaded"),
            "upload_time": safe_iso(d.get("upload_time")),
        }
        # Remove None user_id (FK constraint)
        if not row["user_id"]:
            row.pop("user_id")
        try:
            sb.table("documents").upsert(row, on_conflict="id").execute()
            inserted += 1
        except Exception as e:
            logger.error("Failed to insert document %s: %s", did, e)

    logger.info("Documents migrated: %d / %d", inserted, len(documents))
    return inserted


def migrate_analysis(sb):
    analysis = load_json("analysis.json")
    if not analysis:
        logger.info("No analysis results to migrate.")
        return 0

    inserted = 0
    for aid, a in analysis.items():
        row = {
            "id": a.get("_id", aid),
            "document_id": a.get("document_id"),
            "analysis_results": a.get("analysis_results", {}),
            "processing_time": a.get("processing_time", 0),
            "model_versions": a.get("model_versions", {}),
            "status": a.get("status", "completed"),
            "created_at": safe_iso(a.get("created_at")),
        }
        # user_id is optional
        if a.get("user_id"):
            row["user_id"] = a["user_id"]
        try:
            sb.table("analysis_results").upsert(row, on_conflict="id").execute()
            inserted += 1
        except Exception as e:
            logger.error("Failed to insert analysis %s: %s", aid, e)

    logger.info("Analysis results migrated: %d / %d", inserted, len(analysis))
    return inserted


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    logger.info("=" * 60)
    logger.info("Legistra — JSON → Supabase Migration")
    logger.info("=" * 60)

    sb = get_supabase()

    # Order matters: users first (documents reference users), then analysis
    migrate_users(sb)
    migrate_documents(sb)
    migrate_analysis(sb)

    logger.info("=" * 60)
    logger.info("Migration complete!  Verify data in the Supabase dashboard.")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
