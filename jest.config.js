module.exports = {
  errorOnDeprecated: true,
  preset: "ts-jest",
  resetMocks: true,
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
};
