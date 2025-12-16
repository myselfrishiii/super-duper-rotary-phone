# sanatan-wiki

A JSON-driven wiki built with Next.js (app router) and TypeScript. Content lives under `content/pages/*.json`.

Features:
- Featured articles, categories, tags
- Responsive images with captions (figure/figcaption)
- Per-article SEO (Open Graph, Twitter card, JSON-LD)
- Sitemap (/sitemap.xml) and RSS feed (/rss.xml)
- robots.txt
- Simple search API + client
- Minimal server-side caching for performance

Run locally:
1. npm install
2. npm run dev

Deploy to Vercel:
1. Push this repository to GitHub.
2. Import project in Vercel and deploy.
3. After deployment, replace the placeholder site URL `https://your-site-domain.com` inside files with your real domain.

Content:
- Add articles as JSON in `content/pages/`. See existing examples (dharma, karma, samsara).
