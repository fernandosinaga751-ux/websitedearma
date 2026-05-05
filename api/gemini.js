const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function callGeminiWithRetry(apiKey, prompt, maxRetries = 4) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
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

    // Kalau 429, tunggu lalu retry otomatis
    if (geminiRes.status === 429) {
      if (attempt < maxRetries - 1) {
        const waitMs = Math.pow(2, attempt) * 3000 // 3s, 6s, 12s
        console.log(`Rate limited. Retry ${attempt + 1}/${maxRetries - 1} setelah ${waitMs / 1000}s...`)
        await sleep(waitMs)
        continue
      }
      return { ok: false, status: 429, error: 'Rate limit API Gemini tercapai. Coba lagi dalam 1 menit.' }
    }

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}))
      return {
        ok: false,
        status: geminiRes.status,
        error: errData?.error?.message || `Gemini API error: ${geminiRes.status}`
      }
    }

    const data = await geminiRes.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleanText = rawText.replace(/```json\n?|\n?```/g, '').trim()

    try {
      const parsed = JSON.parse(cleanText)
      return { ok: true, data: parsed }
    } catch {
      return { ok: false, status: 500, error: 'Gagal memparse respons dari AI. Coba lagi.' }
    }
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

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum dikonfigurasi di server' })
  }

  try {
    const result = await callGeminiWithRetry(apiKey, prompt.trim())

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(200).json(result.data)

  } catch (err) {
    console.error('Gemini proxy error:', err)
    return res.status(500).json({ error: 'Server error: ' + err.message })
  }
}
