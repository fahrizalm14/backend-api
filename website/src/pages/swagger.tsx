import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function SwaggerPage(): React.ReactElement {
  const swaggerUrl = useBaseUrl('/swagger/index.html');

  return (
    <main style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
      <iframe
        title="Swagger UI"
        src={swaggerUrl}
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </main>
  );
}
