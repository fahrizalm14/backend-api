import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: 'Backend API Docs',
  tagline: 'Architecture, API, and operations documentation',
  favicon: 'img/favicon.ico',

  url: 'https://fahrizalm14.github.io',
  baseUrl: '/',
  staticDirectories: ['static'],

  organizationName: 'fahrizalm14',
  projectName: 'backend-api',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs/guides',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    navbar: {
      title: 'Backend API',
      items: [
        { to: '/', label: 'Docs', position: 'left' },
        { to: '/openapi', label: 'OpenAPI', position: 'left' },
        { to: '/swagger', label: 'Swagger UI', position: 'left' },
        {
          href: 'https://github.com/fahrizalm14/backend-api',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
