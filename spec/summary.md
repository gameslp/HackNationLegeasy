# Legeasy - Project Summary

## Overview

Legeasy is a web application for tracking the Polish legislative process. It enables officials to manage laws through various phases (Preconsultation → RCL → Sejm → Senat → President → Journal of Laws) and allows citizens to browse, compare versions, and discuss proposed legislation.

## Key Features

1. **Law Management**: CRUD operations for laws with metadata (name, author, description, dates)
2. **Phase Timeline**: Visual representation of legislative phases with status indicators
3. **Stage Tracking**: Detailed tracking of stages within each phase, including document versioning
4. **Git-like Diff**: Compare law text between any two stages using unified diff format
5. **File Management**: Upload and download PDF/TXT documents per stage
6. **Discussion System**: Anonymous commenting with nickname-based identification (stored in localStorage)
7. **AI Analysis**: GPT-powered analysis of stages explaining changes, effects, and simplified explanations

## Technical Architecture

- **Monorepo**: pnpm workspaces with 4 packages
- **Backend**: Express.js + Prisma ORM + MySQL
- **Frontend**: Next.js 15 (App Router) + React Query + Tailwind CSS
- **AI Integration**: OpenAI GPT-4o-mini for law analysis
- **File Storage**: Local filesystem with multer

## Data Model

- **Law** → has many **Phases** → has many **Stages**
- **Stage** → has many **StageFiles** and **Discussions**
- Stages contain `lawTextContent` (text) for version comparison

## User Flows

1. **Citizen**: Browse laws → View phase timeline → Read stage details → Compare versions → Add comments
2. **Official**: Admin panel → Create/edit laws → Add phases → Add stages with files → Manage content

## API Design

RESTful API with consistent response format: `{ data: T, error: null }` or `{ data: null, error: { message, code } }`. Full OpenAPI 3.0 specification included.
