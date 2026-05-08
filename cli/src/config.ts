import type { EventConfig } from './contracts.js';

export const KNOWN_EVENTS: EventConfig[] = [
  {
    id: 'build-2025',
    name: 'Microsoft Build 2025',
    endpoint: 'https://eventtools.event.microsoft.com/build2025-prod/fallback/session-all-en-us.json',
  },
  {
    id: 'ignite-2025',
    name: 'Microsoft Ignite 2025',
    endpoint: 'https://eventtools.event.microsoft.com/ignite2025-prod/fallback/session-all-en-us.json',
  },
  {
    id: 'build-2026',
    name: 'Microsoft Build 2026',
    endpoint: 'https://eventtools.event.microsoft.com/build2026-prod/fallback/session-all-en-us.json',
  },
];

export const DEFAULT_LIMIT = 10;
