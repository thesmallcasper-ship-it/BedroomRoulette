import { Fragment } from 'react';

type LegalPanel = 'terms' | 'privacy' | 'safety' | 'faq' | null;
type GameLinkKey = 'home' | 'bedroom' | 'truth' | 'dice' | 'rather' | 'never';

const gameLinks: Array<{ href: string; key: GameLinkKey; label: string }> = [
  { href: '/?adult=1', key: 'home', label: 'Home' },
  { href: '/bedroom-roulette/?adult=1', key: 'bedroom', label: 'Bedroom Roulette' },
  { href: '/truth-or-dare-for-couples/?adult=1', key: 'truth', label: 'Truth or Dare' },
  { href: '/dice-game-for-couples/?adult=1', key: 'dice', label: 'Dice Game' },
  { href: '/would-you-rather-couples/?adult=1', key: 'rather', label: 'Would You Rather' },
  { href: '/never-have-i-ever/?adult=1', key: 'never', label: 'Never Have I Ever' },
];

const gameDockLabels: Record<GameLinkKey, string> = {
  home: 'Home',
  bedroom: 'Bedroom Roulette',
  truth: 'Truth or Dare',
  dice: 'Dice Game',
  rather: 'Would You Rather',
  never: 'Never Have I Ever',
};

export function SiteFooter({
  onOpen,
  showGameNav = true,
}: {
  onOpen: (panel: LegalPanel) => void;
  showGameNav?: boolean;
}) {
  return (
    <footer className="site-footer">
      {showGameNav && (
        <>
          <p className="guide-directory-title">Play more couples games</p>
          <GameNav current="bedroom" />
        </>
      )}
      <nav className="legal-links" aria-label="Legal links">
        <button onClick={() => onOpen('terms')}>Terms</button>
        <span aria-hidden="true">/</span>
        <button onClick={() => onOpen('privacy')}>Privacy</button>
        <span aria-hidden="true">/</span>
        <button onClick={() => onOpen('safety')}>Safety</button>
        <span aria-hidden="true">/</span>
        <button onClick={() => onOpen('faq')}>FAQ</button>
      </nav>
    </footer>
  );
}

export function GameNav({ current }: { current: GameLinkKey }) {
  return (
    <nav className="game-nav" aria-label="Game modes">
      {gameLinks.map((link, index) => (
        <Fragment key={link.key}>
          {index > 0 && <span className="game-nav-sep" aria-hidden="true" />}
          <a
            className={link.key === current ? 'game-nav-link active' : 'game-nav-link'}
            href={link.href}
            aria-current={link.key === current ? 'page' : undefined}
          >
            <GameNavIcon game={link.key} />
            <span className="game-nav-label">{gameDockLabels[link.key]}</span>
            <span className="game-nav-dot" aria-hidden="true" />
          </a>
        </Fragment>
      ))}
    </nav>
  );
}

function GameNavIcon({ game }: { game: GameLinkKey }) {
  if (game === 'home') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 9.5 10 3l7 6.5" />
        <path d="M5 8.5V17h10V8.5" />
        <path d="M8 17v-5h4v5" />
      </svg>
    );
  }

  if (game === 'bedroom') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M13.5 10.3a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
        <path d="m12.5 7.9 3.2-3.2" />
        <path d="M15.7 6.7v-2h-2" />
        <path d="M10 13.8v3.5" />
        <path d="M8.2 15.7h3.6" />
      </svg>
    );
  }

  if (game === 'truth') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 2v13M10 2 7 6M10 2l3 4M10 15l-2.5 3M10 15l2.5 3" />
      </svg>
    );
  }

  if (game === 'dice') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="3" y="3" width="14" height="14" rx="3" />
        <circle cx="7" cy="7" r="1.3" />
        <circle cx="13" cy="13" r="1.3" />
        <circle cx="10" cy="10" r="1.3" />
      </svg>
    );
  }

  if (game === 'rather') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 5h10M5 10h10M5 15h10" />
        <path d="m12 3 3 2-3 2M8 8l-3 2 3 2M12 13l3 2-3 2" />
      </svg>
    );
  }

  if (game === 'never') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9 2h2v3c0 1 1 1.5 1 3v9c0 1-.5 1.5-2 1.5S8 18 8 17V8c0-1.5 1-2 1-3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 17s-6-3.8-6-8.1C4 6.6 5.5 5 7.5 5c1.2 0 2 .6 2.5 1.4C10.5 5.6 11.3 5 12.5 5c2 0 3.5 1.6 3.5 3.9C16 13.2 10 17 10 17Z" />
    </svg>
  );
}
