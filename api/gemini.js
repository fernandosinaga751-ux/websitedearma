// Fetch gambar dari Pexels
async function fetchPexelsImage(query, apiKey) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const photo = data.photos?.[0]
    return photo ? photo.src.large : null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt diperlukan' })
  }

  const groqKey = process.env.GROQ_API_KEY
  const pexelsKey = process.env.PEXELS_API_KEY

  if (!groqKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY belum dikonfigurasi' })
  }

  try {
    // 1. Generate artikel dari Groq
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah penulis konten profesional untuk website rental mobil "Dearma Sewa Mobil Medan". Selalu balas HANYA dengan JSON murni, tanpa markdown, tanpa kode block, tanpa teks tambahan apapun.'
          },
          {
            role: 'user',
            content: `Buat artikel blog lengkap dan menarik dalam Bahasa Indonesia untuk topik: "${prompt}"

Artikel harus informatif, SEO-friendly, relevan dengan layanan rental mobil di Medan, dan menggunakan format HTML yang kaya.

Balas HANYA JSON murni dengan format ini:
{
  "title": "Judul artikel menarik dan SEO friendly",
  "excerpt": "Ringkasan 1-2 kalimat yang menarik pembaca",
  "category": "Tips",
  "imageKeywords": ["kata kunci foto 1 dalam bahasa inggris", "kata kunci foto 2 dalam bahasa inggris"],
  "blocks": [
    {
      "type": "html",
      "content": "<p>Paragraf pembuka yang menarik dan engaging...</p>"
    },
    {
      "type": "html",
      "content": "<h2>Subjudul Bagian Pertama</h2><p>Penjelasan detail...</p><ul><li><strong>Poin penting 1:</strong> Penjelasan</li><li><strong>Poin penting 2:</strong> Penjelasan</li><li><strong>Poin penting 3:</strong> Penjelasan</li></ul>"
    },
    {
      "type": "html",
      "content": "<h2>Subjudul Bagian Kedua</h2><p>Penjelasan detail bagian kedua dengan informasi berguna...</p>"
    },
    {
      "type": "html",
      "content": "<h2>Tips Praktis</h2><ol><li>Langkah pertama</li><li>Langkah kedua</li><li>Langkah ketiga</li></ol>"
    },
    {
      "type": "html",
      "content": "<h2>Kesimpulan</h2><p>Penutup artikel dengan <strong>call to action</strong> ke Dearma Sewa Mobil Medan...</p>"
    }
  ]
}

Aturan:
- imageKeywords: 2 kata kunci dalam bahasa Inggris untuk mencari foto relevan (contoh: "car rental indonesia", "north sumatra travel")
- blocks: minimal 4-5 blok konten
- Gunakan tag HTML: h2, h3, p, ul, ol, li, strong, em
- Category harus salah satu dari: Tips, Wisata, Info, Armada, Promo`
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      })
    })

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}))
      return res.status(groqRes.status).json({
        error: errData?.error?.message || `Groq API error: ${groqRes.status}`
      })
    }

    const groqData = await groqRes.json()
    const rawText = groqData.choices?.[0]?.message?.content || ''
    const cleanText = rawText.replace(/```json\n?|\n?```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleanText)
    } catch {
      return res.status(500).json({ error: 'Gagal memparse respons dari AI. Coba lagi.' })
    }

    // 2. Ambil gambar dari Pexels (jika API key tersedia)
    let finalBlocks = parsed.blocks || []

    if (pexelsKey && parsed.imageKeywords?.length > 0) {
      const imageUrls = await Promise.all(
        parsed.imageKeywords.slice(0, 2).map(kw => fetchPexelsImage(kw, pexelsKey))
      )

      // Sisipkan gambar di antara blok konten
      const blocksWithImages = []
      finalBlocks.forEach((block, index) => {
        blocksWithImages.push(block)
        // Sisipkan gambar setelah blok ke-1 dan ke-3
        if (index === 1 && imageUrls[0]) {
          blocksWithImages.push({ type: 'image', content: imageUrls[0] })
        }
        if (index === 3 && imageUrls[1]) {
          blocksWithImages.push({ type: 'image', content: imageUrls[1] })
        }
      })
      finalBlocks = blocksWithImages
    }

    return res.status(200).json({
      title: parsed.title,
      excerpt: parsed.excerpt,
      category: parsed.category,
      blocks: finalBlocks
    })

  } catch (err) {
    console.error('AI proxy error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
