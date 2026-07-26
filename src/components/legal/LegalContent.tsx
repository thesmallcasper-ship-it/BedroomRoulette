const BRAND_NAME = 'Bedroom Roulette';

export function Faq() {
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

export function Terms() {
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

export function Privacy() {
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

export function Safety() {
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
