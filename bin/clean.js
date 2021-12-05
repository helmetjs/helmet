#!/usr/bin/env node
// This lets us remove files on all platforms. Notably, `rm` is missing on Windows.
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const thisPath = fileURLToPath(import.meta.url);
const distPath = path.join(path.dirname(thisPath), "..", "dist");

fs.rmSync(distPath, { recursive: true, force: true });
