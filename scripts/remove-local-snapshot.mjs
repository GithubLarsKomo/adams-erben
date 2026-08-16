import { rm } from 'node:fs/promises';
import path from 'node:path';

const snapshotPath = path.join(process.cwd(), 'dist', 'data', 'clubs.snapshot.json');
await rm(snapshotPath, { force: true });
console.log('[build] removed local-only club snapshot from dist');
