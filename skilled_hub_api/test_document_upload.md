# Document Upload Testing Guide

## Prerequisites
1. Make sure your Rails server is running: `bundle exec rails server`
2. Ensure you have a valid JWT token from logging in
3. Have a test file ready for upload

## Getting a JWT Token
First, login to get a JWT token:
```bash
curl -X POST http://localhost:3000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com","password":"your_password"}'
```

## Document Upload Commands

### 1. Upload a PDF file
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@/path/to/your/file.pdf" \
  -F "uploadable_id=1" \
  -F "uploadable_type=Job"
```

### 2. Upload an image file
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@/path/to/your/image.jpg" \
  -F "uploadable_id=1" \
  -F "uploadable_type=TechnicianProfile"
```

### 3. Upload a document for a user
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@/path/to/your/document.docx" \
  -F "uploadable_id=1" \
  -F "uploadable_type=User"
```

## Windows/WSL Specific Commands

### If you're using WSL and want to upload from Windows:
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@/mnt/c/Users/your_username/Desktop/test.pdf" \
  -F "uploadable_id=1" \
  -F "uploadable_type=Job"
```

### If you're using Git Bash on Windows:
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@C:/Users/your_username/Desktop/test.pdf" \
  -F "uploadable_id=1" \
  -F "uploadable_type=Job"
```

## Testing with a Sample File

### Create a test file:
```bash
echo "This is a test document" > test.txt
```

### Upload the test file:
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@test.txt" \
  -F "uploadable_id=1" \
  -F "uploadable_type=Job"
```

## Expected Response
```json
{
  "id": 1,
  "uploadable_id": 1,
  "uploadable_type": "Job",
  "file_url": "http://localhost:3000/rails/active_storage/blobs/...",
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

## Common Issues and Solutions

### 1. "Failed to open/read local data from file"
- **Cause**: Incorrect file path
- **Solution**: Use absolute paths or ensure the file exists in the current directory

### 2. "File is required" error
- **Cause**: The file parameter is missing or empty
- **Solution**: Check that the file path is correct and the file exists

### 3. "Unauthorized" error
- **Cause**: Invalid or missing JWT token
- **Solution**: Get a fresh JWT token by logging in again

### 4. "Unprocessable Entity" error
- **Cause**: Validation errors (missing uploadable_id or uploadable_type)
- **Solution**: Ensure both uploadable_id and uploadable_type are provided

## Testing the Uploaded Document

After uploading, you can retrieve the document:
```bash
curl -X GET http://localhost:3000/api/v1/documents/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

This will return the document with the file_url that you can use to download the file. 