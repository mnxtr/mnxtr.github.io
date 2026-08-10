module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'js/menu.js',
    'js/theme.js',
    'js/typewriter.js',
    'js/scroll-reveal.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
