export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt diperlukan' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY belum dikonfigurasi di server' })
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
            content: `Buat artikel blog lengkap dalam Bahasa Indonesia berdasarkan topik berikut: "${prompt}"

Artikel harus informatif, SEO-friendly, dan relevan dengan layanan rental mobil di Medan.

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
          }
        ],
        temperature: 0.8,
        max_tokens: 2048
      })
    })

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}))
      return res.status(groqRes.status).json({
        error: errData?.error?.message || `Groq API error: ${groqRes.status}`
      })
    }

    const data = await groqRes.json()
    const rawText = data.choices?.[0]?.message?.content || ''
    const cleanText = rawText.replace(/```json\n?|\n?```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleanText)
    } catch {
      return res.status(500).json({ error: 'Gagal memparse respons dari AI. Coba lagi.' })
    }

    return res.status(200).json(parsed)

  } catch (err) {
    console.error('Groq proxy error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
