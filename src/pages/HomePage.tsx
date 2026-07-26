import { Share2 } from 'lucide-react';
import { SiteFooter } from '../components/navigation/GameNav';
import { SHARE_INVITE_TEXT, shareText } from '../utils/share';

type HomeGameKey = 'bedroom' | 'truth' | 'dice' | 'rather' | 'never';
type LegalPanel = 'terms' | 'privacy' | 'safety' | 'faq' | null;

const BRAND_NAME = 'Bedroom Roulette';

const homeGameCards: Array<{
  href: string;
  key: HomeGameKey;
  roman: string;
  name: string;
  desc: string;
}> = [
  { href: '/bedroom-roulette/?adult=1', key: 'bedroom', roman: 'I', name: 'Bedroom Roulette', desc: 'surrender' },
  { href: '/truth-or-dare-for-couples/?adult=1', key: 'truth', roman: 'II', name: 'Truth or Dare', desc: 'dare' },
  { href: '/dice-game-for-couples/?adult=1', key: 'dice', roman: 'III', name: "Lovers' Dice", desc: 'tease' },
  { href: '/would-you-rather-couples/?adult=1', key: 'rather', roman: 'IV', name: 'Would You Rather', desc: 'choose' },
  { href: '/never-have-i-ever/?adult=1', key: 'never', roman: 'V', name: 'Never Have I Ever', desc: 'confess' },
];

export default function HomePage({ onOpenLegal }: { onOpenLegal: (panel: LegalPanel) => void }) {
  return (
    <main className="page home-page">
      <section className="home-shell" aria-label="Bedroom Roulette games">
        <header className="home-hero">
          <div className="home-crest" aria-hidden="true">
            ✦
          </div>
          <h1>
            Bedroom
            <span>Roulette</span>
          </h1>
          <p>spin · sip · surrender</p>
          <div className="home-divider" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
        </header>

        <nav className="home-game-grid grid" aria-label="Choose a game">
          {homeGameCards.map((link) => (
            <a className={`home-game-card medallion ${link.key}`} href={link.href} key={link.key}>
              <span className="home-game-medallion ring-m" aria-hidden="true">
                <span className="home-game-number rn">{link.roman}</span>
                <HomeGamePreview game={link.key} />
              </span>
              <span className="home-game-name m-name">{link.name}</span>
              <span className="home-game-desc m-desc">{link.desc}</span>
            </a>
          ))}
        </nav>

        <button className="home-invite" onClick={() => void shareText(BRAND_NAME, SHARE_INVITE_TEXT)} type="button">
          <Share2 size={15} />
          share
        </button>
        <p className="home-foot">18+ · for two</p>
        <SiteFooter onOpen={onOpenLegal} />
      </section>
    </main>
  );
}

function HomeGamePreview({ game }: { game: HomeGameKey }) {
  if (game === 'bedroom') {
    return (
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="31" r="10.5" fill="none" stroke="#b08d4f" strokeWidth="1.8" />
        <line x1="37.4" y1="23.6" x2="47" y2="14" stroke="#b08d4f" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M47 20 L47 14 L41 14"
          fill="none"
          stroke="#b08d4f"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="30" y1="41.5" x2="30" y2="52" stroke="#8c2f43" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="24.5" y1="47" x2="35.5" y2="47" stroke="#8c2f43" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (game === 'truth') {
    return (
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <path
          d="M30 8 C24 4 16 8 16 15 C16 21 24 26 30 33 C36 26 44 21 44 15 C44 8 36 4 30 8 Z"
          fill="#8c2f43"
        />
        <rect x="28.5" y="30" width="3" height="22" rx="1.5" fill="#b08d4f" />
        <path d="M30 52 l-6 -6 v4 l6 6 z M30 52 l6 -6 v4 l-6 6 z" fill="#b08d4f" />
      </svg>
    );
  }

  if (game === 'dice') {
    return (
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <rect x="14" y="14" width="32" height="32" rx="7" fill="none" stroke="#8c2f43" strokeWidth="1.6" />
        <path
          d="M30 23 C28 20 22.5 21 22.5 25.5 C22.5 29 27 31 30 34.5 C33 31 37.5 29 37.5 25.5 C37.5 21 32 20 30 23 Z"
          fill="#cf6a80"
        />
        <circle cx="20.5" cy="20.5" r="1.9" fill="#b08d4f" />
        <circle cx="39.5" cy="39.5" r="1.9" fill="#b08d4f" />
      </svg>
    );
  }

  if (game === 'rather') {
    return (
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <path d="M30 50 L30 36 C30 28 22 27 18 21" fill="none" stroke="#8c2f43" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M18 21 L18 27 M18 21 L24 21"
          fill="none"
          stroke="#8c2f43"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M30 36 C30 28 38 27 42 21" fill="none" stroke="#b08d4f" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M42 21 L42 27 M42 21 L36 21"
          fill="none"
          stroke="#b08d4f"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M15 15 L45 15 L31 33 L31 48 L38 48 L38 51 L22 51 L22 48 L29 48 L29 33 Z"
        fill="none"
        stroke="#b08d4f"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M22 22 L38 22 L31 31 Z" fill="#cf6a80" />
      <circle cx="41" cy="17" r="2.4" fill="#cf6a80" />
    </svg>
  );
}
