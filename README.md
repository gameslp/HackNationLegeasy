# Legeasy

System do śledzenia procesu legislacyjnego w Polsce.

## Struktura projektu

```
legeasy/
├── packages/
│   ├── database/     # Prisma schema + client
│   ├── validation/   # Zod schemas dla HTTP
│   ├── backend/      # Express API
│   └── frontend/     # Next.js app
├── spec/             # Specyfikacje (domain, ui, openapi)
├── docker/           # MySQL init scripts
└── uploads/          # Pliki uploadowane (git ignored)
```

## Wymagania

- Node.js 18+
- pnpm 8+
- Docker (dla MySQL)

## Quick Start

```bash
# 1. Instalacja zależności
pnpm install

# 2. Uruchom MySQL
docker-compose up -d

# 3. Setup bazy danych
cd packages/database
pnpm generate
pnpm migrate
pnpm seed

# 4. Uruchom backend (terminal 1)
cd packages/backend
cp .env.example .env
# Edytuj .env i dodaj OPENAI_API_KEY
pnpm dev

# 5. Uruchom frontend (terminal 2)
cd packages/frontend
pnpm dev
```

## URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Panel Admin**: http://localhost:3001/admin

## Funkcje

### Dla obywateli
- Przeglądanie ustaw i ich etapów
- Timeline procesu legislacyjnego
- Porównywanie wersji ustawy (diff)
- Komentowanie pod etapami
- Analiza AI zmian w ustawie

### Dla urzędników (Panel Admin)
- Tworzenie i edycja ustaw
- Zarządzanie fazami i etapami
- Upload plików (PDF, TXT)
- Dodawanie linków do stron rządowych

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Backend**: Express + Prisma + MySQL
- **Frontend**: Next.js 15 + React Query + Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Validation**: Zod

## Komendy

```bash
# Root
pnpm install          # Instaluj wszystkie zależności
pnpm dev:backend      # Uruchom backend
pnpm dev:frontend     # Uruchom frontend
pnpm db:generate      # Generuj Prisma Client
pnpm db:migrate       # Uruchom migracje
pnpm db:seed          # Seeduj bazę danych
pnpm db:studio        # Otwórz Prisma Studio
```

## Licencja

MIT
