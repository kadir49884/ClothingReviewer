'use client'

import { useState, useRef, useEffect } from 'react'

// Demo image base64 - kısaltılmış versiyon
const DEMO_IMAGE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGI_W19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW19fW1//AABEIASwDIAMBIgACEQEDEQH/xAC7AAEAAgMBAQEAAAAAAAAAAAAABgcEBQgDAgEBAQEBAQEAAAAAAAAAAAAAAAECAwT/2gAMAwEAAhADEAAAAP2oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArz0AAAAAAAAAAAAAAAAAAAAAAACMlU5gAAAAAAAAAAAAAAAAAAAAAACnNAg9AAAAAAAAAAAAAAAAAAAAAABXisTzQAAAAAAAAAAAAAAAAAAAAAAEGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAABnoz0AAAAAAAAAAAAAAAAAAAAAAGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAABnoz0AAAAAAAAAAAAAAAAAAAAAAGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAABnoz0AAAAAAAAAAAAAAAAAAAAAAGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAABnoz0AAAAAAAAAAAAAAAAAAAAAAGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAABnoz0AAAAAAAAAAAAAAAAAAAAAAGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAABnoz0AAAAAAAAAAAAAAAAAAAAAAGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAABnoz0AAAAAAAAAAAAAAAAAAAAAAGejPQAAAAAAAAAAAAAAAAAAAAAAZ6M9AAAAAAAAAAAAAAAAAAAAAAA=';

interface AnalysisResult {
  score: number;
  style_persona: string;
  one_liner: string;
  mode: 'roast' | 'compliment';
  body: string;
  tips: string[];
  hashtags: string[];
}

export default function FitReviewer() {
  const [currentPanel, setCurrentPanel] = useState<'upload' | 'options' | 'result'>('upload')
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [mode, setMode] = useState<'roast' | 'compliment'>('roast')
  const [tone, setTone] = useState('Z Kuşağı / Eğlenceli')
  const [blurFace, setBlurFace] = useState(true)
  const [apiError, setApiError] = useState('')
  const [ai, setAi] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copyFeedback, setCopyFeedback] = useState('')
  
  // Component mount olduktan sonra API'yı başlat
  useEffect(() => {
    const initializeAI = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      console.log('API Key status:', apiKey ? 'Available' : 'Missing', apiKey ? apiKey.substring(0, 10) + '...' : 'None')
      
      if (apiKey && apiKey.trim() !== '') {
        try {
          // Dinamik import kullan
          const { GoogleGenAI } = await import('@google/genai')
          
          // Object formatında dene
          const aiInstance = new GoogleGenAI({
            apiKey: apiKey
          })
          setAi(aiInstance)
          setApiError('')
          console.log('GoogleGenAI successfully initialized with dynamic import')
        } catch (error) {
          console.error('GoogleGenAI initialization error:', error)
          setApiError('API anahtarı geçersiz: ' + (error as Error).message)
        }
      } else {
        setApiError('API anahtarı bulunamadı')
      }
      setIsInitialized(true)
    }
    
    initializeAI()
  }, [])
  
  // Yükleme durumunda basit loading göster
  if (!isInitialized) {
    return (
      <div className="panel active">
        <h2>Yükleniyor...</h2>
        <p>AI sistemi hazırlanıyor...</p>
      </div>
    )
  }
  
  // API hatası varsa göster
  if (apiError) {
    return (
      <div className="panel active">
        <h2>⚠️ API Hatası</h2>
        <p>API anahtarı ile ilgili bir sorun var:</p>
        <pre style={{background: '#2a2a2a', padding: '1rem', borderRadius: '8px', overflow: 'auto', color: '#ff6b6b'}}>
          {apiError}
        </pre>
        <p>Lütfen .env.local dosyanızda doğru API anahtarı olduğundan emin olun:</p>
        <pre style={{background: '#2a2a2a', padding: '1rem', borderRadius: '8px', overflow: 'auto'}}>
          NEXT_PUBLIC_GEMINI_API_KEY=your_valid_api_key_here
        </pre>
        <p>API anahtarı almak için: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)'}}>Google AI Studio</a></p>
        <button onClick={() => window.location.reload()} style={{marginTop: '1rem'}}>Sayfayı Yenile</button>
      </div>
    )
  }

  const fileToGenerativePart = (file: File): Promise<{
    inlineData: { data: string; mimeType: string };
  }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const handleImageSelected = (src: string) => {
    setCurrentImage(src)
    setCurrentPanel('options')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelected(URL.createObjectURL(file))
    }
  }

  const handleDemoClick = () => {
    handleImageSelected(DEMO_IMAGE_BASE64)
  }

  const analyzeOutfit = async () => {
    if (!currentImage || isLoading || !ai) {
      if (!ai) {
        setApiError('AI sistemi hazır değil!')
      }
      return
    }

    setIsLoading(true)
    setLoadingMessage('YZ stilist hazırlanıyor...')

    try {
      const prompt = `Sen Türkçe konuşan, esprili bir internet kişiliğine sahip bir moda stilistisin. Girdi görüntüsündeki kıyafeti analiz et ve KESİN JSON formatında bir yanıt döndür. JSON yanıtındaki TÜM metin değerleri TÜRKÇE olmalıdır.

Kullanıcı şu ayarları seçti: mod: '${mode}' ve ton: '${tone}'.

'roast' modu seçildiyse ('Yorumla' anlamına gelir) esprili ve zararsız ol. 'compliment' modu seçildiyse ('Öv' anlamına gelir) pozitif ve teşvik edici ol.

Kurallar: Kısa ve öz ol. Asla yüzlerden, vücut şekillerinden veya hassas özelliklerden bahsetme. Yalnızca kıyafetlere, renklere, kalıba ve aksesuarlara odaklan.`

      const imageResponse = await fetch(currentImage)
      const imageBlob = await imageResponse.blob()
      const imagePart = await fileToGenerativePart(
        new File([imageBlob], 'user-image.jpg', { type: imageBlob.type })
      )

      const textPart = { text: prompt }

      const responseSchema = {
        type: 'object' as const,
        properties: {
          score: { type: 'integer' as const, description: 'Outfit score from 0-100' },
          style_persona: { type: 'string' as const, description: "e.g., 'Neo Minimalist', 'Street Tech'" },
          one_liner: { type: 'string' as const, description: 'Catchy headline, max 90 chars' },
          mode: { type: 'string' as const, enum: ['roast', 'compliment'] },
          body: { type: 'string' as const, description: '2 short sentences, fun but respectful commentary' },
          tips: { type: 'array' as const, items: { type: 'string' as const }, description: '3 short bullet points for improvement or styling' },
          hashtags: { type: 'array' as const, items: { type: 'string' as const }, description: "5 lower-case tags without '#', e.g., 'streetwear','ootd'" },
        },
        required: ['score', 'style_persona', 'one_liner', 'mode', 'body', 'tips', 'hashtags'],
      }

      setLoadingMessage('Renkler, desenler ve tarz analiz ediliyor...')
      
      console.log('API çağrısı başlatılıyor...', {
        model: 'gemini-2.5-flash',
        promptLength: prompt.length,
        hasImagePart: !!imagePart,
        mode,
        tone
      })
      
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      })
      
      console.log('API yanıtı alındı:', response)
      
      setLoadingMessage('Skor kartın son haline getiriliyor...')
      
      console.log('Raw response text:', response.text)
      const result = JSON.parse(response.text) as AnalysisResult
      setAnalysisResult(result)
      
      await drawScorecard(currentImage, result, blurFace)
      setCurrentPanel('result')

    } catch (error) {
      console.error('Error analyzing outfit:', error)
      
      // Daha detaylı hata mesajları
      let errorMessage = 'Üzgünüz, YZ stilist şu anda meşgul.'
      
      if (error instanceof Error) {
        console.log('Detaylı hata:', error.message)
        if (error.message.includes('API_KEY') || error.message.includes('api key')) {
          errorMessage = 'API anahtarı sorunu: ' + error.message
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'API kotası aşıldı. Biraz bekleyip tekrar deneyin.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'İnternet bağlantısı sorunu. Bağlantınızı kontrol edin.'
        } else if (error.message.includes('rate')) {
          errorMessage = 'Çok hızlı istek gönderiliyor. 30 saniye bekleyip tekrar deneyin.'
        } else if (error.message.includes('SAFETY')) {
          errorMessage = 'Görsel içerik güvenlik filtrelerine takıldı. Başka bir görsel deneyin.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Geçersiz istek. Görsel formatını kontrol edin.'
        } else {
          errorMessage = `AI analiz hatası: ${error.message}`
        }
      }
      
      alert(errorMessage + ' (Detaylı hata console\'da görülebilir)')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  // Canvas utility functions
  const getAverageColor = (img: HTMLImageElement): { r: number; g: number; b: number } => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return { r: 20, g: 20, b: 20 }

    const w = (canvas.width = img.width)
    const h = (canvas.height = img.height)
    ctx.drawImage(img, 0, 0, w, h)

    const data = ctx.getImageData(0, 0, w, h).data
    let r = 0, g = 0, b = 0

    for (let i = 0; i < data.length; i += 4 * 10) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }
    const count = data.length / (4 * 10)
    return { r: Math.floor(r / count), g: Math.floor(g / count), b: Math.floor(b / count) }
  }

  const getContrastColor = (r: number, g: number, b: number): string => {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): number => {
    const words = text.split(' ')
    let line = ''
    let currentY = y
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY)
        line = words[n] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    
    if (line.trim()) {
      ctx.fillText(line.trim(), x, currentY)
      currentY += lineHeight
    }
    
    return currentY
  }

  const drawScorecard = async (imgSrc: string, data: AnalysisResult, blurFace: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('Canvas not found')
      return
    }
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    return new Promise<void>((resolve) => {
      img.onload = () => {
        const W = 1080
        const H = 1350

        const imgAspectRatio = img.width / img.height
        const canvasAspectRatio = W / H
        let sx, sy, sWidth, sHeight

        if (imgAspectRatio > canvasAspectRatio) {
          sHeight = img.height
          sWidth = sHeight * canvasAspectRatio
          sx = (img.width - sWidth) / 2
          sy = 0
        } else {
          sWidth = img.width
          sHeight = sWidth / canvasAspectRatio
          sx = 0
          sy = (img.height - sHeight) / 2
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, W, H)

        const avgColor = getAverageColor(img)
        const textColor = getContrastColor(avgColor.r, avgColor.g, avgColor.b)
        ctx.fillStyle = `rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, 0.9)`
        const overlayHeight = H * 0.65 // Yazı alanını büyültüyoruz
        const cornerRadius = 40
        ctx.beginPath()
        ctx.moveTo(0, H - overlayHeight + cornerRadius)
        ctx.arcTo(0, H - overlayHeight, cornerRadius, H - overlayHeight, cornerRadius)
        ctx.lineTo(W - cornerRadius, H - overlayHeight)
        ctx.arcTo(W, H - overlayHeight, W, H - overlayHeight + cornerRadius, cornerRadius)
        ctx.lineTo(W, H)
        ctx.lineTo(0, H)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = textColor
        const padding = 70 // Padding biraz arttırıldı
        const contentWidth = W - padding * 2
        const lineSpacing = 35 // Satırlar arası boşluk arttırıldı

        // Style persona - daha belirgin
        ctx.font = 'bold 38px Arial'
        ctx.textAlign = 'left'
        let currentY = H - overlayHeight + 50
        ctx.fillText(data.style_persona.toUpperCase(), padding, currentY)

        // One liner - daha okunabilir
        currentY += 65
        ctx.font = 'bold 44px Arial'
        currentY = wrapText(ctx, `"${data.one_liner}"`, padding, currentY, contentWidth, 52)
        currentY += lineSpacing

        // Body text - optimize edildi
        ctx.font = '32px Arial'
        currentY = wrapText(ctx, data.body, padding, currentY, contentWidth, 44)
        currentY += lineSpacing

        // İpuçları başlığı - daha belirgin
        ctx.font = 'bold 32px Arial'
        ctx.fillText('İpuçları:', padding, currentY)
        currentY += 50
        
        // İpuçları listesi - daha okunabilir
        ctx.font = '30px Arial'
        data.tips.slice(0, 3).forEach((tip, index) => {
          currentY = wrapText(ctx, `• ${tip}`, padding, currentY, contentWidth, 38)
          if (index < 2) currentY += 25 // İpuçları arasındaki boşluk
        })

        // Hashtags - daha görünür konumda
        ctx.font = '26px Arial'
        ctx.fillStyle = textColor === '#000000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'
        const hashtags = data.hashtags
          .slice(0, 5)
          .map((h) => `#${h}`)
          .join(' ')
        ctx.fillText(hashtags, padding, H - 35)

        // Score badge - optimize konumu ve boyutu
        const badgeRadius = 75
        const badgeX = W - padding - badgeRadius - 15
        const badgeY = H - overlayHeight + badgeRadius + 25
        
        // Badge background
        ctx.beginPath()
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2)
        ctx.fillStyle = textColor
        ctx.fill()

        // Score text - daha okunabilir
        ctx.font = 'bold 60px Arial'
        ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(data.score.toString(), badgeX, badgeY)

        // Brand text - daha görünür
        ctx.font = '22px Arial'
        ctx.fillStyle = textColor
        ctx.textAlign = 'right'
        ctx.globalAlpha = 0.8
        ctx.fillText('fitimiyorumla.ai', W - padding, H - overlayHeight - 12)
        ctx.globalAlpha = 1.0
        ctx.textBaseline = 'alphabetic'
        
        resolve()
      }
      img.src = imgSrc
    })
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'fitimiyorumla-skorkarti.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const getShareUrl = (): string => {
    const url = new URL(window.location.href)
    const ref = url.searchParams.get('ref')
    
    const shareUrl = new URL(url.origin + url.pathname)
    shareUrl.searchParams.set('utm_source', 'share')
    shareUrl.searchParams.set('utm_medium', 'card')
    shareUrl.searchParams.set('utm_campaign', 'launch1')
    
    if (ref) {
      shareUrl.searchParams.set('ref', ref)
    }
    
    return shareUrl.toString()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      setCopyFeedback('Bağlantı kopyalandı! ✓')
      setTimeout(() => setCopyFeedback(''), 2000)
    } catch (err) {
      alert('Bağlantı kopyalanamadı.')
    }
  }

  const handleCopyCaption = async () => {
    if (!analysisResult) return
    const caption = `Benim kombinim ${analysisResult.score}/100 puan aldı – ${analysisResult.one_liner}. Sen de dene: ${getShareUrl()} #${analysisResult.hashtags.join(' #')}`
    try {
      await navigator.clipboard.writeText(caption)
      setCopyFeedback('Açıklama kopyalandı! ✓')
      setTimeout(() => setCopyFeedback(''), 2000)
    } catch (err) {
      alert('Açıklama kopyalanamadı.')
    }
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas || !('share' in navigator)) {
      alert("Tarayıcınız Paylaşım API'sini desteklemiyor. Bunun yerine bağlantıyı kopyalamayı deneyin.")
      return
    }
    
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'fitimiyorumla-skorkarti.png', {
        type: 'image/png',
      })
      const shareData = {
        title: "Fit'imi Yorumla Skor Kartı",
        text: `Kombinim ${analysisResult?.score}/100 puan aldı! Skor kartıma bir göz at.`,
        files: [file],
        url: getShareUrl(),
      }
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
        } catch (error) {
          console.error('Paylaşım başarısız oldu', error)
        }
      }
    }, 'image/png')
  }

  const handleStartOver = () => {
    setCurrentImage(null)
    setAnalysisResult(null)
    setCurrentPanel('upload')
    setApiError('')
    setCopyFeedback('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  
  return (
    <div id="app">
      {/* Upload Panel */}
      <section className={`panel ${currentPanel === 'upload' ? 'active' : ''}`}>
        <h2>1. Kıyafetini Yükle</h2>
        <div className="upload-area">
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            hidden 
            onChange={handleFileUpload}
          />
          <label 
            className="upload-label" 
            role="button" 
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
          >
            <span>📷 Fotoğraf Seç</span>
          </label>
          <p>veya</p>
          <button onClick={handleDemoClick}>Demo Görseli Dene</button>
        </div>
        {currentImage && (
          <div id="image-preview-container">
            <img id="image-preview" src={currentImage} alt="Yüklediğiniz görsel" />
            <button 
              className="secondary"
              onClick={() => {
                setCurrentImage(null)
                setCurrentPanel('upload')
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
            >
              Görseli Değiştir
            </button>
          </div>
        )}
      </section>

      {/* Options Panel */}
      <section className={`panel ${currentPanel === 'options' ? 'active' : ''}`}>
        <h2>2. Tarzını Belirle</h2>
        
        <div className="option-group">
          <label>Mod</label>
          <div className="toggle-switch">
            <input
              type="radio"
              id="mode-roast"
              name="mode"
              value="roast"
              checked={mode === 'roast'}
              onChange={(e) => setMode(e.target.value as 'roast')}
            />
            <label htmlFor="mode-roast">Yorumla 🔥</label>
            <input
              type="radio"
              id="mode-compliment"
              name="mode"
              value="compliment"
              checked={mode === 'compliment'}
              onChange={(e) => setMode(e.target.value as 'compliment')}
            />
            <label htmlFor="mode-compliment">Öv ✨</label>
          </div>
        </div>
        
        <div className="option-group">
          <label htmlFor="tone-select">Ton</label>
          <select 
            id="tone-select"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="Z Kuşağı / Eğlenceli">Z Kuşağı / Eğlenceli</option>
            <option value="Nötr / Arkadaşça">Nötr / Arkadaşça</option>
            <option value="Profesyonel Stilist">Profesyonel Stilist</option>
          </select>
        </div>
        
        <div className="option-group privacy">
          <input 
            type="checkbox" 
            id="blur-face-check" 
            checked={blurFace}
            onChange={(e) => setBlurFace(e.target.checked)}
          />
          <label htmlFor="blur-face-check">Gizlilik için yüzü buğula</label>
        </div>
        
        <button 
          onClick={analyzeOutfit}
          disabled={!currentImage || isLoading || !ai}
        >
          {isLoading ? 'Analiz ediliyor...' : 'Kıyafeti Analiz Et'}
        </button>
        
        {apiError && (
          <div style={{marginTop: '1rem', padding: '0.75rem', backgroundColor: '#ff4444', color: 'white', borderRadius: '8px'}}>
            {apiError}
          </div>
        )}
      </section>

      {/* Result Panel */}
      <section className={`panel ${currentPanel === 'result' ? 'active' : ''}`}>
        <h2>3. Skor Kartın</h2>
        <div id="canvas-container">
          <canvas id="scorecard-canvas" ref={canvasRef} width="1080" height="1350" />
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Analiz ediliyor... bu biraz zaman alabilir.</p>
              <p className="loading-message">{loadingMessage}</p>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button onClick={handleDownload}>PNG Olarak İndir</button>
          <button onClick={handleShare}>Paylaş</button>
        </div>
        
        <div className="copy-buttons">
          <button onClick={handleCopyLink}>Bağlantıyı Kopyala</button>
          <button onClick={handleCopyCaption}>Açıklamayı Kopyala</button>
        </div>
        
        {copyFeedback && (
          <div style={{
            textAlign: 'center',
            padding: '0.5rem',
            backgroundColor: 'var(--secondary-color)',
            color: '#000',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            {copyFeedback}
          </div>
        )}
        
        <button 
          className="secondary"
          onClick={handleStartOver}
        >
          Baştan Başla
        </button>
      </section>
    </div>
  )
}
