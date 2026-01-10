# ChurchFlow - Ministry Management Platform

## Overview

ChurchFlow is a modern church management application designed to streamline ministry operations. The platform provides scheduling, song library management, team coordination, and availability tracking. Built as a full-stack web application, it serves churches and religious organizations looking to modernize their administrative processes.

The application handles event creation and management, worship song libraries with YouTube integration, team member availability tracking through blockouts, and role-based access control for administrators and regular users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and dark mode support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with proper error handling and validation

### Database Design
- **Users**: Profile management with role-based access (admin/user)
- **Events**: Scheduling system with date/time management
- **Songs**: Library with title, artist, key, and YouTube URL fields
- **Blockouts**: Availability tracking for team members with date ranges
- **Event-Songs**: Many-to-many relationship linking events to assigned songs
- **Sessions**: Built-in session storage table for authentication

### Authentication System
- **Provider**: Replit Auth for seamless integration with Replit platform
- **Session Handling**: Persistent sessions with configurable TTL
- **Access Control**: Role-based permissions with admin-only features
- **Security**: HTTPS-only cookies and proper CSRF protection

### File Structure
- **Monorepo Layout**: Shared schema between frontend and backend
- **Client Directory**: React application with component-based architecture
- **Server Directory**: Express API with modular route handlers
- **Shared Directory**: Common TypeScript types and Zod schemas

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database using Neon serverless for scalability
- **Connection Pooling**: @neondatabase/serverless for optimized connections

### Authentication Services
- **Replit Auth**: Platform-integrated OAuth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### UI/UX Libraries
- **Radix UI**: Accessible component primitives for complex interactions
- **Lucide React**: Consistent icon library for UI elements
- **Tailwind CSS**: Utility-first styling with custom design tokens

### Development Tools
- **TypeScript**: Full-stack type safety with strict configuration
- **Drizzle Kit**: Database migrations and schema management
- **Zod**: Runtime validation and type inference for forms and APIs
- **React Hook Form**: Form state management with validation

### Build and Development
- **Vite**: Fast development server with HMR and optimized builds
- **esbuild**: Server-side bundling for production deployment
- **ESLint/Prettier**: Code quality and formatting standards