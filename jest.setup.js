import '@testing-library/jest-dom'

// Mock clipboard API globally
Object.defineProperty(window, 'navigator', {
  value: {
    clipboard: {
      writeText: jest.fn(),
    },
  },
  writable: true,
})