# Development Guide

## Prerequisites
- Node.js >= 20
- npm >= 10
- Google Chrome browser

## Project Structure
- `apps/extension`: The Manifest V3 Chrome Extension powered by WXT and React.
- `apps/demo`: The realistic demo application showcasing both Scenario A (Pension Application Form) and Scenario B (Bank Transaction Statement).
- `packages/shared`: Shared Zod schemas, TypeScript types, and constants.
- `tests/`: Automated unit tests (Vitest) for snapshotting, task modeling, spec generation, and action bridging.

## Commands
```bash
# Run unit tests
npm test

# Run demo website
npm run dev:demo

# Build extension
npm run build:extension
```
