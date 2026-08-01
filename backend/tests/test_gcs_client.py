import pytest
from unittest.mock import Mock, patch
from google.cloud.exceptions import NotFound
import orjson
from datetime import datetime, timezone

from app.storage.gcs_client import GoogleCloudStorageClient
from app.storage.exceptions import StorageError, StorageFileNotFound, StorageUploadError

@pytest.fixture
def mock_storage_client():
    with patch("app.storage.gcs_client.storage.Client") as mock:
        yield mock

@pytest.fixture
def gcs_client(mock_storage_client):
    return GoogleCloudStorageClient()

def test_initialization_error():
    """Verify that initialization errors wrap properly."""
    with patch("app.storage.gcs_client.storage.Client", side_effect=Exception("Auth error")):
        with pytest.raises(StorageError):
            GoogleCloudStorageClient()

def test_upload_json_success(gcs_client):
    """Verify successful upload."""
    mock_blob = Mock()
    gcs_client.bucket.blob.return_value = mock_blob
    
    filename = "test.json"
    data = {"key": "value"}
    
    result = gcs_client.upload_json(filename, data)
    
    gcs_client.bucket.blob.assert_called_once_with(filename)
    mock_blob.upload_from_string.assert_called_once_with(orjson.dumps(data), content_type="application/json")
    assert result == filename

def test_upload_json_failure(gcs_client):
    """Verify upload failure raises correct domain exception."""
    mock_blob = Mock()
    mock_blob.upload_from_string.side_effect = Exception("Upload failed")
    gcs_client.bucket.blob.return_value = mock_blob
    
    with pytest.raises(StorageUploadError):
        gcs_client.upload_json("test.json", {})

def test_download_json_success(gcs_client):
    """Verify successful download."""
    mock_blob = Mock()
    data = {"key": "value"}
    mock_blob.download_as_bytes.return_value = orjson.dumps(data)
    gcs_client.bucket.blob.return_value = mock_blob
    
    result = gcs_client.download_json("test.json")
    assert result == data
    
def test_download_json_not_found(gcs_client):
    """Verify download raises FileNotFound on 404."""
    mock_blob = Mock()
    mock_blob.download_as_bytes.side_effect = NotFound("Missing")
    gcs_client.bucket.blob.return_value = mock_blob
    
    with pytest.raises(StorageFileNotFound):
        gcs_client.download_json("test.json")

def test_list_files(gcs_client):
    """Verify list_files returns correct sorted structure."""
    mock_blob_1 = Mock()
    mock_blob_1.name = "old.json"
    mock_blob_1.size = 100
    mock_blob_1.time_created = datetime(2023, 1, 1, tzinfo=timezone.utc)
    
    mock_blob_2 = Mock()
    mock_blob_2.name = "new.json"
    mock_blob_2.size = 200
    mock_blob_2.time_created = datetime(2023, 1, 2, tzinfo=timezone.utc)
    
    gcs_client.bucket.list_blobs.return_value = [mock_blob_1, mock_blob_2]
    
    result = gcs_client.list_files()
    
    assert len(result) == 2
    assert result[0]["name"] == "new.json"
    assert result[1]["name"] == "old.json"
    
def test_list_files_empty(gcs_client):
    """Verify list_files handles empty buckets."""
    gcs_client.bucket.list_blobs.return_value = []
    assert gcs_client.list_files() == []

def test_blob_exists(gcs_client):
    """Verify exists returns boolean."""
    mock_blob = Mock()
    mock_blob.exists.return_value = True
    gcs_client.bucket.blob.return_value = mock_blob
    
    assert gcs_client.blob_exists("test.json") is True

def test_delete_file_success(gcs_client):
    """Verify delete operation."""
    mock_blob = Mock()
    gcs_client.bucket.blob.return_value = mock_blob
    gcs_client.delete_file("test.json")
    mock_blob.delete.assert_called_once()
