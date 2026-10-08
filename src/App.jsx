import { useState } from 'react';
import Loader from './components/Loader.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import { History, Marquee, Evolution, Bottle, Band, Finale } from './components/Sections.jsx';
import Brands from './components/Brands.jsx';
import Footer from './components/Footer.jsx';

// Abertura com o comercial preso na tela e controlado pelo scroll; depois, página normal.
export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <Loader done={ready} />
      <div className="grain" />
      <Header />
      <Hero onReady={() => setReady(true)} />
      <main>
        <History />
        <Marquee />
        <Evolution />
        <Bottle />
        <Band />
        <Brands />
        <Finale />
      </main>
      <Footer />
    </>
  );
}
