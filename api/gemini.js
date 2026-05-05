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

// Sisipkan gambar di antara blok konten
function insertImages(blocks, imageUrls) {
  if (!imageUrls || imageUrls.length === 0) return blocks
  const result = []
  blocks.forEach((block, index) => {
    result.push(block)
    if (index === 1 && imageUrls[0]) {
      result.push({ type: 'image', content: imageUrls[0] })
    }
    if (index === 3 && imageUrls[1]) {
      result.push({ type: 'image', content: imageUrls[1] })
    }
  })
  return result
}

// Call Groq API
async function callGroq(groqKey, systemPrompt, userPrompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, message: err?.error?.message || `Groq error: ${res.status}` }
  }

  const data = await res.json()
  const rawText = data.choices?.[0]?.message?.content || ''
  const cleanText = rawText.replace(/```json\n?|\n?```/g, '').trim()

  try {
    return JSON.parse(cleanText)
  } catch {
    throw { status: 500, message: 'Gagal memparse respons dari AI. Coba lagi.' }
  }
}

const SYSTEM_PROMPT = 'Kamu adalah penulis konten profesional untuk website rental mobil "Dearma Sewa Mobil Medan". Selalu balas HANYA dengan JSON murni, tanpa markdown, tanpa kode block, tanpa teks tambahan apapun.'

const JSON_FORMAT = `
Balas HANYA JSON murni dengan format ini:
{
  "title": "Judul artikel menarik dan SEO friendly",
  "excerpt": "Ringkasan 1-2 kalimat yang menarik pembaca",
  "category": "Tips",
  "imageKeywords": ["kata kunci foto 1 bahasa inggris", "kata kunci foto 2 bahasa inggris"],
  "blocks": [
    {"type": "html", "content": "<p>Paragraf pembuka...</p>"},
    {"type": "html", "content": "<h2>Subjudul</h2><p>Isi...</p><ul><li><strong>Poin:</strong> Detail</li></ul>"},
    {"type": "html", "content": "<h2>Subjudul 2</h2><p>Isi...</p>"},
    {"type": "html", "content": "<h2>Tips Praktis</h2><ol><li>Langkah 1</li><li>Langkah 2</li></ol>"},
    {"type": "html", "content": "<h2>Kesimpulan</h2><p>Penutup dengan <strong>call to action</strong> ke Dearma Sewa Mobil Medan...</p>"}
  ]
}
Aturan:
- imageKeywords: 2 kata kunci bahasa Inggris untuk cari foto relevan
- Gunakan tag HTML: h2, h3, p, ul, ol, li, strong, em
- Category: Tips | Wisata | Info | Armada | Promo`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { mode, prompt, text } = req.body
  const groqKey = process.env.GROQ_API_KEY
  const pexelsKey = process.env.PEXELS_API_KEY

  if (!groqKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY belum dikonfigurasi' })
  }

  try {
    let parsed

    // ── MODE: Perbaiki artikel dari paste ──────────────────────────
    if (mode === 'reformat') {
      if (!text || text.trim().length < 50) {
        return res.status(400).json({ error: 'Teks artikel terlalu pendek' })
      }

      parsed = await callGroq(
        groqKey,
        SYSTEM_PROMPT,
        `Kamu menerima artikel mentah di bawah ini. Tugas kamu:
1. Perbaiki dan percantik struktur artikel dengan format HTML yang menarik
2. Pertahankan ISI dan MAKNA aslinya, jangan ubah fakta
3. Tambahkan heading H2 yang tepat untuk setiap bagian
4. Buat poin-poin penting menjadi list (ul/ol)
5. Bold teks yang penting dengan <strong>
6. Buat judul yang menarik dan excerpt yang bagus
7. Sesuaikan dengan konteks rental mobil Dearma Sewa Mobil Medan jika relevan

ARTIKEL MENTAH:
---
${text.trim()}
---
${JSON_FORMAT}`
      )

    // ── MODE: Generate artikel baru dari topik ──────────────────────
    } else {
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'Prompt diperlukan' })
      }

      parsed = await callGroq(
        groqKey,
        SYSTEM_PROMPT,
        `Buat artikel blog lengkap dan menarik dalam Bahasa Indonesia untuk topik: "${prompt}"
Artikel harus informatif, SEO-friendly, dan relevan dengan layanan rental mobil di Medan.
${JSON_FORMAT}`
      )
    }

    // ── Ambil gambar dari Pexels ────────────────────────────────────
    let finalBlocks = parsed.blocks || []

    if (pexelsKey && parsed.imageKeywords?.length > 0) {
      const imageUrls = await Promise.all(
        parsed.imageKeywords.slice(0, 2).map(kw => fetchPexelsImage(kw, pexelsKey))
      )
      finalBlocks = insertImages(finalBlocks, imageUrls.filter(Boolean))
    }

    return res.status(200).json({
      title: parsed.title,
      excerpt: parsed.excerpt,
      category: parsed.category,
      blocks: finalBlocks
    })

  } catch (err) {
    console.error('AI proxy error:', err)
    const status = err.status || 500
    const message = err.message || 'Server error: ' + String(err)
    return res.status(status).json({ error: message })
  }
}
