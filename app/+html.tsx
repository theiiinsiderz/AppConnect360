import { ScrollViewStyleReset } from 'expo-router/html';

const APP_NAME = 'Connect 360';
const APP_DESCRIPTION = 'Smart connections. Let anyone contact you securely when needed.';
const APP_URL = 'https://carcard.app';
const THEME_COLOR_LIGHT = '#4F6EF7';
const THEME_COLOR_DARK = '#6C8EFF';
const BG_LIGHT = '#F0F4FF';
const BG_DARK = '#080C1A';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <title>{APP_NAME} - Smart Connections</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="application-name" content={APP_NAME} />
        <link rel="canonical" href={APP_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={APP_NAME} />
        <meta property="og:title" content={`${APP_NAME} - Smart Connections`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:image" content={`${APP_URL}/assets/images/icon.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${APP_NAME} - Smart Connections`} />
        <meta name="twitter:description" content={APP_DESCRIPTION} />
        <meta name="twitter:image" content={`${APP_URL}/assets/images/icon.png`} />

        <meta name="theme-color" content={THEME_COLOR_LIGHT} media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content={THEME_COLOR_DARK} media="(prefers-color-scheme: dark)" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <link rel="icon" type="image/png" href="/assets/images/favicon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const criticalCSS = `
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --bg: ${BG_LIGHT};
    --text: #0D1117;
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: ${BG_DARK};
      --text: #F1F5F9;
      color-scheme: dark;
    }
  }

  html,
  body,
  #root,
  [data-expo-router-root] {
    height: 100%;
  }

  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
`;
