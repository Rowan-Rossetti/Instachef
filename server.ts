import express from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

const PORT = process.env['PORT'] || 4000;
const app = express();

const DIST_FOLDER = join(process.cwd(), 'dist/instachef/browser');

app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

// ❌ Problème potentiel ici :
app.get('*', (req, res) => {
  res.sendFile(join(DIST_FOLDER, 'index.html'));
});
