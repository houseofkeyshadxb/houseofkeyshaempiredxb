import { Router } from 'itty-router';

const router = Router();

// Serve static HTML files
const files = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/services': 'services.html',
  '/services.html': 'services.html',
  '/testimonials': 'testimonials.html',
  '/testimonials.html': 'testimonials.html',
  '/faq': 'faq.html',
  '/faq.html': 'faq.html',
  '/contact': 'contact.html',
  '/contact.html': 'contact.html',
  '/mistress-keysha': 'mistress-keysha.html',
  '/mistress-keysha.html': 'mistress-keysha.html',
  '/becky': 'becky.html',
  '/becky.html': 'becky.html',
};

router.get('*', async (request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Try direct match first
  let filename = files[pathname];

  // If not found, try with .html extension
  if (!filename && !pathname.endsWith('.html') && pathname !== '/') {
    filename = files[pathname + '.html'];
  }

  // Default to index.html
  if (!filename) {
    filename = 'index.html';
  }

  // Get file from the static directory in the same deployment
  const fileUrl = new URL(`/static/${filename}`, request.url);
  const response = await fetch(fileUrl.toString());

  if (response.ok) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  return new Response('404 Not Found', { status: 404 });
});

export default router.handle;
