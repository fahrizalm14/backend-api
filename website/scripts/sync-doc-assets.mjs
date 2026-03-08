import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const websiteRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(websiteRoot, '..');

const openApiSrc = path.join(repoRoot, 'docs', 'openapi.yaml');
const openApiDest = path.join(websiteRoot, 'static', 'openapi.yaml');
const swaggerDest = path.join(websiteRoot, 'static', 'swagger', 'index.html');

fs.mkdirSync(path.dirname(openApiDest), { recursive: true });
fs.mkdirSync(path.dirname(swaggerDest), { recursive: true });

if (!fs.existsSync(openApiSrc)) {
  throw new Error(`Missing source file: ${openApiSrc}`);
}

fs.copyFileSync(openApiSrc, openApiDest);

const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Backend API Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '../openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
      });
    </script>
  </body>
</html>
`;

fs.writeFileSync(swaggerDest, swaggerHtml, 'utf8');
console.log('Synced OpenAPI and Swagger assets to website/static');
