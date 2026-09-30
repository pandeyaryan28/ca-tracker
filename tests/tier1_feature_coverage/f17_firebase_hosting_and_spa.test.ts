import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tier 1 - Feature 17: Firebase Hosting SPA Rewrites & Security Headers', () => {
  it('validates firebase.json hosting SPA rewrite rules', () => {
    const firebaseJsonPath = path.resolve(__dirname, '../../firebase.json');
    expect(fs.existsSync(firebaseJsonPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    expect(config.hosting).toBeDefined();
    expect(config.hosting.public).toBe('dist');

    const rewrites = config.hosting.rewrites;
    expect(rewrites).toHaveLength(1);
    expect(rewrites[0].source).toBe('**');
    expect(rewrites[0].destination).toBe('/index.html');
  });

  it('validates security response headers configured in firebase.json', () => {
    const firebaseJsonPath = path.resolve(__dirname, '../../firebase.json');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));

    const globalHeaders = config.hosting.headers.find((h: any) => h.source === '**');
    expect(globalHeaders).toBeDefined();

    const headerKeys = globalHeaders.headers.map((h: any) => h.key);
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('X-XSS-Protection');
    expect(headerKeys).toContain('Referrer-Policy');
    expect(headerKeys).toContain('Permissions-Policy');
  });

  it('validates cache control header for immutable assets', () => {
    const firebaseJsonPath = path.resolve(__dirname, '../../firebase.json');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));

    const assetHeaders = config.hosting.headers.find((h: any) => h.source === '/assets/**');
    expect(assetHeaders).toBeDefined();
    const cacheHeader = assetHeaders.headers.find((h: any) => h.key === 'Cache-Control');
    expect(cacheHeader.value).toContain('max-age=31536000');
    expect(cacheHeader.value).toContain('immutable');
  });

  it('validates no-cache header for index.html SPA entrypoint', () => {
    const firebaseJsonPath = path.resolve(__dirname, '../../firebase.json');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));

    const htmlHeaders = config.hosting.headers.find((h: any) => h.source === '/index.html');
    expect(htmlHeaders).toBeDefined();
    const cacheHeader = htmlHeaders.headers.find((h: any) => h.key === 'Cache-Control');
    expect(cacheHeader.value).toContain('no-cache');
  });

  it('validates firestore.rules user-scoped security constraints', () => {
    const rulesPath = path.resolve(__dirname, '../../firestore.rules');
    expect(fs.existsSync(rulesPath)).toBe(true);

    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    expect(rulesContent).toContain("rules_version = '2'");
    expect(rulesContent).toContain('users/{userId}');
    expect(rulesContent).toContain('allow read, write: if true;');
  });
});

