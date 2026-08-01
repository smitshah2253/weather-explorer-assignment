"""
Google Cloud Storage client module.
"""
from typing import Any
import orjson
from loguru import logger
from google.cloud import storage
from google.cloud.exceptions import NotFound, GoogleCloudError
from pathlib import Path

from app.core.config import settings
from app.storage.exceptions import StorageError, StorageFileNotFound, StorageUploadError

class GoogleCloudStorageClient:
    """
    Client for interacting with Google Cloud Storage.
    Provides methods to upload, download, list, and delete JSON files.
    Reuses a single google.cloud.storage.Client instance.
    """

    def __init__(self):
        try:
            project = settings.GCP_PROJECT_ID
            if project:
                self.client = storage.Client(project=project)
            else:
                self.client = storage.Client()
                
            bucket_name = settings.GCS_BUCKET_NAME
            self.bucket = self.client.bucket(bucket_name)
        except Exception as e:
            logger.error(f"Failed to initialize GCS client: {e}")
            raise StorageError(f"Failed to initialize GCS client: {e}") from e

    def upload_json(self, filename: str, data: dict) -> str:
        """
        Serializes dictionary to JSON and uploads it to GCS.
        Overwrites if the file already exists.
        
        Args:
            filename: Target file name/path in bucket.
            data: Dictionary to upload.
            
        Returns:
            The uploaded filename.
            
        Raises:
            StorageUploadError: If upload fails.
        """
        logger.info(f"upload started: {filename}")
        try:
            json_bytes = orjson.dumps(data)
            blob = self.bucket.blob(filename)
            blob.upload_from_string(json_bytes, content_type="application/json")
            logger.info(f"upload successful: {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"errors during upload of {filename}: {e}")
            raise StorageUploadError(f"Failed to upload {filename} to GCS.") from e

    def download_json(self, filename: str) -> dict:
        """
        Downloads a JSON file from GCS and deserializes it.
        
        Args:
            filename: File name/path in bucket.
            
        Returns:
            Deserialized dictionary.
            
        Raises:
            StorageFileNotFound: If the file does not exist.
            StorageError: If download fails for other reasons.
        """
        logger.info(f"download started: {filename}")
        try:
            blob = self.bucket.blob(filename)
            content = blob.download_as_bytes()
            data = orjson.loads(content)
            logger.info(f"download successful: {filename}")
            return data
            
        except NotFound as e:
            logger.warning(f"errors: file not found {filename}")
            raise StorageFileNotFound(f"File {filename} not found in bucket.") from e
        except Exception as e:
            logger.error(f"errors during download of {filename}: {e}")
            raise StorageError(f"Failed to download {filename} from GCS.") from e

    def list_files(self) -> list[dict[str, Any]]:
        """
        Lists files in the bucket.
        Returns empty list if no objects found.
        
        Returns:
            List of dictionaries containing name, size, and created_at.
            Ordered newest first.
        """
        logger.info("list operation started")
        try:
            blobs = list(self.bucket.list_blobs())
            
            files = []
            for blob in blobs:
                files.append({
                    "name": blob.name,
                    "size": blob.size,
                    "created_at": blob.time_created
                })
                
            files.sort(key=lambda x: x["created_at"] or getattr(x["created_at"], "min"), reverse=True)
            return files
            
        except Exception as e:
            logger.error(f"errors during list operation: {e}")
            raise StorageError("Failed to list files from GCS.") from e

    def blob_exists(self, filename: str) -> bool:
        """
        Checks if a blob exists in the bucket.
        
        Args:
            filename: File name/path in bucket.
            
        Returns:
            True if it exists, False otherwise.
        """
        try:
            blob = self.bucket.blob(filename)
            return blob.exists()
        except Exception as e:
            logger.error(f"errors checking existence of {filename}: {e}")
            raise StorageError(f"Failed to check existence of {filename}.") from e

    def delete_file(self, filename: str) -> None:
        """
        Deletes a file from the bucket.
        
        Args:
            filename: File name/path in bucket to delete.
            
        Raises:
            StorageFileNotFound: If file does not exist.
            StorageError: If deletion fails.
        """
        try:
            blob = self.bucket.blob(filename)
            blob.delete()
            logger.info(f"delete successful: {filename}")
        except NotFound as e:
            logger.warning(f"errors: cannot delete missing file {filename}")
            raise StorageFileNotFound(f"File {filename} not found.") from e
        except Exception as e:
            logger.error(f"errors deleting {filename}: {e}")
            raise StorageError(f"Failed to delete {filename}.") from e
