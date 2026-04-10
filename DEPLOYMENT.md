# Rap Stories Deployment Notes

## Before Launch

1. Set the live site URL in `site-config.js`.
2. Replace `https://example.com` in `sitemap.xml`.
3. Replace `https://example.com` in `robots.txt`.
4. Verify the live domain in Google Search Console.
5. Submit the live sitemap after deployment.

## Shared Config

- `site-config.js` is now the shared base URL source for runtime SEO metadata.
- `artist-renderer.js` and `site-enhancements.js` both read from it.

## Quick QA

- Check the homepage stats.
- Check one artist page for hero image preload and source links.
- Check one category page and one explorer page.
- Check one mobile page and one desktop page.
