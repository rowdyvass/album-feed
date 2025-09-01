import OpenAI from 'openai'

interface OpenAIConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

class OpenAIService {
  private client: OpenAI
  private config: OpenAIConfig

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    this.config = {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
    })
  }

  async generateCriticalConsensus(album: {
    title: string
    artistCredit: string
    genres: string[]
    releaseDate: string
    label?: string
  }): Promise<string> {
    try {
      const prompt = this.buildCriticalConsensusPrompt(album)
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional music critic writing critical consensus summaries. Write in the style of music journalism, focusing on artistic merit, production quality, and cultural impact. Keep responses to 2-3 sentences, around 150-200 words.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      })

      const consensus = response.choices[0]?.message?.content?.trim()
      if (!consensus) {
        throw new Error('No response generated from OpenAI')
      }

      console.log(`[OpenAI] Generated consensus for "${album.title}" by ${album.artistCredit}`)
      return consensus

    } catch (error) {
      console.error('[OpenAI] Error generating critical consensus:', error)
      
      // Return fallback consensus
      return this.generateFallbackConsensus(album)
    }
  }

  private buildCriticalConsensusPrompt(album: {
    title: string
    artistCredit: string
    genres: string[]
    releaseDate: string
    label?: string
  }): string {
    const year = new Date(album.releaseDate).getFullYear()
    const primaryGenre = album.genres[0] || 'music'
    const additionalGenres = album.genres.slice(1).join(', ')
    
    return `Write a critical consensus for the album "${album.title}" by ${album.artistCredit}, released in ${year}. 
    
Album details:
- Primary genre: ${primaryGenre}
${additionalGenres ? `- Additional genres: ${additionalGenres}` : ''}
${album.label ? `- Label: ${album.label}` : ''}

The consensus should:
- Sound authoritative and professional
- Mention the album's strengths in songwriting, production, or artistic vision
- Reference the genre context and artistic evolution
- Be suitable for display on an album aggregation website
- Avoid specific song titles or overly detailed technical analysis
- Be 2-3 sentences, around 150-200 words

Do not include quotes or review scores. Write in third person.`
  }

  private generateFallbackConsensus(album: {
    title: string
    artistCredit: string
    genres: string[]
  }): string {
    const primaryGenre = album.genres[0]?.toLowerCase() || 'music'
    
    const fallbacks = [
      `A compelling ${primaryGenre} release that showcases ${album.artistCredit}'s artistic growth and musical sophistication. Critics have praised the album's cohesive vision and strong songwriting throughout.`,
      `${album.artistCredit} delivers a solid ${primaryGenre} effort with "${album.title}", featuring well-crafted compositions and polished production. The album demonstrates the artist's continued evolution and commitment to their craft.`,
      `This ${primaryGenre} release finds ${album.artistCredit} exploring new sonic territories while maintaining their distinctive sound. The album has been noted for its thoughtful arrangements and engaging musical narrative.`
    ]
    
    // Use a simple hash to consistently select the same fallback for the same album
    const hash = (album.title + album.artistCredit).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return fallbacks[Math.abs(hash) % fallbacks.length]
  }

  async generateReviewExcerpt(album: {
    title: string
    artistCredit: string
    genres: string[]
  }, publication: 'Pitchfork' | 'Rolling Stone' | 'AllMusic', score?: number): Promise<string> {
    try {
      const prompt = this.buildReviewExcerptPrompt(album, publication, score)
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are writing review excerpts in the style of ${publication}. Match their typical tone, vocabulary, and review style. Keep excerpts to 1-2 sentences, around 50-80 words.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      })

      const excerpt = response.choices[0]?.message?.content?.trim()
      if (!excerpt) {
        throw new Error('No excerpt generated from OpenAI')
      }

      return excerpt

    } catch (error) {
      console.error(`[OpenAI] Error generating ${publication} review excerpt:`, error)
      return this.generateFallbackExcerpt(album, publication)
    }
  }

  private buildReviewExcerptPrompt(album: {
    title: string
    artistCredit: string
    genres: string[]
  }, publication: string, score?: number): string {
    const primaryGenre = album.genres[0] || 'music'
    
    let styleGuide = ''
    switch (publication) {
      case 'Pitchfork':
        styleGuide = 'Use Pitchfork\'s analytical, sometimes academic tone. Reference cultural context and artistic innovation.'
        break
      case 'Rolling Stone':
        styleGuide = 'Use Rolling Stone\'s accessible, rock-focused perspective. Emphasize musicianship and cultural impact.'
        break
      case 'AllMusic':
        styleGuide = 'Use AllMusic\'s comprehensive, informative style. Focus on technical aspects and genre placement.'
        break
    }

    return `Write a review excerpt for "${album.title}" by ${album.artistCredit} in the style of ${publication}.

Genre: ${primaryGenre}
${score ? `Score context: ${score}/10 (adjust tone accordingly)` : ''}

Style guide: ${styleGuide}

Write 1-2 sentences that could appear as a pull quote from the review. Be specific about musical elements while matching the publication's voice.`
  }

  private generateFallbackExcerpt(album: {
    title: string
    artistCredit: string
    genres: string[]
  }, publication: string): string {
    const primaryGenre = album.genres[0] || 'music'
    
    const fallbacksByPublication = {
      'Pitchfork': [
        `${album.artistCredit} crafts a cohesive ${primaryGenre} statement that rewards careful listening.`,
        `A thoughtfully constructed album that showcases the artist's evolving sonic palette.`
      ],
      'Rolling Stone': [
        `${album.artistCredit} delivers strong performances across this engaging ${primaryGenre} collection.`,
        `The musicianship shines throughout this well-produced effort.`
      ],
      'AllMusic': [
        `A solid addition to ${album.artistCredit}'s discography with consistent songwriting.`,
        `The album effectively balances accessibility with artistic ambition.`
      ]
    }
    
    const options = fallbacksByPublication[publication as keyof typeof fallbacksByPublication] || fallbacksByPublication['AllMusic']
    return options[Math.floor(Math.random() * options.length)]
  }

  // Health check method
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
        max_tokens: 10,
      })
      
      return response.choices[0]?.message?.content?.includes('OK') || false
    } catch (error) {
      console.error('[OpenAI] Connection test failed:', error)
      return false
    }
  }
}

export const openAIService = new OpenAIService()

