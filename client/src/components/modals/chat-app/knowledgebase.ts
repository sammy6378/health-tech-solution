import { useEffect, useState, useMemo } from 'react'

interface KnowledgeBase {
  content: string
  search: (query: string) => string
  isLoaded: boolean
  error: string | null
}

/**
 * Optimized knowledge base hook with caching and better performance
 */
export function useKnowledgeBase(): KnowledgeBase {
  const [docs, setDocs] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cache for search results to improve performance
  const searchCache = useMemo(() => new Map<string, string>(), [])

  useEffect(() => {
    const loadDocs = async () => {
      try {
        setError(null)
        const files = ['faq.md', 'dashboard.md', 'navigation.md']

        const contents = await Promise.all(
          files.map(async (file) => {
            try {
              const response = await fetch(`/base/${file}`)
              if (!response.ok) {
                throw new Error(`Failed to load ${file}: ${response.status}`)
              }
              const text = await response.text()
              return `# ${file.replace('.md', '')}\n\n${text}`
            } catch (err) {
              console.error(`Error loading ${file}:`, err)
              return `# ${file}\n\nError: Could not load this file.`
            }
          }),
        )

        const combinedDocs = contents.join('\n\n---\n\n')
        setDocs(combinedDocs)
        setIsLoaded(true)
      } catch (err) {
        console.error('Error loading knowledge base:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoaded(true)
      }
    }

    loadDocs()
  }, [])

  // Optimized search with caching and better relevance scoring
  const search = useMemo(() => {
    return (query: string): string => {
      if (!docs) return 'Knowledge base is still loading...'

      const cacheKey = query.toLowerCase().trim()
      if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey)!
      }

      const lowerQuery = cacheKey
      const queryWords = lowerQuery
        .split(/\s+/)
        .filter((word) => word.length > 2)

      // Split into sections and paragraphs
      const sections = docs.split(/---\n\n/g)
      const allChunks: Array<{ content: string; score: number }> = []

      sections.forEach((section) => {
        const paragraphs = section
          .split(/\n{2,}/g)
          .filter((p) => p.trim().length > 20)

        paragraphs.forEach((paragraph) => {
          const lowerParagraph = paragraph.toLowerCase()
          let score = 0

          // Exact phrase match (highest score)
          if (lowerParagraph.includes(lowerQuery)) {
            score += 15
          }

          // Individual word matches
          queryWords.forEach((word) => {
            const wordCount = (
              lowerParagraph.match(new RegExp(word, 'g')) || []
            ).length
            score += wordCount * 3
          })

          // Header/title matches (bonus points)
          if (paragraph.startsWith('#')) {
            if (lowerParagraph.includes(lowerQuery)) score += 10
            queryWords.forEach((word) => {
              if (lowerParagraph.includes(word)) score += 5
            })
          }

          // Dashboard-specific boost
          if (
            lowerQuery.includes('dashboard') ||
            lowerQuery.includes('user data')
          ) {
            if (
              lowerParagraph.includes('dashboard') ||
              lowerParagraph.includes('health summary')
            ) {
              score += 8
            }
          }

          if (score > 0) {
            allChunks.push({ content: paragraph.trim(), score })
          }
        })
      })

      // Sort by relevance and take top matches
      const sortedChunks = allChunks
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Reduced to 3 for faster responses
        .map((chunk) => chunk.content)

      const result =
        sortedChunks.length > 0
          ? sortedChunks.join('\n\n')
          : 'No specific information found in knowledge base.'

      // Cache the result
      searchCache.set(cacheKey, result)

      return result
    }
  }, [docs, searchCache])

  return {
    content: docs,
    search,
    isLoaded,
    error,
  }
}
