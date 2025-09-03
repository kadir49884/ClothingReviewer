# ReviewClothes AI - Yapay Zeka Destekli Kıyafet Değerlendirici

Google Gemini AI kullanarak kıyafetlerinizi değerlendiren web uygulaması.

## Lokal Çalıştırma

**Gereksinimler:** Node.js

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env.local` dosyasında `NEXT_PUBLIC_GEMINI_API_KEY` değişkenini Gemini API anahtarınızla ayarlayın:
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

3. Uygulamayı çalıştırın:
   ```bash
   npm run dev
   ```

## Vercel'de Yayınlama

### Yöntem 1: Vercel CLI ile

1. Vercel CLI'yi yükleyin:
   ```bash
   npm i -g vercel
   ```

2. Proje dizininde deploy edin:
   ```bash
   vercel
   ```

3. Environment variable'ı ekleyin:
   ```bash
   vercel env add NEXT_PUBLIC_GEMINI_API_KEY
   ```
   API anahtarınızı girin.

4. Tekrar deploy edin:
   ```bash
   vercel --prod
   ```

### Yöntem 2: Vercel Dashboard ile

1. [vercel.com](https://vercel.com) adresinden hesap oluşturun
2. "New Project" tıklayın
3. GitHub repo'nuzdan import edin
4. Environment Variables bölümünde:
   - Key: `NEXT_PUBLIC_GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
5. "Deploy" tıklayın

## API Anahtarı Alma

Google Gemini API anahtarı almak için: [AI Studio](https://aistudio.google.com/app/apikey)

## Özellikler

- 📷 Fotoğraf yükleme
- 🤖 AI destekli kıyafet analizi
- 🎨 Özelleştirilebilir skor kartları
- 📱 Responsive tasarım
- 📋 Paylaşım ve kopyalama özellikleri
