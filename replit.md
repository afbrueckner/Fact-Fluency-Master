# Math Fact Fluency - Bay-Williams & Kling Framework

## Overview

This is a research-based math fact fluency practice application for middle school students using the Bay-Williams & Kling framework. The application provides interactive tools for developing math fact fluency through foundational facts, derived strategies, games, and assessment tools. It tracks student progress through three phases: counting, deriving, and mastery, while measuring accuracy, efficiency, flexibility, and strategy use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with reusable UI components organized under `/components/ui/`

### Backend Architecture
- **Runtime**: Node.js with Express.js for REST API endpoints
- **Language**: TypeScript for type safety across the full stack
- **API Design**: RESTful endpoints for student management, progress tracking, games, and assessments
- **Development Setup**: TSX for development server with hot reloading

### Data Storage Solutions
- **Database**: PostgreSQL with Neon Database as the serverless provider
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema Design**: Comprehensive schema covering students, fact categories, progress tracking, games, and assessment observations
- **Session Storage**: Connect-pg-simple for PostgreSQL-backed session storage

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage
- **Student Context**: Application operates with a default student context for demonstration purposes
- **Security**: CORS handling and basic request validation

### External Dependencies
- **Database Service**: Neon Database (@neondatabase/serverless) for PostgreSQL hosting
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with custom design tokens for the Bay-Williams framework
- **Development Tools**: Replit-specific plugins for development environment integration
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Date Utilities**: date-fns for date manipulation and formatting

### Key Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between client and server
- **Component Composition**: Extensive use of composition patterns with Radix UI primitives
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Educational Framework**: Application structure mirrors the Bay-Williams & Kling research framework for math fact fluency
- **Progressive Enhancement**: Responsive design with mobile-first approach