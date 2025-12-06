# Legeasy - Development Plan

## Phase 1: Setup & Infrastructure

### Backend Setup
- [ ] Start MySQL with Docker Compose
- [ ] Run Prisma migrations
- [ ] Seed database with sample data
- [ ] Configure OpenAI API key in `.env`
- [ ] Start backend server

### Frontend Setup
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Generate API client (optional, hey-api)
- [ ] Start frontend dev server

## Phase 2: Core Features

### Backend Implementation
- [x] Laws CRUD endpoints
- [x] Phases CRUD endpoints (nested under laws)
- [x] Stages CRUD endpoints (nested under phases)
- [x] File upload/download endpoints
- [x] Discussion endpoints
- [x] Diff computation service
- [x] AI analysis integration

### Frontend Implementation
- [x] Laws list page with search/filter
- [x] Law detail page with phase timeline
- [x] Phase page with stages list
- [x] Stage detail page with files and discussions
- [x] Diff comparison page
- [x] AI analysis modal/section

## Phase 3: Admin Panel

- [x] Admin dashboard with statistics
- [x] Law creation/editing form
- [x] Phase management (add/edit/delete)
- [x] Stage management with file upload
- [x] Government links management

## Phase 4: Polish & Demo

### Improvements
- [ ] Loading states and error handling
- [ ] Form validation feedback
- [ ] Responsive design testing
- [ ] Performance optimization

### Demo Preparation
- [ ] Prepare sample laws with multiple phases/stages
- [ ] Test diff functionality with real law text
- [ ] Verify AI analysis with OpenAI key
- [ ] Prepare demo script

---

## Quick Start Commands

```bash
# 1. Install dependencies (from root)
pnpm install

# 2. Start MySQL
docker-compose up -d

# 3. Setup database
cd packages/database
cp .env.example .env  # if needed
pnpm generate
pnpm migrate
pnpm seed

# 4. Start backend (terminal 1)
cd packages/backend
cp .env.example .env
# Edit .env to add OPENAI_API_KEY
pnpm dev

# 5. Start frontend (terminal 2)
cd packages/frontend
pnpm dev
```

## URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Admin Panel**: http://localhost:3001/admin
- **Prisma Studio**: `pnpm db:studio` (from root)

## Team Responsibilities

### Backend Developer
- API endpoints implementation
- Database schema optimization
- File storage handling
- AI service integration

### Frontend Developer
- React components and pages
- State management with React Query
- UI/UX with Tailwind CSS
- Form handling and validation

### Data/ML Developer
- AI prompt engineering for law analysis
- PDF text extraction (optional enhancement)
- Search/filtering optimization
