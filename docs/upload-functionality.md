# Upload Functionality Documentation

## Overview
This document describes the implementation of the file upload functionality for the LSPU Knowledge Management Information System. The upload system allows authorized users (admins and faculty) to upload various document types to the centralized repository.

## Features

### 1. File Upload
- Supports multiple file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, JPEG, PNG
- Maximum file size: 50MB
- Secure file storage with unique naming to prevent conflicts
- File integrity verification using SHA-256 hash

### 2. Security Features
- Role-based access control (only admins and faculty can upload)
- File type validation to prevent malicious uploads
- Size validation to prevent excessive storage usage
- Malicious content scanning to detect potential threats
- Secure authentication using JWT tokens

### 3. User Experience
- Progress indicators during upload
- Real-time feedback and error messages
- Form validation for required fields
- Responsive UI components

### 4. Metadata Extraction
- Original file name
- File size
- File type and extension
- Upload timestamp
- Last modified date
- File integrity hash

## Implementation Details

### Frontend Components
- Repository page (`app/repository/page.tsx`)
- Upload modal with form fields
- Progress bar for upload status
- Error handling and validation

### Backend Services
- File storage service (`lib/services/file-storage-service.ts`)
- Document service (`lib/services/document-service.ts`)
- API route (`app/api/documents/route.ts`)
- Authentication middleware (`lib/middleware/auth-middleware.ts`)

### File Storage
- Files are stored in Supabase Storage bucket
- Each file is given a unique UUID-based name
- SHA-256 hash is generated for integrity verification
- Basic malicious content scanning is performed

## Security Measures

### Client-Side Validation
- File type restrictions
- File size limits
- Required field validation

### Server-Side Validation
- JWT authentication verification
- Role-based permission checks
- File type and size validation
- Malicious content scanning
- Database access control

### File Scanning
The system performs basic scanning for malicious content including:
- JavaScript injection patterns
- HTML injection tags (iframe, object, embed)
- Event handlers (onload, onerror, etc.)
- Malicious URLs

## API Endpoints

### POST /api/documents
- Creates a new document in the repository
- Requires authentication and admin/faculty role
- Accepts multipart form data with file and metadata
- Returns the created document object

### GET /api/documents
- Retrieves documents with optional filtering
- Supports pagination, search, and category filtering
- Respects user permissions and access controls

## Error Handling

### Common Error Responses
- 400: Bad Request (missing fields, invalid file type, etc.)
- 401: Unauthorized (invalid or missing JWT token)
- 403: Forbidden (insufficient permissions)
- 500: Internal Server Error

### Error Messages
- "Missing required fields"
- "File type not allowed"
- "File size exceeds maximum allowed size"
- "File contains potentially malicious content"
- "Only admins and faculty can upload documents"

## File Type Support

### Supported Extensions
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Microsoft PowerPoint (.ppt, .pptx)
- Microsoft Excel (.xls, .xlsx)
- Text files (.txt)
- Images (.jpg, .jpeg, .png)

### Size Limitations
- Maximum file size: 50MB (52,428,800 bytes)
- This can be configured in the file storage service

## Database Schema

### Document Model
The document model includes fields for:
- ID, title, description
- Category and tags
- File URL and metadata
- Upload information (user, time, version)
- Status and permissions

## Integration Points

### Authentication
- Uses JWT-based authentication
- Integrated with NextAuth or custom auth system
- Role-based access control

### UI Integration
- Repository page displays upload button for authorized users
- Modal form for document metadata
- Progress indicators during upload
- Success/error feedback

## Future Enhancements

### Planned Features
- Cloud storage integration (AWS S3, etc.)
- Advanced file scanning (virus detection)
- File preview capabilities
- Bulk upload functionality
- Enhanced metadata extraction
- Automated tagging and categorization

## Troubleshooting

### Common Issues
1. **Upload fails**: Check file size and type restrictions
2. **Authentication error**: Verify JWT token is valid and not expired
3. **Permission denied**: Ensure user has admin or faculty role
4. **File not found after upload**: Check file storage directory permissions

### Logging
- Server-side errors are logged to console
- Authentication failures are logged for security monitoring
- File upload statistics can be tracked in the database

## Compliance

### Data Privacy
- Compliant with RA 10173 Data Privacy Act
- Secure file handling and storage
- Access control based on user roles
- Audit trails for document access

### Security
- Secure file upload with validation
- Protection against malicious content
- Role-based access control
- Encrypted authentication tokens