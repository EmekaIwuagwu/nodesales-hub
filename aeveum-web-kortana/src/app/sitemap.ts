import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aeveum.io'
  const pages = [
    '',
    '/products',
    '/products/defence-drones',
    '/products/dispatch-drones',
    '/products/humanoid-robots',
    '/products/home-robots',
    '/technology',
    '/about',
    '/contact',
  ]

  return pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: page === '' ? 1 : 0.8,
  }))
}
