import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Check,
  Copy,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  RotateCw,
  Share2,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import './styles.css';

type LegalPanel = 'terms' | 'privacy' | 'safety' | 'faq' | null;
type Mode = 'manual' | 'auto';
type TruthDareKind = 'truth' | 'dare';
type GameLinkKey = 'bedroom' | 'truth' | 'dice';
type DiceTone = 'normal' | 'playful';
type DiceAction = {
  label: string;
  tone: DiceTone;
};
type DiceRoll = {
  action: string;
  target: string;
  rule: string;
  tone: DiceTone;
};
type DiceStep = 'action' | 'target' | 'rule' | null;
type DiceKey = Exclude<DiceStep, null>;
type DiceSpinConfig = {
  duration: number;
  keyframes: Keyframe[];
};
type DiceSpin = Record<DiceKey, DiceSpinConfig>;
type ScreenWakeLockSentinel = EventTarget & {
  released: boolean;
  release: () => Promise<void>;
};
type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<ScreenWakeLockSentinel>;
  };
};
type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

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
  theme: 'distance' | 'truth' | 'challenge';
  objectLabel: string;
  spinLabel: string;
  spinCta: string;
  stats: string[];
  rules: string[];
  cards: string[];
};

const AUTO_REVEAL_MS = 180000;
const ADULT_CONFIRMED_KEY = 'rsp-adult-confirmed';
const BRAND_NAME = 'Bedroom Roulette';
const SHARE_URL = 'https://magicsexball.com/';
const WHATSAPP_SHARE_URL =
  'https://wa.me/?text=Try%20this%20private%2C%20consent-first%20couples%20game%20with%20me%3A%20https%3A%2F%2Fmagicsexball.com%2F';

let screenWakeLock: ScreenWakeLockSentinel | null = null;

async function requestScreenWakeLock() {
  const wakeLock = (navigator as WakeLockNavigator).wakeLock;
  if (!wakeLock || document.visibilityState !== 'visible') {
    return;
  }

  if (screenWakeLock && !screenWakeLock.released) {
    return;
  }

  try {
    const lock = await wakeLock.request('screen');
    screenWakeLock = lock;
    lock.addEventListener('release', () => {
      if (screenWakeLock === lock) {
        screenWakeLock = null;
      }
    });
  } catch {
    screenWakeLock = null;
  }
}

function releaseScreenWakeLock() {
  if (!screenWakeLock || screenWakeLock.released) {
    screenWakeLock = null;
    return;
  }

  void screenWakeLock.release();
  screenWakeLock = null;
}

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

const truthOrDareQuestions: Record<TruthDareKind, string[]> = {
  truth: [
    'What small detail about your partner caught your attention first?',
    'What compliment from your partner would you like to hear more often?',
    'What is one thing your partner does that instantly changes your mood?',
    'What kind of flirting works on you fastest: sweet, playful, or direct?',
    'What is a romantic moment you still think about?',
    'What is one harmless habit you find unexpectedly attractive?',
    'When do you feel most confident around your partner?',
    'What is one thing you were nervous to say on an early date?',
    'What song would describe the mood you want tonight?',
    'What is one small gesture that makes you feel wanted?',
    'What is the boldest first move you have ever made?',
    'What is one question you secretly hope your partner asks you?',
    'What makes eye contact feel exciting instead of awkward?',
    'What is your most obvious sign that you are interested?',
    'What kind of date makes you forget to check your phone?',
    'What is one thing your partner wears, says, or does that you notice every time?',
    'What is a kiss, almost-kiss, or close moment you remember clearly?',
    'What is one romantic ritual you would happily repeat?',
    'What is something attractive about yourself that you rarely admit?',
    'What should your partner do when they want your full attention?',
  ],
  dare: [
    'Hold eye contact with the person across from you for 20 seconds, then give one sincere compliment.',
    'Tell the person beside you one thing they do that makes you smile.',
    'Let your partner choose a song, then give them your best dramatic movie-scene look.',
    'Whisper one charming invitation to the person across from you.',
    'Use only facial expressions to tell your partner, “I am into this.”',
    'Ask your partner to describe you in three words, then accept the answer without explaining yourself.',
    'Give your partner a one-sentence pickup line like you just met tonight.',
    'Offer your hand to the person beside you and start a tiny 15-second dance.',
    'Answer your next question in a whisper.',
    'Tell your partner three things you noticed about them tonight.',
    'Make a playful 15-second love declaration to the person across from you.',
    'Hum a short part of a love song and let your partner guess it.',
    'Let your partner decide whether your next round is Truth or Dare.',
    'Give your partner your best “across the room” look.',
    'Ask the person beside you to give you a nickname for one round.',
    'Start a sentence with “What makes me curious about you is...” and finish it honestly.',
    'Close your eyes while your partner says your name; guess the emotion they were trying to use.',
    'Until the next card, answer with only one word at a time.',
    'Give the person across from you a gentle, no-pressure challenge for the next round.',
    'Let your partner choose whether you speak softer, sit closer, or reveal one extra truth.',
  ],
};

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
    theme: 'distance',
    objectLabel: 'Signal dial',
    spinLabel: 'Spin the signal',
    spinCta: 'Send a prompt',
    stats: ['Text', 'Voice', 'Video'],
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
    theme: 'truth',
    objectLabel: 'Velvet spinner',
    spinLabel: 'Spin the toy',
    spinCta: 'Draw truth or dare',
    stats: ['Truth', 'Dare', 'Pass'],
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
    theme: 'challenge',
    objectLabel: 'After-dark timer',
    spinLabel: 'Turn the timer',
    spinCta: 'Reveal tonight',
    stats: ['Soft', 'Playful', 'Bold'],
    rules: [
      'Pick one challenge before the first reveal.',
      'Agree on the mood: soft, playful, or bold.',
      'Stop or switch cards the second it stops feeling fun.',
    ],
    cards: tonightChallengeCards,
  },
];

const gameLinks: Array<{ href: string; key: GameLinkKey; label: string }> = [
  { href: '/?adult=1', key: 'bedroom', label: 'Bedroom Roulette' },
  { href: '/truth-or-dare-for-couples/', key: 'truth', label: 'Truth or Dare' },
  { href: '/dice-game-for-couples/', key: 'dice', label: 'Dice Game' },
];

const normalDiceActions: DiceAction[] = [
  { label: 'Kiss', tone: 'normal' },
  { label: 'Whisper', tone: 'normal' },
  { label: 'Touch', tone: 'normal' },
  { label: 'Massage', tone: 'normal' },
  { label: 'Tease', tone: 'normal' },
  { label: 'Hold', tone: 'normal' },
  { label: 'Trace', tone: 'normal' },
  { label: 'Caress', tone: 'normal' },
  { label: 'Pull closer', tone: 'normal' },
  { label: 'Breathe close', tone: 'normal' },
  { label: 'Nibble', tone: 'normal' },
  { label: 'Stroke', tone: 'normal' },
  { label: 'Press close', tone: 'normal' },
];

const playfulDiceActions: DiceAction[] = [
  { label: 'Inspect', tone: 'playful' },
  { label: 'Overpraise', tone: 'playful' },
  { label: 'Flirt badly', tone: 'playful' },
  { label: 'Pose', tone: 'playful' },
  { label: 'Narrate', tone: 'playful' },
  { label: 'Boop', tone: 'playful' },
  { label: 'Act jealous', tone: 'playful' },
  { label: 'Ask like a detective', tone: 'playful' },
];

const normalDiceTargets = [
  'Lips',
  'Neck',
  'Ear',
  'Hair',
  'Hands',
  'Back',
  'Waist',
  'Thigh',
  'Chest',
  'Shoulder',
  'Inner wrist',
  'Lower back',
  'Face',
  'Collarbone',
  'Jawline',
  'Stomach',
  'Hips',
  'Fingers',
  'Palm',
  "Partner's choice",
];

const normalDiceRules = [
  '10 seconds',
  '30 seconds',
  '1 minute',
  '2 minutes',
  'Very slowly',
  'Only whispers',
  'No talking',
  'With eyes closed',
  'One hand only',
  'Ask permission first',
  'Partner chooses pace',
  'Switch halfway',
];

const playfulDiceTargets = [
  'Nose',
  'Smile',
  'Outfit',
  'Ego',
  'Voice',
  'Hands',
  "Partner's choice",
  'Favorite body part',
];

const playfulDiceRules = [
  'Dramatically',
  'Until they laugh',
  'Like a movie scene',
  'Like a detective',
  'Like a luxury product',
  'With full confidence',
  'As seriously as possible',
  "Like it's forbidden",
];

const normalTargetFilters: Record<string, string[]> = {
  Kiss: [
    'Lips',
    'Neck',
    'Hair',
    'Hands',
    'Back',
    'Thigh',
    'Chest',
    'Inner wrist',
    'Face',
    'Collarbone',
    'Jawline',
    'Shoulder',
    'Stomach',
    "Partner's choice",
  ],
  Whisper: ['Ear', 'Neck', 'Hands', 'Back', 'Waist', 'Face', 'Lips', 'Hair'],
  Touch: [
    'Lips',
    'Neck',
    'Hair',
    'Hands',
    'Back',
    'Waist',
    'Thigh',
    'Shoulder',
    'Inner wrist',
    'Lower back',
    'Face',
    'Collarbone',
    'Jawline',
    'Stomach',
    'Hips',
    'Fingers',
    'Palm',
    "Partner's choice",
  ],
  Massage: ['Lips', 'Neck', 'Ear', 'Hands', 'Back', 'Waist', 'Shoulder', 'Lower back', 'Stomach', 'Hips', 'Palm', 'Chest'],
  Tease: [
    'Lips',
    'Neck',
    'Ear',
    'Hands',
    'Waist',
    'Thigh',
    'Inner wrist',
    'Lower back',
    'Face',
    'Collarbone',
    'Jawline',
    'Stomach',
    'Hips',
    "Partner's choice",
  ],
  Hold: ['Ear', 'Neck', 'Hands', 'Back', 'Waist', 'Thigh', 'Chest', 'Face', 'Collarbone', 'Hips', 'Palm', "Partner's choice"],
  Trace: [
    'Neck',
    'Hands',
    'Back',
    'Waist',
    'Thigh',
    'Chest',
    'Shoulder',
    'Inner wrist',
    'Lower back',
    'Face',
    'Collarbone',
    'Jawline',
    'Stomach',
    'Hips',
    'Fingers',
    'Palm',
    "Partner's choice",
  ],
  Caress: [
    'Hair',
    'Hands',
    'Back',
    'Waist',
    'Thigh',
    'Shoulder',
    'Inner wrist',
    'Lower back',
    'Face',
    'Collarbone',
    'Jawline',
    'Hips',
    'Fingers',
    'Palm',
    "Partner's choice",
  ],
  'Pull closer': ['Waist', 'Hands', 'Back', 'Hips', 'Neck', "Partner's choice"],
  'Breathe close': ['Ear', 'Neck', 'Lips', 'Face', 'Jawline', 'Collarbone'],
  Nibble: ['Lips', 'Neck', 'Ear', 'Shoulder', 'Collarbone', 'Jawline'],
  Stroke: ['Hair', 'Hands', 'Back', 'Waist', 'Thigh', 'Shoulder', 'Lower back', 'Face', 'Hips', 'Palm', 'Fingers'],
  'Press close': ['Lips', 'Chest', 'Back', 'Waist', 'Hips', "Partner's choice"],
};

const normalRuleFilters: Record<string, string[]> = {
  Kiss: [
    '10 seconds',
    '30 seconds',
    '1 minute',
    'Very slowly',
    'No talking',
    'With eyes closed',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
  Whisper: ['10 seconds', '30 seconds', 'With eyes closed', 'Ask permission first', 'Switch halfway'],
  Touch: [
    '10 seconds',
    '30 seconds',
    '1 minute',
    'Very slowly',
    'No talking',
    'With eyes closed',
    'One hand only',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
  Massage: [
    '30 seconds',
    '1 minute',
    '2 minutes',
    'Very slowly',
    'No talking',
    'With eyes closed',
    'One hand only',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
  Tease: [
    '10 seconds',
    '30 seconds',
    '1 minute',
    'Very slowly',
    'Only whispers',
    'No talking',
    'With eyes closed',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
  Hold: ['10 seconds', '30 seconds', '1 minute', 'Very slowly', 'No talking', 'With eyes closed', 'Ask permission first'],
  Trace: [
    '10 seconds',
    '30 seconds',
    '1 minute',
    'Very slowly',
    'No talking',
    'With eyes closed',
    'One hand only',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
  Caress: [
    '10 seconds',
    '30 seconds',
    '1 minute',
    'Very slowly',
    'No talking',
    'With eyes closed',
    'One hand only',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
  'Pull closer': ['10 seconds', '30 seconds', 'Very slowly', 'No talking', 'Ask permission first', 'Partner chooses pace'],
  'Breathe close': [
    '10 seconds',
    '30 seconds',
    'Very slowly',
    'Only whispers',
    'No talking',
    'With eyes closed',
    'Ask permission first',
  ],
  Nibble: ['10 seconds', '30 seconds', 'Very slowly', 'No talking', 'With eyes closed', 'Ask permission first'],
  Stroke: [
    '10 seconds',
    '30 seconds',
    '1 minute',
    'Very slowly',
    'No talking',
    'With eyes closed',
    'One hand only',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
  'Press close': [
    '10 seconds',
    '30 seconds',
    '1 minute',
    'Very slowly',
    'No talking',
    'With eyes closed',
    'Ask permission first',
    'Partner chooses pace',
    'Switch halfway',
  ],
};

const playfulTargetFilters: Record<string, string[]> = {
  Boop: ['Nose', 'Smile', "Partner's choice"],
  Inspect: ['Hands', 'Outfit', 'Smile', 'Favorite body part', "Partner's choice"],
  Overpraise: ['Ego', 'Outfit', 'Voice', 'Smile', 'Favorite body part', "Partner's choice"],
  'Flirt badly': ['Smile', 'Voice', 'Outfit', "Partner's choice"],
  Pose: ['Outfit', 'Ego', 'Favorite body part', "Partner's choice"],
  Narrate: ['Voice', 'Outfit', 'Smile', "Partner's choice"],
  'Act jealous': ['Outfit', 'Smile', 'Ego', "Partner's choice"],
  'Ask like a detective': ['Smile', 'Voice', "Partner's choice"],
};

const blockedNormalRules: Record<string, string[]> = {
  Whisper: ['No talking'],
  Touch: ['No hands'],
  Massage: ['No hands'],
  Hold: ['No hands'],
  Trace: ['No hands'],
  Caress: ['No hands'],
  'Pull closer': ['No hands'],
  Stroke: ['No hands'],
  'Press close': ['No hands'],
};

const paceRuleActions = ['Kiss', 'Touch', 'Massage', 'Tease', 'Trace', 'Caress', 'Stroke', 'Press close'];

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

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function pickDiceAction() {
  return Math.random() < 0.3 ? pickRandom(playfulDiceActions) : pickRandom(normalDiceActions);
}

function pickDiceTarget(action: DiceAction) {
  if (action.tone === 'playful') {
    return pickRandom(playfulTargetFilters[action.label] ?? playfulDiceTargets);
  }

  return pickRandom(normalTargetFilters[action.label] ?? normalDiceTargets);
}

function pickDiceRule(action: DiceAction) {
  const rules = action.tone === 'playful' ? playfulDiceRules : (normalRuleFilters[action.label] ?? normalDiceRules);

  if (action.tone === 'playful') {
    return pickRandom(rules);
  }

  const blockedRules = blockedNormalRules[action.label] ?? [];
  let availableRules = rules.filter((rule) => !blockedRules.includes(rule));

  if (!paceRuleActions.includes(action.label)) {
    availableRules = availableRules.filter((rule) => rule !== 'Partner chooses pace');
  }

  return pickRandom(availableRules.length > 0 ? availableRules : rules);
}

function rollDiceGame(): DiceRoll {
  const action = pickDiceAction();

  return {
    action: action.label,
    target: pickDiceTarget(action),
    rule: pickDiceRule(action),
    tone: action.tone,
  };
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function halveTurns(turns: number) {
  return Math.max(1, Math.round(turns / 2));
}

function createDiceSpinStyle(turns: number): DiceSpinConfig {
  const yTurns = turns + 1;
  const zTurns = Math.max(1, turns - 1);
  const duration = (780 + turns * 52 + randomInt(0, 140)) * 3;
  const finalX = turns * 360 - 18;
  const finalY = yTurns * 360 + 34;
  const finalZ = zTurns * 360;
  const drift = randomInt(-10, 10);
  const offsets = [0, 0.1, 0.23, 0.4, 0.6, 0.78, 0.92, 1];
  const spinProgress = [0, 0.22, 0.43, 0.61, 0.76, 0.88, 0.96, 1];
  const hops = [0, -18, 3, -14, 2, -9, 1, 0];
  const scales = [1, 1.05, 0.99, 1.035, 1, 1.02, 0.995, 1];

  return {
    duration,
    keyframes: offsets.map((offset, index) => {
      const isFirstFrame = index === 0;
      const isLastFrame = index === offsets.length - 1;
      const jitter = isFirstFrame || isLastFrame ? 0 : randomInt(-42, 42);
      const progress = spinProgress[index];
      const x = isFirstFrame ? -18 : Math.round(finalX * progress + jitter);
      const y = isFirstFrame ? 34 : Math.round(finalY * progress + (isLastFrame ? 0 : randomInt(-54, 54)));
      const z = isFirstFrame ? 0 : Math.round(finalZ * progress + (isLastFrame ? 0 : randomInt(-28, 28)));
      const travel = Math.round(Math.sin(offset * Math.PI) * drift);

      return {
        offset,
        transform:
          `translate3d(${travel}px, ${hops[index]}px, 0) ` +
          `rotateX(${x}deg) rotateY(${y}deg) rotateZ(calc(${z}deg + var(--dice-tilt, -2deg))) ` +
          `scale(${scales[index]})`,
      };
    }),
  };
}

function createDiceSpins(): DiceSpin {
  const actionTurns = randomInt(6, 12);
  const targetTurns = halveTurns(actionTurns);
  const ruleTurns = halveTurns(targetTurns);

  return {
    action: createDiceSpinStyle(actionTurns),
    target: createDiceSpinStyle(targetTurns),
    rule: createDiceSpinStyle(ruleTurns),
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function animateDiceBox(element: HTMLSpanElement | null, spin: DiceSpinConfig) {
  if (!element?.animate) {
    await wait(spin.duration);
    return;
  }

  const animation = element.animate(spin.keyframes, {
    duration: spin.duration,
    easing: 'linear',
    fill: 'both',
  });

  try {
    await animation.finished;
  } finally {
    animation.cancel();
  }
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

function playGuideTick() {
  const AudioContextClass = window.AudioContext || (window as WebAudioWindow).webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(340, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.14);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
  window.setTimeout(() => void audioContext.close(), 240);
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
  const currentPath = window.location.pathname;
  const currentGuidePage = guidePages.find((page) => page.path === currentPath);

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
    void requestScreenWakeLock();
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
    void requestScreenWakeLock();
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
    if (!adultConfirmed) {
      releaseScreenWakeLock();
      return undefined;
    }

    void requestScreenWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestScreenWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseScreenWakeLock();
    };
  }, [adultConfirmed]);

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
    if (currentGuidePage.path === '/truth-or-dare-for-couples/') {
      return <TruthOrDarePage />;
    }

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

  if (currentPath === '/dice-game-for-couples/') {
    return <DiceGamePage />;
  }

  if (currentPath === '/dice-face-preview/') {
    return <DiceFacePreviewPage />;
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
      <GameNav current="bedroom" />
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

function GameNav({ current }: { current: GameLinkKey }) {
  return (
    <nav className="game-nav" aria-label="Game modes">
      {gameLinks.map((link) => (
        <a
          className={link.key === current ? 'game-nav-link active' : 'game-nav-link'}
          href={link.href}
          key={link.key}
          aria-current={link.key === current ? 'page' : undefined}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function CupidArrow() {
  return (
    <svg viewBox="0 0 80 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="td-gold-shaft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6d3b" />
          <stop offset="0.5" stopColor="#e3c88e" />
          <stop offset="1" stopColor="#9c7f45" />
        </linearGradient>
        <linearGradient id="td-heart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b23a4a" />
          <stop offset="1" stopColor="#7c2334" />
        </linearGradient>
      </defs>
      <path
        fill="url(#td-heart)"
        d="M 40 52 C 22 38 8 30 8 16 C 8 2 26 -6 40 6 C 54 -6 72 2 72 16 C 72 30 58 38 40 52 Z"
      />
      <path
        d="M 32 8 C 24 3 15 6 14 15"
        stroke="#d98a96"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="37.5" y="48" width="5" height="152" rx="2.5" fill="url(#td-gold-shaft)" />
      <path d="M 38 186 L 22 168 L 22 179 L 38 196 Z" fill="#efe3ca" />
      <path d="M 42 186 L 58 168 L 58 179 L 42 196 Z" fill="#dfc99e" />
      <path d="M 38 172 L 24 156 L 24 165 L 38 181 Z" fill="#dfc99e" />
      <path d="M 42 172 L 56 156 L 56 165 L 42 181 Z" fill="#efe3ca" />
      <rect x="36" y="198" width="8" height="9" rx="2.5" fill="#9c7f45" />
    </svg>
  );
}

function pickTruthDareQuestion(kind: TruthDareKind, lastQuestion: string | null) {
  const questions = truthOrDareQuestions[kind];
  if (questions.length === 1) {
    return questions[0];
  }

  let question = questions[Math.floor(Math.random() * questions.length)];
  while (question === lastQuestion) {
    question = questions[Math.floor(Math.random() * questions.length)];
  }
  return question;
}

function TruthOrDarePage() {
  const dotCount = 16;
  const [angle, setAngle] = useState(0);
  const [duration, setDuration] = useState(4200);
  const [spinning, setSpinning] = useState(false);
  const [selectedDot, setSelectedDot] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [currentKind, setCurrentKind] = useState<TruthDareKind | null>(null);
  const [activeCard, setActiveCard] = useState<{ kind: TruthDareKind; text: string } | null>(null);
  const lastCardsRef = useRef<Record<TruthDareKind, string | null>>({
    truth: null,
    dare: null,
  });
  const finishTimerRef = useRef<number | null>(null);
  const cardTimerRef = useRef<number | null>(null);

  const spin = useCallback(
    (kind: TruthDareKind) => {
      if (spinning) {
        return;
      }

      void requestScreenWakeLock();

      const nextDuration = 3800 + Math.floor(Math.random() * 1400);
      const nextAngle = angle + (5 + Math.random() * 4) * 360 + Math.random() * 360;

      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
      }
      if (cardTimerRef.current) {
        window.clearTimeout(cardTimerRef.current);
      }

      setActiveCard(null);
      setCurrentKind(kind);
      setSelectedDot(null);
      setDuration(nextDuration);
      setSpinning(true);
      setAngle(nextAngle);

      finishTimerRef.current = window.setTimeout(() => {
        const normalizedAngle = ((nextAngle % 360) + 360) % 360;
        const dotIndex = Math.round(normalizedAngle / (360 / dotCount)) % dotCount;
        setSelectedDot(dotIndex);
        setFlashKey((key) => key + 1);
        setSpinning(false);

        cardTimerRef.current = window.setTimeout(() => {
          const text = pickTruthDareQuestion(kind, lastCardsRef.current[kind]);
          lastCardsRef.current = { ...lastCardsRef.current, [kind]: text };
          setActiveCard({ kind, text });
        }, 900);
      }, nextDuration);
    },
    [angle, spinning],
  );

  const closeCard = useCallback(() => {
    setActiveCard(null);
    setCurrentKind(null);
    setSelectedDot(null);
  }, []);

  useEffect(
    () => () => {
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
      }
      if (cardTimerRef.current) {
        window.clearTimeout(cardTimerRef.current);
      }
    },
    [],
  );

  const hint =
    spinning && currentKind
      ? currentKind === 'truth'
        ? 'spinning for truth...'
        : 'spinning for dare...'
      : selectedDot === null
        ? 'choose truth or dare'
        : 'the arrow chose';

  return (
    <main className={['truth-dare-page', spinning ? 'is-spinning' : ''].filter(Boolean).join(' ')}>
      <header className="td-header">
        <h1>
          Truth <em>or</em> Dare
        </h1>
        <div className="td-rule" />
      </header>

      <section className="td-table" aria-label="Truth or Dare spinner">
        <div className="td-ring" />
        <div key={flashKey} className={selectedDot === null ? 'td-flash' : 'td-flash play'} />
        <div className={spinning ? 'td-mode hide' : 'td-mode'}>
          <button className="td-btn truth" onClick={() => spin('truth')}>
            Truth
          </button>
          <button className="td-btn dare" onClick={() => spin('dare')}>
            Dare
          </button>
        </div>
        <div
          className="td-arrow-wrap"
          style={{
            transform: `rotate(${angle}deg)`,
            transitionDuration: `${duration}ms`,
          }}
        >
          <CupidArrow />
        </div>
        {Array.from({ length: dotCount }, (_, index) => (
          <span
            className={selectedDot === index ? 'td-dot lit' : 'td-dot'}
            key={index}
            style={{ '--a': `${(index * 360) / dotCount}deg` } as CSSProperties}
          />
        ))}
      </section>

      <p className={selectedDot === null ? 'td-hint' : 'td-hint wine'}>{hint}</p>

      <GameNav current="truth" />

      <div
        className={activeCard ? 'td-overlay show' : 'td-overlay'}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeCard();
          }
        }}
      >
        <section className="td-card" aria-live="polite" aria-label="Selected Truth or Dare card">
          <div className={activeCard?.kind === 'dare' ? 'td-card-type wine' : 'td-card-type'}>
            {activeCard?.kind === 'dare' ? 'Dare' : 'Truth'}
          </div>
          <div className="td-card-rule" />
          <p className="td-card-text">{activeCard?.text}</p>
          <button className="td-card-close" onClick={closeCard}>
            close &amp; continue
          </button>
        </section>
      </div>
    </main>
  );
}

const decorativeDiceFaces = [
  { face: 'back', symbol: 'cocktail', label: 'Cocktail', image: '/dice-faces/cocktail.svg' },
  { face: 'right', symbol: 'white-wine', label: 'White wine glass', image: '/dice-faces/white-wine.png' },
  { face: 'left', symbol: 'toast', label: 'Clinking wine glasses', image: '/dice-faces/toast.png' },
  { face: 'top', symbol: 'moon', label: 'Crescent moon', image: '/dice-faces/moon.png' },
  { face: 'bottom', symbol: 'heart', label: 'Heart', image: '/dice-faces/heart-dusty-pink.svg' },
] as const;

function DiceGamePage() {
  const [roll, setRoll] = useState<Partial<DiceRoll> | null>(null);
  const [rollingStep, setRollingStep] = useState<DiceStep>(null);
  const diceBoxRefs = useRef<Record<DiceKey, HTMLSpanElement | null>>({ action: null, target: null, rule: null });
  const rollingRef = useRef(false);

  const rollDice = useCallback(() => {
    if (rollingRef.current) {
      return;
    }

    rollingRef.current = true;
    void requestScreenWakeLock();

    const nextRoll = rollDiceGame();
    const nextSpins = createDiceSpins();

    setRoll(null);
    setRollingStep('action');

    void (async () => {
      try {
        await animateDiceBox(diceBoxRefs.current.action, nextSpins.action);
        setRoll({ action: nextRoll.action, tone: nextRoll.tone });
        setRollingStep('target');
        playGuideTick();

        await animateDiceBox(diceBoxRefs.current.target, nextSpins.target);
        setRoll({ action: nextRoll.action, target: nextRoll.target, tone: nextRoll.tone });
        setRollingStep('rule');
        playGuideTick();

        await animateDiceBox(diceBoxRefs.current.rule, nextSpins.rule);
        setRoll(nextRoll);
        playGuideTick();
      } finally {
        setRollingStep(null);
        rollingRef.current = false;
      }
    })();
  }, []);

  const dice = [
    {
      key: 'action' as const,
      label: 'Action',
      value: roll?.action ?? '',
      locked: Boolean(roll?.action),
    },
    {
      key: 'target' as const,
      label: 'Target',
      value: roll?.target ?? '',
      locked: Boolean(roll?.target),
    },
    {
      key: 'rule' as const,
      label: 'Rule',
      value: roll?.rule ?? '',
      locked: Boolean(roll?.rule),
    },
  ];

  const hint = rollingStep
    ? 'dice are spinning...'
    : 'playful game with your partner';

  return (
    <main className={['truth-dare-page dice-page', rollingStep ? 'is-rolling' : ''].filter(Boolean).join(' ')}>
      <header className="td-header dice-header">
        <h1>
          Dice <em>Game</em>
        </h1>
        <div className="td-rule" />
      </header>

      <section className="dice-stage" aria-label="Dice game">
        <div className="dice-shadow" aria-hidden="true" />
        <div className="dice-row">
          {dice.map((die, index) => (
            <div
              className={[
                'dice-cube',
                `dice-${index + 1}`,
                rollingStep === die.key ? 'rolling' : '',
                die.locked ? 'locked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={die.key}
            >
              <span
                className="dice-box"
                aria-hidden="true"
                ref={(node) => {
                  diceBoxRefs.current[die.key] = node;
                }}
              >
                <span className="dice-face dice-face-front">
                  <span className="dice-content">
                    <img className="dice-front-image" src="/dice-faces/heart-arrow-premium.png" alt="" />
                    <strong>{rollingStep === die.key ? '' : die.value}</strong>
                  </span>
                </span>
                {decorativeDiceFaces.map(({ face, symbol, label, image }) => (
                  <span className={`dice-face dice-face-${face}`} key={face} title={label}>
                    <span className={`dice-symbol dice-symbol-${symbol}`}>
                      <img className="dice-symbol-image" src={image} alt="" />
                    </span>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <p className={roll?.tone === 'playful' ? 'td-hint wine' : 'td-hint'}>{hint}</p>

      {roll?.action && roll.target && roll.rule && (
        <p className="dice-result" aria-live="polite">
          {roll.action} + {roll.target} + {roll.rule}
        </p>
      )}

      <button className="td-roll-button" onClick={rollDice}>
        {rollingStep ? 'Rolling' : 'Spicy Roll'}
      </button>

      <p className="dice-rule-text">Rule: roll the dice one by one, then do the action.</p>

      <GameNav current="dice" />
    </main>
  );
}

function DiceFacePreviewPage() {
  return (
    <main className="truth-dare-page dice-page dice-preview-page">
      <header className="td-header dice-header">
        <h1>
          Dice <em>Faces</em>
        </h1>
        <div className="td-rule" />
      </header>

      <section className="dice-face-preview-grid" aria-label="Dice face image preview">
        {decorativeDiceFaces.map(({ image, label, symbol }) => (
          <article className="dice-face-preview-card" key={symbol}>
            <span className="dice-face-preview-tile">
              <img className="dice-symbol-image" src={image} alt={label} />
            </span>
            <strong>{label}</strong>
          </article>
        ))}
      </section>

      <a className="td-roll-button dice-preview-back" href="/dice-game-for-couples/">
        Back to dice
      </a>
    </main>
  );
}

function GuidePage({ page }: { page: GuidePageData }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [revealCount, setRevealCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [spinDegrees, setSpinDegrees] = useState(696);
  const spinTimerRef = useRef<number | null>(null);
  const card = page.cards[cardIndex];

  const revealCard = useCallback(() => {
    if (isSpinning) {
      return;
    }

    const duration = 1150 + Math.floor(Math.random() * 700);
    const randomStop = 900 + Math.floor(Math.random() * 1440);

    if (spinTimerRef.current) {
      window.clearTimeout(spinTimerRef.current);
    }

    setBubbleVisible(false);
    setIsSpinning(true);
    setSpinDegrees(randomStop);
    setRevealCount((count) => count + 1);
    playGuideTick();

    spinTimerRef.current = window.setTimeout(() => {
      setCardIndex((currentIndex) => pickNextGuideIndex(page.cards.length, currentIndex));
      setIsSpinning(false);
      setBubbleVisible(true);
      playGuideTick();
    }, duration);
  }, [isSpinning, page.cards.length]);

  useEffect(
    () => () => {
      if (spinTimerRef.current) {
        window.clearTimeout(spinTimerRef.current);
      }
    },
    [],
  );

  const spinnerStyle = { '--spin-end': `${spinDegrees}deg` } as CSSProperties;

  return (
    <article className={`guide-experience guide-${page.theme}`}>
      <section className="guide-hero" aria-labelledby="guide-title">
        <div className="guide-copy">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 id="guide-title">{page.title}</h1>
          <p>{page.intro}</p>
        </div>

        <section className="guide-spinner-shell" aria-label={page.spinLabel}>
          <button
            key={`spinner-${revealCount}`}
            className={[
              'guide-spinner',
              isSpinning ? 'is-spinning' : '',
              bubbleVisible ? 'has-bubble' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={revealCard}
            style={spinnerStyle}
          >
            <span className="spinner-ring" aria-hidden="true" />
            <span className="spinner-object" aria-hidden="true">
              <span className="spinner-object-shine" />
            </span>
            <span className="spinner-pin" aria-hidden="true" />
            <span className="spinner-label">{page.objectLabel}</span>
            <span className="question-bubble" aria-live="polite">
              <span>
                {String(cardIndex + 1).padStart(2, '0')} / {page.cards.length}
              </span>
              <strong>{card}</strong>
            </span>
          </button>
          <button className="primary-button guide-reveal-button" onClick={revealCard}>
            <RotateCw size={17} />
            {isSpinning ? 'Spinning' : bubbleVisible ? 'Spin again' : page.spinCta}
          </button>
        </section>
      </section>
    </article>
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
