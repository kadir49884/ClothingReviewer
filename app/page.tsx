import FitReviewer from './components/FitReviewer'

export default function Home() {
  return (
    <>
      <header>
        <h1>Fit'imi Yorumla</h1>
        <p>Yapay Zeka ile Geliştirildi</p>
      </header>

      <main>
        <FitReviewer />
      </main>

      <footer>
        <p>
          Uyarı: Bu, yapay zeka destekli bir analizdir ve eğlence amaçlı olarak
          değerlendirilmelidir. Yapay zeka yalnızca giysi ve aksesuarlara odaklanır.
        </p>
      </footer>
    </>
  )
}