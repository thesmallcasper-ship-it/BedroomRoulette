import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Check,
  Copy,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Share2,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import './styles.css';

type LegalPanel = 'terms' | 'privacy' | 'safety' | 'faq' | null;
type Mode = 'manual' | 'auto';

type PositionCard = {
  id: number;
  image: string;
};

type GuidePageData = {
  path: string;
  label: string;
  eyebrow: string;
  title: string;
  intro: string;
  rules: string[];
  cards: string[];
};

const AUTO_REVEAL_MS = 180000;
const ADULT_CONFIRMED_KEY = 'rsp-adult-confirmed';
const BRAND_NAME = 'Random Sex Positions';
const SHARE_URL = 'https://magicsexball.com/';
const WHATSAPP_SHARE_URL =
  'https://wa.me/?text=Try%20this%20private%2C%20consent-first%20couples%20game%20with%20me%3A%20https%3A%2F%2Fmagicsexball.com%2F';

const positionCards: PositionCard[] = [
  {
    id: 1,
    image: '/positions/SP1_round_framed.webp',
  },
  {
    id: 2,
    image: '/positions/SP2_round_framed.webp',
  },
  {
    id: 3,
    image: '/positions/SP3_round_framed.webp',
  },
  {
    id: 4,
    image: '/positions/SP4_round_framed.webp',
  },
  {
    id: 5,
    image: '/positions/SP5_round_framed.webp',
  },
  {
    id: 6,
    image: '/positions/SP6_round_framed.webp',
  },
  {
    id: 7,
    image: '/positions/SP7_round_framed.webp',
  },
  {
    id: 8,
    image: '/positions/SP8_round_framed.webp',
  },
  {
    id: 9,
    image: '/positions/SP9_round_framed.webp',
  },
];

const revealSounds = [
  '/voice/n/1.mp3',
  '/voice/n/2.mp3',
  '/voice/n/3mp3.mp3',
  '/voice/n/4.mp3',
  '/voice/n/5.mp3',
  '/voice/n/6.mp3',
  '/voice/n/7.mp3',
  '/voice/n/8.mp3',
];

function combineCardParts(firstParts: string[], secondParts: string[]) {
  return firstParts.flatMap((first) => secondParts.map((second) => `${first} ${second}`));
}

const longDistanceCards = combineCardParts(
  [
    'Send a voice note',
    'Text a three-line fantasy',
    'Choose a song and describe the scene',
    'Start a countdown message',
    'Write a private invitation',
    'Send one teasing question',
    'Plan the first ten minutes',
    'Describe the lighting and mood',
    'Give your partner three choices',
    'Leave a goodnight prompt',
  ],
  [
    'for the first kiss when you meet again.',
    'about the outfit, scent, or detail you hope they notice.',
    'that begins gentle and ends with one bold request.',
    'using only what you would say in their ear.',
    'for a video-call date with no pressure to show anything.',
    'that turns into a reunion rule you both approve.',
    'about the slowest way to close the distance.',
    'that asks for one boundary and one curiosity.',
    'for a private message they can open tomorrow.',
    'that ends with “your turn” and lets them choose the next mood.',
  ],
);

const truthCards = combineCardParts(
  [
    'Truth: Tell your partner',
    'Truth: Admit',
    'Truth: Describe',
    'Truth: Pick',
    'Truth: Confess',
    'Truth: Explain',
    'Truth: Name',
    'Truth: Share',
    'Truth: Finish the sentence',
    'Truth: Rate from soft to bold',
  ],
  [
    'one small move that instantly changes your mood.',
    'the most tempting thing they do without realizing it.',
    'a private scene you want to try slowly.',
    'one place you like being touched and one place to avoid.',
    'which kind of teasing makes you impatient.',
    'what “take your time” means to you tonight.',
    'one compliment you want to hear more often.',
    'a fantasy that should stay playful, safe, and mutual.',
    '“I lose focus when you...”',
    'how much control you want your partner to take for one round.',
  ],
);

const dareCards = combineCardParts(
  [
    'Dare: Whisper',
    'Dare: Choose the next song and',
    'Dare: Move closer and',
    'Dare: Set a one-minute timer and',
    'Dare: Pick a spot in the room and',
    'Dare: Give your partner control of',
    'Dare: Use only your hands to',
    'Dare: Pause the game and',
    'Dare: Trade places and',
    'Dare: Make one rule for the next card and',
  ],
  [
    'give one clear instruction they can accept, adjust, or pass.',
    'change the pace without saying what comes next.',
    'hold eye contact until one of you laughs or gives in.',
    'build anticipation without rushing the reveal.',
    'create a quick private scene together.',
    'the light, music, or distance between you.',
    'show where you want attention, keeping clothes and boundaries respected.',
    'give one slow kiss or one slow compliment.',
    'let the quieter partner lead the next move.',
    'make sure both of you agree before it starts.',
  ],
);

const truthOrDareCards = [...truthCards, ...dareCards];

const tonightChallengeCards = combineCardParts(
  [
    'No-rush challenge:',
    'Control swap:',
    'Three clues:',
    'Lights low:',
    'One rule:',
    'Blind choice:',
    'Slow replay:',
    'Permission game:',
    'After-dark timer:',
    'Aftercare finish:',
  ],
  [
    'spend ten minutes building tension before the next reveal.',
    'let one partner choose the pace, then switch after one card.',
    'give three hints about what you want and let your partner guess.',
    'change only the lighting and music, then repeat the last card.',
    'choose one playful rule that lasts until the next reveal.',
    'offer soft, teasing, or bold and let your partner pick without seeing the card.',
    'repeat one move from tonight, slower and with more attention.',
    'ask “yes, no, or slower?” before each new step.',
    'set five minutes for flirting only, then reveal again.',
    'end with one compliment, one favorite moment, and one future request.',
  ],
);

const guidePages: GuidePageData[] = [
  {
    path: '/long-distance-couples-cards/',
    label: 'Long-distance cards',
    eyebrow: 'Remote play',
    title: 'Long-distance cards',
    intro:
      'A flirty card set for couples who are apart. Play by text, voice note, or video call without needing photos or accounts.',
    rules: [
      'Pick one card each round.',
      'Answer honestly, pass freely, and keep anything private off-camera if either person prefers.',
      'Save one card as a reunion idea.',
    ],
    cards: longDistanceCards,
  },
  {
    path: '/truth-or-dare-for-couples/',
    label: 'Truth or dare',
    eyebrow: 'Naughty party game',
    title: 'Truth or dare for couples',
    intro:
      'A mischievous adult version of the classic bottle game: one truth, one dare, or one pass. Keep it playful, private, and mutual.',
    rules: [
      'Spin, choose Truth or Dare, then read one card out loud.',
      'Anyone can pass without explaining.',
      'No recording, no pressure, no surprise public dares.',
    ],
    cards: truthOrDareCards,
  },
  {
    path: '/tonights-challenge/',
    label: "Tonight's challenge",
    eyebrow: 'One-night prompt',
    title: "Tonight's challenge",
    intro:
      'A quick challenge mode for couples who want one focused idea for the evening instead of endless scrolling.',
    rules: [
      'Pick one challenge before the first reveal.',
      'Agree on the mood: soft, playful, or bold.',
      'Stop or switch cards the second it stops feeling fun.',
    ],
    cards: tonightChallengeCards,
  },
];

const guideLinks = guidePages.map(({ path, label }) => [path, label] as const);

function pickNextPositionCard(current?: PositionCard) {
  if (positionCards.length === 1) {
    return positionCards[0];
  }

  let card = positionCards[Math.floor(Math.random() * positionCards.length)];
  while (current && card.id === current.id) {
    card = positionCards[Math.floor(Math.random() * positionCards.length)];
  }
  return card;
}

function pickRandomSoundFile() {
  return revealSounds[Math.floor(Math.random() * revealSounds.length)];
}

function pickNextGuideIndex(cardCount: number, currentIndex: number) {
  if (cardCount <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * cardCount);
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * cardCount);
  }
  return nextIndex;
}

function stopSound(audio: HTMLAudioElement | null) {
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
}

function App() {
  const [adultConfirmed, setAdultConfirmed] = useState(
    () =>
      new URLSearchParams(window.location.search).get('adult') === '1' ||
      window.localStorage.getItem(ADULT_CONFIRMED_KEY) === '1',
  );
  const [mode, setMode] = useState<Mode>('manual');
  const [legalPanel, setLegalPanel] = useState<LegalPanel>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [card, setCard] = useState(() => positionCards[0]);
  const [revealCount, setRevealCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentGuidePage = guidePages.find((page) => page.path === window.location.pathname);

  const modeHint = useMemo(
    () =>
      mode === 'manual'
        ? 'Tap the ball to reveal a random sex position idea.'
        : 'Auto mode changes the position every 3 minutes.',
    [mode],
  );

  const playRandomRevealSound = useCallback(() => {
    if (!soundEnabled || revealSounds.length === 0) {
      return;
    }

    stopSound(audioRef.current);
    const audio = new Audio(pickRandomSoundFile());
    audio.volume = 0.42;
    audio.loop = false;
    audio.preload = 'auto';
    audioRef.current = audio;
    audio.play().catch(() => undefined);
  }, [soundEnabled]);

  const reveal = useCallback(() => {
    setCard((current) => pickNextPositionCard(current));
    setRevealCount((count) => count + 1);
    playRandomRevealSound();
  }, [playRandomRevealSound]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((enabled) => {
      const next = !enabled;
      if (!next) {
        stopSound(audioRef.current);
      }
      return next;
    });
  }, []);

  const confirmAdult = useCallback(() => {
    window.localStorage.setItem(ADULT_CONFIRMED_KEY, '1');
    setAdultConfirmed(true);
  }, []);

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setShareStatus('copied');
      setShareOpen(false);
      window.setTimeout(() => setShareStatus('idle'), 2600);
    } catch {
      setShareStatus('idle');
    }
  }, []);

  useEffect(() => () => stopSound(audioRef.current), []);

  useEffect(() => {
    if (mode !== 'auto') {
      return undefined;
    }

    const timer = window.setInterval(reveal, AUTO_REVEAL_MS);
    return () => window.clearInterval(timer);
  }, [mode, reveal]);

  if (legalPanel) {
    return (
      <main className="page legal-page">
        <section className="legal-panel" aria-labelledby="legal-title">
          <button className="back-button" onClick={() => setLegalPanel(null)}>
            Back
          </button>
          {legalPanel === 'terms' && <Terms />}
          {legalPanel === 'privacy' && <Privacy />}
          {legalPanel === 'safety' && <Safety />}
          {legalPanel === 'faq' && <Faq />}
        </section>
      </main>
    );
  }

  if (!adultConfirmed) {
    return (
      <main className="page age-page">
        <div className="age-content">
          <section className="age-gate" aria-labelledby="age-title">
            <div className="mini-ball" aria-hidden="true">
              69
            </div>
            <p className="eyebrow">Adults only</p>
            <h1 id="age-title">{BRAND_NAME}</h1>
            <h2>A private adult position generator for couples</h2>
            <p>
              Tap the position ball to reveal random sex position ideas for consenting partners.
              Continue only if you are 18 or older and adult content is legal where you live.
            </p>
            <div className="age-actions">
              <button className="primary-button" onClick={confirmAdult}>
                <ShieldCheck size={18} />
                I confirm I am 18+
              </button>
              <a className="secondary-button" href="https://www.google.com/">
                Exit
              </a>
            </div>
          </section>
          <SiteFooter onOpen={setLegalPanel} />
        </div>
      </main>
    );
  }

  if (currentGuidePage) {
    return (
      <main className="page legal-page">
        <section className="legal-panel guide-panel" aria-labelledby="guide-title">
          <a className="back-button" href="/?adult=1">
            Back
          </a>
          <GuidePage page={currentGuidePage} />
          <SiteFooter onOpen={setLegalPanel} />
        </section>
      </main>
    );
  }

  return (
    <main className="page app-page">
      <section className="shell" aria-label={BRAND_NAME}>
        <section className="ball-zone">
          <button
            key={revealCount}
            className={revealCount > 0 ? 'magic-ball is-revealing' : 'magic-ball'}
            onClick={reveal}
            aria-label="Reveal a random position"
          >
            <span className="ball-glow" />
            <span className="ball-window">
              <img
                src={card.image}
                alt="Stylized adult position illustration"
                width="768"
                height="768"
                decoding="async"
                fetchPriority="high"
              />
            </span>
          </button>

          <div className="mode-control" aria-label="Mode selection">
            <button className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>
              <RefreshCw size={17} />
              Manual
            </button>
            <button className={mode === 'auto' ? 'active' : ''} onClick={() => setMode('auto')}>
              {mode === 'auto' ? <Pause size={17} /> : <Play size={17} />}
              Auto
            </button>
          </div>

          <div className="utility-actions">
            <button
              className={soundEnabled ? 'sound-toggle active' : 'sound-toggle'}
              onClick={toggleSound}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              {soundEnabled ? 'Sound on' : 'Sound off'}
            </button>
            <button
              className="share-button"
              onClick={() => setShareOpen((open) => !open)}
              aria-expanded={shareOpen}
              aria-controls="share-menu"
            >
              {shareStatus === 'idle' ? <Share2 size={17} /> : <Check size={17} />}
              {shareStatus === 'copied' ? 'Link copied' : 'Share game'}
            </button>
          </div>

          {shareOpen && (
            <div className="share-menu" id="share-menu">
              <button onClick={copyShareLink}>
                <Copy size={17} />
                Copy link
              </button>
              <a
                href={WHATSAPP_SHARE_URL}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} />
                WhatsApp
              </a>
            </div>
          )}

          <span className="sr-only" aria-live="polite">
            {shareStatus === 'copied' ? 'Game link copied' : ''}
          </span>
          <p className="mode-hint">{modeHint}</p>
          <SiteFooter onOpen={setLegalPanel} />
        </section>
      </section>
    </main>
  );
}

function SiteFooter({ onOpen }: { onOpen: (panel: LegalPanel) => void }) {
  return (
    <footer className="site-footer">
      <p className="guide-directory-title">Play more couples games</p>
      <nav className="guide-directory" aria-label="More couples games">
        {guideLinks.map(([href, label]) => (
          <a className="guide-link" href={href} key={href}>
            {label}
          </a>
        ))}
      </nav>
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

function GuidePage({ page }: { page: GuidePageData }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [revealCount, setRevealCount] = useState(0);
  const card = page.cards[cardIndex];

  const revealCard = useCallback(() => {
    setCardIndex((currentIndex) => pickNextGuideIndex(page.cards.length, currentIndex));
    setRevealCount((count) => count + 1);
  }, [page.cards.length]);

  return (
    <>
      <p className="eyebrow">{page.eyebrow}</p>
      <h1 id="guide-title">{page.title}</h1>
      <p>{page.intro}</p>

      <section className="guide-section" aria-label="How to play">
        <h2>How to play</h2>
        <ul className="legal-list">
          {page.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="guide-game" aria-label={`${page.title} random card`}>
        <button
          key={revealCount}
          className={revealCount > 0 ? 'prompt-card is-revealing' : 'prompt-card'}
          onClick={revealCard}
        >
          <span>
            {String(cardIndex + 1).padStart(2, '0')} / {page.cards.length}
          </span>
          <p>{card}</p>
        </button>
        <button className="primary-button guide-reveal-button" onClick={revealCard}>
          <RefreshCw size={17} />
          Reveal card
        </button>
      </section>
    </>
  );
}

function Faq() {
  return (
    <>
      <p className="eyebrow">{BRAND_NAME}</p>
      <h1 id="legal-title">FAQ</h1>
      <article className="faq-item">
        <h2>What is {BRAND_NAME}?</h2>
        <p>
          {BRAND_NAME} is a private 18+ couples game that reveals random adult position
          ideas with one tap.
        </p>
      </article>
      <article className="faq-item">
        <h2>Do I need an account?</h2>
        <p>No. The MVP runs in your browser without account creation.</p>
      </article>
      <article className="faq-item">
        <h2>Is it private?</h2>
        <p>
          The app does not ask for names, photos, contacts, payment details, or sexual history.
        </p>
      </article>
      <article className="faq-item">
        <h2>Who can use it?</h2>
        <p>Only adults who are 18 or older and legally allowed to view adult content where they live.</p>
      </article>
    </>
  );
}

function Terms() {
  return (
    <>
      <p className="eyebrow">{BRAND_NAME}</p>
      <h1 id="legal-title">Terms</h1>
      <p>
        This app is an adult-only entertainment experience for consenting adults who are 18 or
        older. Do not use it if you are under 18, if adult sexual content is not legal where you
        live, or if every participant has not clearly consented.
      </p>
      <p>
        Age confirmation is self-declared. By continuing past the age gate, you confirm that you
        are legally allowed to view adult content in your location.
      </p>
      <p>
        The prompts are playful suggestions, not medical, relationship, safety, or professional
        advice. You are responsible for communication, consent, comfort, privacy, and stopping
        immediately when anyone wants to stop.
      </p>
      <p>
        Prohibited use includes illegal activity, coercion, harassment, non-consensual sexual
        content, content involving minors or age-ambiguous people, impersonation, public exposure
        without consent, recording or sharing without consent, or any use that violates another
        person's rights.
      </p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <p className="eyebrow">{BRAND_NAME}</p>
      <h1 id="legal-title">Privacy</h1>
      <p>
        This app is designed to run without account creation. It does not ask for your name, email
        address, photos, contacts, payment details, or sexual history.
      </p>
      <p>
        The age gate, sound setting, and reveal controls are handled in your browser. The current
        MVP does not intentionally collect personal profile data or sell user data.
      </p>
      <p>
        The hosting provider may process standard technical logs such as IP address, browser type,
        requested pages, timestamps, and security events.
      </p>
    </>
  );
}

function Safety() {
  return (
    <>
      <p className="eyebrow">{BRAND_NAME}</p>
      <h1 id="legal-title">Safety</h1>
      <p>
        This app is for adults only. Every suggestion depends on clear consent, comfort, privacy,
        and the ability for anyone involved to stop immediately.
      </p>
      <ul className="legal-list">
        <li>Use only with adult partners who clearly consent.</li>
        <li>Talk about boundaries before trying a prompt.</li>
        <li>Pass, pause, or stop whenever anyone is unsure.</li>
        <li>Do not record, share, expose, or identify anyone without consent.</li>
        <li>Do not use the app for coercion, harassment, minors, or illegal activity.</li>
      </ul>
      <p>
        The app does not verify identity, relationship status, local law, health needs, or physical
        safety. Treat each random suggestion as playful entertainment, not permission.
      </p>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
