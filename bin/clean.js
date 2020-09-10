#!/usr/bin/env node
// This lets us remove files on all platforms. Notably, `rm` is missing on Windows.
const path = require("path");
const fs = require("fs");

const distPath = path.join(__dirname, "..", "dist");

fs.rmdirSync(distPath, { recursive: true });
