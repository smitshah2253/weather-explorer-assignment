"""
Exceptions specifically for the Google Cloud Storage integration.
These exceptions abstract away Google Cloud SDK errors to maintain clean architecture.
"""

class StorageError(Exception):
    """Base exception for all storage-related errors."""
    pass

class StorageFileNotFound(StorageError):
    """Raised when a requested file does not exist in the bucket."""
    pass

class StorageUploadError(StorageError):
    """Raised when an upload operation fails."""
    pass
