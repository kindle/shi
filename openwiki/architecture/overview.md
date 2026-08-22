---
type: Architecture Overview
title: Architecture Overview
description: High-level architecture of the Ionic Angular poetry application, including routing, shared modules, and component hierarchy
resource: /src/app
tags:
  - architecture
  - ionic
  - angular
  - mobile
  - poetry app
---

# Architecture Overview

The app follows a standard Ionic Angular structure with these key components:

## Core Structure
- `src/app` - Main application root
- `src/app/app.module.ts` - Root NgModule
- `src/app/app-routing.module.ts` - Application routing

## Key Components

### Routing
- Single-page application with tab-based navigation
- `app-routing.module.ts` defines routes for:
  - Home tab (poetry list)
  - Study tab (learning features)
  - Media tab (audio/video)

### Shared Modules
- `shared.module.ts` contains:
  - Utility pipes
  - Custom directives
  - Reusable components
  - Shared services

### Feature Modules
- Each tab has its own module:
  - `home.module.ts`
  - `study.module.ts`
  - `media.module.ts`

### State Management
- Uses Angular's built-in services for:
  - Poetry data caching
  - User preferences
  - Media playback state

## Integration Points
- Capacitor for native features
- Cordova plugins for device capabilities
- External APIs for poetry data