module.exports = {
  // This shaves a few bytes off the built files while still keeping them readable.
  // When testing on 4f550aab7ccf00a6dfe686d57195268b3ef06b1a, it reduces the tarball size by about 100 bytes.
  // This should help installation performance slightly.
  printWidth: 2000,
  trailingComma: "none",
  useTabs: true,
  arrowParens: "avoid",
  semi: false,
};
