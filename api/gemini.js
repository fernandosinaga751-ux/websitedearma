export default async function handler(req, res) {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt diperlukan' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum dikonfigurasi di server' })
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Kamu adalah penulis konten profesional untuk website rental mobil "Dearma Sewa Mobil Medan".

Buat artikel blog lengkap dalam Bahasa Indonesia berdasarkan topik berikut: "${prompt}"

Artikel harus informatif, SEO-friendly, dan relevan dengan layanan rental mobil di Medan.

PENTING: Balas HANYA dengan JSON murni, tanpa markdown, tanpa kode block, tanpa teks tambahan apapun.
Format JSON yang diharapkan:
{
  "title": "Judul artikel yang menarik dan SEO friendly",
  "excerpt": "Ringkasan artikel 1-2 kalimat yang menarik pembaca",
  "category": "Tips",
  "blocks": [
    {"type": "text", "content": "Paragraf pembuka yang menarik..."},
    {"type": "text", "content": "Paragraf isi dengan poin-poin penting..."},
    {"type": "text", "content": "Paragraf penutup dengan call to action ke Dearma Sewa Mobil Medan..."}
  ]
}

Category harus salah satu dari: Tips, Wisata, Info, Armada, Promo`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048
          }
        })
      }
    )

    // Handle rate limit
    if (geminiRes.status === 429) {
      return res.status(429).json({
        error: 'Batas request API tercapai. Tunggu beberapa detik lalu coba lagi.'
      })
    }

    if (!geminiRes.ok) {
      const errData = await geminiRes.json()
      return res.status(geminiRes.status).json({
        error: errData?.error?.message || `Gemini API error: ${geminiRes.status}`
      })
    }

    const data = await geminiRes.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleanText = rawText.replace(/```json\n?|\n?```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleanText)
    } catch {
      return res.status(500).json({ error: 'Gagal memparse respons dari AI. Coba lagi.' })
    }

    return res.status(200).json(parsed)

  } catch (err) {
    console.error('Gemini proxy error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
