# CV PDF Upload Feature - Implementation Guide

## Overview
Two-phase implementation of CV PDF upload feature with local testing (Phase 1) and Firebase Storage integration (Phase 2).

---

## PHASE 1: Local Upload (Testing) ✅

### Backend
- **Route**: `POST /api/upload`
- **Location**: [backend/src/routes/upload.ts](backend/src/routes/upload.ts)
- **Dependencies**: `multer`, `@types/multer`
- **Storage**: `/tmp/uploads` (local temporary storage)
- **Response**:
  ```json
  {
    "success": true,
    "fileName": "1234567890-resume.pdf",
    "size": 123456
  }
  ```

### Frontend
- **Component**: [frontend/src/components/ResumeUpload.tsx](frontend/src/components/ResumeUpload.tsx)
- **Features**:
  - PDF file input with validation
  - Max file size: 5MB
  - Upload states: idle, uploading, success, error
  - Clean Tailwind UI
  - Error/success messages

### Testing Phase 1
To test local upload:
```bash
# Backend
cd backend
npm run dev

# Frontend (separate terminal)
cd frontend
npm run dev
```

Then import and use the component:
```tsx
import { ResumeUpload } from './components/ResumeUpload';

<ResumeUpload 
  onUploadSuccess={(fileName) => console.log('Uploaded:', fileName)}
/>
```

---

## PHASE 2: Firebase Storage Integration ✅

### Setup

1. **Install dependencies** (already done):
   ```bash
   cd backend
   npm install firebase-admin
   ```

2. **Get Firebase credentials**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key (downloads JSON file)
   - Get your Storage bucket name

3. **Configure environment variables**:
   Create/update `.env` in `backend/`:
   ```env
   # Existing vars...
   GROQ_API_KEY=your_key

   # Firebase configuration
   USE_FIREBASE=true
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   ```

### Backend Implementation

#### 1. Firebase Config
- **File**: [backend/src/config/firebase.ts](backend/src/config/firebase.ts)
- Initializes Firebase Admin SDK
- Uses service account credentials from env
- Singleton pattern to prevent re-initialization

#### 2. Storage Service
- **File**: [backend/src/services/storageService.ts](backend/src/services/storageService.ts)
- `uploadResumeToFirebase()`: Uploads file to Firebase Storage
- `cleanupLocalFile()`: Removes temporary local files
- Files stored at: `resumes/{userId}/{timestamp}.pdf`
- Returns signed URL (1 hour expiration)

#### 3. Updated Upload Route
- **File**: [backend/src/routes/upload.ts](backend/src/routes/upload.ts)
- Checks `USE_FIREBASE` env variable
- If true: uploads to Firebase, cleans local file, returns URL
- If false: uses Phase 1 local storage
- Supports gradual migration

#### 4. Server Initialization
- **File**: [backend/src/server.ts](backend/src/server.ts)
- Initializes Firebase conditionally
- Handles initialization errors gracefully

### Architecture

```
┌─────────────┐
│  Frontend   │
│ ResumeUpload│
└──────┬──────┘
       │ FormData (multipart/form-data)
       ▼
┌──────────────────────────────────────┐
│  Backend: POST /api/upload           │
├──────────────────────────────────────┤
│  1. Multer saves to /tmp/uploads     │
│  2. Validate PDF & size              │
│  3. Check USE_FIREBASE flag          │
│     ├─ true → uploadResumeToFirebase │
│     │         cleanupLocalFile       │
│     │         return { fileUrl }     │
│     └─ false → return { fileName }   │
└──────────────────────────────────────┘
       │
       ▼ (if Firebase enabled)
┌──────────────────────────────────────┐
│  Firebase Storage                    │
│  resumes/{userId}/{timestamp}.pdf    │
│  Returns: signed URL (1h expiry)     │
└──────────────────────────────────────┘
```

### Security Considerations

1. **Credentials**: Never expose Firebase service account to frontend
2. **File Storage**: Files are private by default, access via signed URLs
3. **Validation**: Both MIME type and file extension checked
4. **Size Limit**: 5MB enforced by multer
5. **Temporary Files**: Cleaned up after successful Firebase upload

### Error Handling

- Invalid file types → 400 error, file removed
- Upload failures → 500 error, cleanup attempted
- Firebase unavailable → Falls back to local storage (graceful degradation)

### Usage Example

Frontend integration:
```tsx
import { ResumeUpload } from './components/ResumeUpload';

function MyApp() {
  const handleUploadSuccess = (fileName: string, fileUrl?: string) => {
    if (fileUrl) {
      console.log('Firebase URL:', fileUrl);
      // Use signed URL for processing
    } else {
      console.log('Local file:', fileName);
      // Phase 1: local testing
    }
  };

  return <ResumeUpload onUploadSuccess={handleUploadSuccess} />;
}
```

Backend response with Firebase:
```json
{
  "success": true,
  "fileUrl": "https://storage.googleapis.com/..."
}
```

### Future Enhancements

- [ ] User authentication integration for proper userId
- [ ] Longer-lived signed URLs or public access control
- [ ] PDF text extraction for analysis
- [ ] Extended file type support (DOC, DOCX)
- [ ] Upload progress tracking
- [ ] Multiple file uploads
- [ ] Resume parsing and structuring

---

## Testing

### Phase 1 Testing (Local)
1. Start backend: `npm run dev`
2. Upload a PDF file
3. Check `backend/tmp/uploads/` for saved file
4. Verify response contains `fileName` and `size`

### Phase 2 Testing (Firebase)
1. Set `USE_FIREBASE=true` in `.env`
2. Add Firebase credentials
3. Start backend
4. Upload a PDF file
5. Verify response contains `fileUrl`
6. Check Firebase Console → Storage for uploaded file
7. Verify local temp file is removed

---

## Troubleshooting

**Firebase initialization fails:**
- Check service account JSON is valid
- Verify storage bucket name is correct
- Ensure Firebase project has Storage enabled

**Upload fails with 413:**
- Check Express body parser limit (already set to 10mb)
- Multer limits file to 5MB

**File not cleaned up:**
- Check file system permissions
- Non-critical error, logged but not thrown

**CORS errors:**
- Backend CORS is already configured
- Check frontend API URL matches backend port
