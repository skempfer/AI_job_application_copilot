# Quick Start Guide

## Initial Setup (First Time)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GROQ_API_KEY (free at https://console.groq.com)
npm run dev
```

### 2. Frontend (in another terminal)

```bash
cd frontend
npm install
npm run dev
```

### 3. Open in Browser

Frontend: http://localhost:5173  
Backend health: http://localhost:3001/health

---

## Useful Commands

### Backend

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Start production build
npm start

# Type checking
npm run type-check
```

### Frontend

```bash
# Development
npm run dev

# Production build
npm run build

# Preview of build
npm run preview

# Linting
npm run lint
```

---

## Manual API Testing

### cURL

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "cv": "Senior React Developer with 5 years of experience...",
    "jobDescription": "We are looking for a Senior React developer..."
  }'
```

### Postman

1. Method: POST
2. URL: `http://localhost:3001/api/analyze`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "cv": "Your CV here...",
  "jobDescription": "Job description here..."
}
```

---

## Environment Variables

### Backend (.env)

```bash
# Groq API (free)
GROQ_API_KEY=gsk_your-key-here
GROQ_API_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

# Server configuration
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```bash
# Backend URL
VITE_API_URL=http://localhost:3001
```

---

## Project Structure

```
AI_job_application_copilot/
│
├── backend/                   # Node.js API
│   ├── src/
│   │   ├── server.ts         # Express setup
│   │   ├── routes/
│   │   │   └── analyze.ts    # POST /api/analyze
│   │   ├── services/
│   │   │   └── aiService.ts  # Groq integration (OpenAI-compatible)
│   │   └── types/
│   │       └── analysis.ts   # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── domain/           # Business logic (pure JS)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docs/                      # Documentation
├── README.md                  # Project overview
├── CHANGELOG.md               # Version history
└── CONTRIBUTING.md            # Contribution guidelines
```

---

## Quick Troubleshooting

### Backend won't start

```bash
# Check if port 3001 is in use
# Windows:
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID> /F

# Or change port in .env
PORT=3002
```

### Frontend can't connect to backend

1. Verify backend is running: http://localhost:3001/health
2. Check CORS in backend (already configured)
3. Verify `VITE_API_URL` in frontend/.env
4. Check browser console (F12) for network errors

### AI returns error

1. Verify `GROQ_API_KEY` in backend/.env
2. Generate new key at https://console.groq.com/keys
3. Check terminal logs from backend

### Build fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify Node version
node --version  # Should be >= 18
```

---

## Next Steps

1. ✅ Complete setup
2. ✅ Test locally
3. 📖 Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand system design
4. 🧪 Test with your own CVs and job descriptions
5. 🚀 Deploy (see [DEV-GUIDE.md](./DEV-GUIDE.md))
6. 🎨 Customize prompt in `backend/src/services/aiService.ts`
7. ✨ Add features (see suggestions in [DECISIONS.md](./DECISIONS.md))

---

## Useful Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Express.js](https://expressjs.com/)
- [Vite](https://vitejs.dev/)
