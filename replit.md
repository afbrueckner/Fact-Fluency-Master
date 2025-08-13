# Math Fact Fluency - Bay-Williams & Kling Framework

## Overview

This is a research-based math fact fluency practice application for middle school students using the Bay-Williams & Kling framework. The application provides interactive tools for developing math fact fluency through foundational facts, derived strategies, games, and comprehensive assessment tools. It features a complete self-assessment system with eight different assessment types covering all major fact categories, tracks student progress through three phases: counting, deriving, and mastery, while measuring accuracy, efficiency, flexibility, and strategy use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with reusable UI components organized under `/components/ui/`

### Backend Architecture (Updated August 2025)
- **Development**: Node.js with Express.js for development environment only
- **Production**: Static hosting - no backend required for production deployment
- **API Simulation**: Mock API layer using localStorage for all data operations
- **Development Setup**: TSX for development server with hot reloading
- **Build Process**: `build-static.js` creates deployable static files for free hosting platforms

### Data Storage Solutions (Updated August 2025)
- **Client-Side Storage**: localStorage for browser-based data persistence without hosting costs
- **Mock API Layer**: `mockApi.ts` simulates server endpoints using localStorage for data operations
- **Static Hosting Compatible**: No database required - works on GitHub Pages, Netlify, Vercel
- **Schema Design**: Maintained comprehensive TypeScript schema for type safety across localStorage operations
- **Data Persistence**: All progress tracking, avatar customization, and reward data stored locally in user's browser

### Authentication and Authorization (Updated August 2025)
- **No Authentication Required**: Simplified for educational demonstration purposes
- **Student Context**: Application operates with a default student context stored in localStorage
- **Data Privacy**: All data remains local to user's browser with no server transmission

### External Dependencies (Updated August 2025)
- **No External Services**: Eliminated database dependency for zero hosting costs
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with custom design tokens for the Bay-Williams framework
- **Development Tools**: Replit-specific plugins for development environment integration
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Date Utilities**: date-fns for date manipulation and formatting
- **Static Hosting Ready**: Compatible with GitHub Pages, Netlify, Vercel for free deployment

### Key Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between client and server
- **Component Composition**: Extensive use of composition patterns with Radix UI primitives
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Educational Framework**: Application structure mirrors the Bay-Williams & Kling research framework for math fact fluency
- **Progressive Enhancement**: Responsive design with mobile-first approach
- **Comprehensive Self-Assessment**: Eight distinct assessment types covering all major fact categories with drag-and-drop sorting interface

### Recent Major Enhancements (August 2025)
- **Expanded Self-Assessment System**: Added comprehensive suite of eight assessment types:
  - Addition & Subtraction Facts: Foundational Addition, Foundational Subtraction, Derived Addition, Derived Subtraction
  - Multiplication & Division Facts: Foundational Multiplication (2s, 5s, 10s, squares), Derived Multiplication (doubling, near squares, break apart), Derived Division
  - Special Categories: Combinations & Sums assessment
- **Research-Based Sorting Categories**: Each assessment uses authentic sorting strategies from pages 25, 29-30, 35-36, 40, and 44 of the Bay-Williams framework
- **Enhanced UI Design**: Horizontal drop zone layout for better visibility, expression-only math fact cards, organized assessment selection with clear groupings
- **Authentic Fact Generation**: Generated fact sets match specific examples and problem groupings from the PDF materials