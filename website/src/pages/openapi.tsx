import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function OpenApiPage(): React.ReactElement {
  const openApiUrl = useBaseUrl('/openapi.yaml');

  return (
    <main style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>OpenAPI Specification</h1>
      <p>OpenAPI source tersedia di file berikut:</p>
      <p>
        <a href={openApiUrl}>{openApiUrl}</a>
      </p>
      <p>
        Gunakan file ini untuk code generation, API client SDK, atau sinkronisasi kontrak
        API.
      </p>
    </main>
  );
}
