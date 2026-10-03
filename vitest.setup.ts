import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Testing Library only unmounts between tests on its own when the runner
// exposes test globals; this config keeps them off.
afterEach(() => cleanup())

// jsdom does not implement scrolling.
Object.defineProperty(window, 'scrollTo', { configurable: true, value: vi.fn() })
