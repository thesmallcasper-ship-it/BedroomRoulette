export const SHARE_URL = 'https://bedroomroulette.com';
export const SHARE_INVITE_TEXT = '💋 A little game for the two of us tonight';

export function createShareMessage(text = SHARE_INVITE_TEXT) {
  return `${text}\n→ ${SHARE_URL}`;
}

export function createWhatsappShareUrl(text = SHARE_INVITE_TEXT) {
  return `https://wa.me/?text=${encodeURIComponent(createShareMessage(text))}`;
}

export const WHATSAPP_SHARE_URL = createWhatsappShareUrl(SHARE_INVITE_TEXT);

export async function shareText(title: string, text = SHARE_INVITE_TEXT) {
  const message = createShareMessage(text);

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: message,
        url: SHARE_URL,
      });
      return true;
    } catch {
      return false;
    }
  }

  window.open(createWhatsappShareUrl(text), '_blank', 'noopener,noreferrer');
  return true;
}
