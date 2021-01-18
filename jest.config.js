module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 100,
      lines: 50,
    },
  },
  errorOnDeprecated: true,
  preset: "ts-jest",
  resetMocks: true,
  testEnvironment: "node",
  testRegex: "/test/.*\\.test\\.[jt]s",
};
