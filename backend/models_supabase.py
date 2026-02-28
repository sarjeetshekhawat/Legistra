"""
Supabase-backed data layer for Legistra.
Drop-in replacement for models.py (MongoDB) and models_simple.py (JSON fallback).
Exposes SupabaseDB and DBManager with the same public API.
"""

import os
import uuid
import logging
from datetime import datetime, timezone

from werkzeug.security import generate_password_hash
from supabase_client import get_supabase

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# SupabaseDB — replaces the old MongoDB / SimpleDB classes
# ---------------------------------------------------------------------------
class SupabaseDB:
    """Thin wrapper around the Supabase client with the same method signatures
    as the old MongoDB class so the rest of the codebase works unchanged."""

    def __init__(self):
        self._sb = None  # lazy init

    @property
    def sb(self):
        if self._sb is None:
            self._sb = get_supabase()
        return self._sb

    # ----- helpers (kept for backward compat) -----
    def get_users_collection(self):
        return self

    def get_documents_collection(self):
        return self

    def get_analysis_results_collection(self):
        return self

    def get_user_sessions_collection(self):
        return self

    # ------------------------------------------------------------------ users
    def insert_user(self, email, password, first_name=None, last_name=None):
        """Create a new user. Returns user id or None if duplicate."""
        try:
            user_id = str(uuid.uuid4())
            row = {
                "id": user_id,
                "email": email,
                "password_hash": generate_password_hash(password),
                "first_name": first_name or "",
                "last_name": last_name or "",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            self.sb.table("users").insert(row).execute()
            logger.info("Inserted user %s (%s)", user_id, email)
            return user_id
        except Exception as e:
            # Unique violation → user already exists
            if "duplicate" in str(e).lower() or "23505" in str(e):
                logger.warning("User already exists: %s", email)
                return None
            logger.error("insert_user failed: %s", e)
            raise

    def get_user_by_email(self, email):
        try:
            resp = (
                self.sb.table("users")
                .select("*")
                .eq("email", email)
                .maybe_single()
                .execute()
            )
            row = resp.data
            if row:
                row["_id"] = row["id"]  # backward compat
            return row
        except Exception as e:
            logger.error("get_user_by_email failed: %s", e)
            return None

    def get_user_by_id(self, user_id):
        try:
            resp = (
                self.sb.table("users")
                .select("*")
                .eq("id", user_id)
                .maybe_single()
                .execute()
            )
            row = resp.data
            if row:
                row["_id"] = row["id"]
            return row
        except Exception as e:
            logger.error("get_user_by_id failed: %s", e)
            return None

    # -------------------------------------------------------------- documents
    def insert_document(self, filename, text, file_path=None):
        """Insert a document record. Returns the new document id."""
        try:
            doc_id = str(uuid.uuid4())
            ext = filename.rsplit(".", 1)[1].lower() if "." in filename else "txt"
            file_size = (
                os.path.getsize(file_path)
                if file_path and os.path.exists(file_path)
                else len(text)
            )
            row = {
                "id": doc_id,
                "filename": filename,
                "content": text,
                "file_path": file_path,
                "file_size": file_size,
                "text_length": len(text),
                "document_type": ext,
                "status": "uploaded",
                "upload_time": datetime.now(timezone.utc).isoformat(),
            }
            self.sb.table("documents").insert(row).execute()
            logger.info("Inserted document %s (%s)", doc_id, filename)
            return doc_id
        except Exception as e:
            logger.error("insert_document failed: %s", e)
            raise

    def get_document(self, doc_id):
        try:
            resp = (
                self.sb.table("documents")
                .select("*")
                .eq("id", doc_id)
                .maybe_single()
                .execute()
            )
            row = resp.data
            if row:
                row["_id"] = row["id"]
            return row
        except Exception as e:
            logger.error("get_document failed: %s", e)
            return None

    def update_document_status(self, doc_id, status):
        try:
            self.sb.table("documents").update({"status": status}).eq("id", doc_id).execute()
            logger.info("Document %s status → %s", doc_id, status)
            return True
        except Exception as e:
            logger.error("update_document_status failed: %s", e)
            return False

    def update_document_with_user(self, document_id, user_id):
        """Associate a document with a user."""
        try:
            logger.info("Associating document %s with user %s", document_id, user_id)
            resp = self.sb.table("documents").update({"user_id": user_id}).eq("id", document_id).execute()
            logger.info("update_document_with_user succeeded: %s", resp.data)
        except Exception as e:
            logger.error("update_document_with_user FAILED for doc=%s user=%s: %s", document_id, user_id, e, exc_info=True)

    def update_document_storage_path(self, document_id, storage_path):
        """Set the Supabase Storage path for an uploaded file."""
        try:
            self.sb.table("documents").update({"storage_path": storage_path}).eq("id", document_id).execute()
        except Exception as e:
            logger.error("update_document_storage_path failed: %s", e)

    def get_user_documents(self, user_id):
        """Return all documents belonging to a user."""
        try:
            resp = (
                self.sb.table("documents")
                .select("*")
                .eq("user_id", user_id)
                .order("upload_time", desc=True)
                .execute()
            )
            rows = resp.data or []
            for r in rows:
                r["_id"] = r["id"]
            return rows
        except Exception as e:
            logger.error("get_user_documents failed: %s", e)
            return []

    def find_documents(self, query=None, limit=None):
        """Simple text search on content (ilike)."""
        try:
            q = self.sb.table("documents").select("*")
            if query and "content" in query:
                search_term = query["content"].get("$regex", "")
                if search_term:
                    q = q.ilike("content", f"%{search_term}%")
            if limit:
                q = q.limit(limit)
            resp = q.execute()
            rows = resp.data or []
            for r in rows:
                r["_id"] = r["id"]
            return rows
        except Exception as e:
            logger.error("find_documents failed: %s", e)
            return []

    def count_documents(self, query=None):
        """Count documents, optionally filtered by user_id."""
        try:
            q = self.sb.table("documents").select("id", count="exact")
            if query and "user_id" in query:
                q = q.eq("user_id", query["user_id"])
            resp = q.execute()
            return resp.count if resp.count is not None else 0
        except Exception as e:
            logger.error("count_documents failed: %s", e)
            return 0

    # -------------------------------------------------------- analysis results
    def insert_analysis_result(self, document_id, analysis_results, processing_time, model_versions):
        """Insert an analysis result. Returns the new analysis id."""
        try:
            analysis_id = str(uuid.uuid4())
            row = {
                "id": analysis_id,
                "document_id": document_id,
                "analysis_results": analysis_results,  # JSONB
                "processing_time": processing_time,
                "model_versions": model_versions,       # JSONB
                "status": "completed",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            self.sb.table("analysis_results").insert(row).execute()
            logger.info("Inserted analysis %s for document %s", analysis_id, document_id)
            return analysis_id
        except Exception as e:
            logger.error("insert_analysis_result failed: %s", e)
            raise

    def get_analysis_result(self, document_id):
        """Get the (first) analysis result for a given document."""
        try:
            resp = (
                self.sb.table("analysis_results")
                .select("*")
                .eq("document_id", document_id)
                .order("created_at", desc=True)
                .limit(1)
                .maybe_single()
                .execute()
            )
            row = resp.data
            if row:
                row["_id"] = row["id"]
            return row
        except Exception as e:
            logger.error("get_analysis_result failed: %s", e)
            return None

    def update_analysis_result_with_user(self, analysis_id, user_id):
        """Associate an analysis result with a user."""
        try:
            self.sb.table("analysis_results").update({"user_id": user_id}).eq("id", analysis_id).execute()
        except Exception as e:
            logger.error("update_analysis_result_with_user failed: %s", e)

    def get_user_analysis_results(self, user_id):
        """Return all analysis results for documents belonging to a user."""
        try:
            # Get user's document IDs first
            doc_resp = (
                self.sb.table("documents")
                .select("id")
                .eq("user_id", user_id)
                .execute()
            )
            doc_ids = [d["id"] for d in (doc_resp.data or [])]
            if not doc_ids:
                return []
            resp = (
                self.sb.table("analysis_results")
                .select("*")
                .in_("document_id", doc_ids)
                .execute()
            )
            rows = resp.data or []
            for r in rows:
                r["_id"] = r["id"]
            return rows
        except Exception as e:
            logger.error("get_user_analysis_results failed: %s", e)
            return []

    # find_one compat used by compatibility_endpoints export
    def find_one(self, query):
        """Generic find_one on whichever table matches the query keys."""
        if "document_id" in query:
            return self.get_analysis_result(query["document_id"])
        return None

    # --------------------------------------------------------- user sessions
    def insert_user_session(self, session_token):
        try:
            session_id = str(uuid.uuid4())
            row = {
                "id": session_id,
                "session_token": session_token,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_activity": datetime.now(timezone.utc).isoformat(),
            }
            self.sb.table("user_sessions").insert(row).execute()
            return session_id
        except Exception as e:
            logger.error("insert_user_session failed: %s", e)
            raise

    def get_user_session(self, session_token):
        try:
            resp = (
                self.sb.table("user_sessions")
                .select("*")
                .eq("session_token", session_token)
                .maybe_single()
                .execute()
            )
            return resp.data
        except Exception as e:
            logger.error("get_user_session failed: %s", e)
            return None

    def update_user_session_activity(self, session_token):
        try:
            self.sb.table("user_sessions").update(
                {"last_activity": datetime.now(timezone.utc).isoformat()}
            ).eq("session_token", session_token).execute()
        except Exception as e:
            logger.error("update_user_session_activity failed: %s", e)

    # ---- aggregate compat (used by dashboard_stats in old code) ----
    def aggregate(self, pipeline):
        """Simplified aggregation compat — returns empty list."""
        logger.warning("aggregate() called — this is a no-op stub; use direct queries instead.")
        return []

    # ----- read helpers (replace simple_db._read_*) -----
    def read_all_documents(self):
        """Return ALL documents as a {id: row} dict (mirrors simple_db._read_documents)."""
        try:
            resp = self.sb.table("documents").select("*").execute()
            rows = resp.data or []
            result = {}
            for r in rows:
                r["_id"] = r["id"]
                result[r["id"]] = r
            return result
        except Exception as e:
            logger.error("read_all_documents failed: %s", e)
            return {}

    def read_all_analysis(self):
        """Return ALL analysis results as a {id: row} dict (mirrors simple_db._read_analysis)."""
        try:
            resp = self.sb.table("analysis_results").select("*").execute()
            rows = resp.data or []
            result = {}
            for r in rows:
                r["_id"] = r["id"]
                result[r["id"]] = r
            return result
        except Exception as e:
            logger.error("read_all_analysis failed: %s", e)
            return {}


# ---------------------------------------------------------------------------
# DBManager — same interface as before
# ---------------------------------------------------------------------------
class DBManager:
    """Thin facade kept for backward compatibility with app.py / tasks.py."""

    def __init__(self, db: SupabaseDB):
        self.db = db

    def store_document_metadata_and_content(self, filename, text, file_path=None):
        return self.db.insert_document(filename, text, file_path)

    def get_document(self, document_id):
        return self.db.get_document(document_id)

    def update_document_status(self, document_id, status):
        return self.db.update_document_status(document_id, status)

    def store_analysis_result(self, document_id, analysis_results, processing_time, model_versions):
        return self.db.insert_analysis_result(document_id, analysis_results, processing_time, model_versions)

    def get_analysis_result(self, document_id):
        return self.db.get_analysis_result(document_id)
