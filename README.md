# sudoninja — personal security portfolio

A responsive, static portfolio for Sanjay Singh, using content from https://sudoninja-noob.github.io/ and the public profile at https://github.com/sudoninja-noob. No framework, installation, API keys, or build step required.

## Host on GitHub Pages

1. Create or open your `sudoninja-noob.github.io` repository on GitHub. Back up any existing site before replacing files. Preserve existing files such as `cve-findings.html` and project directories; this package updates the homepage and does not include those existing pages.
2. Upload `index.html`, `styles.css`, `script.js`, `favicon.svg`, and `.nojekyll`, plus the `assets` folder, to the root of the repository.
3. In **Settings → Pages**, choose **Deploy from a branch**, select your branch (usually `main`) and **/ (root)**, then save.
4. Once GitHub finishes publishing, visit https://sudoninja-noob.github.io/.

The same files also work in a project repository; all local asset paths are relative.

## Preview locally

Run `python3 -m http.server 8000` in this folder and open http://localhost:8000.

## Customize

- Edit biography, certifications, research links, and projects in `index.html`.
- Change colors and layout in `styles.css`.
- `script.js` automatically updates the copyright year.
- Google Fonts provides DM Sans and Space Grotesk; system fallback fonts work when offline.

Biography, CVE highlights, Exploit-DB entries, six books, the original six tools, services, indicative pricing, articles, and public contact details were imported from your existing website. Experience uses the live site’s 10+ years figure. The full CVE index and tools remain linked to their existing hosted URLs. Review these details before publishing. There are no invented contact details, forms, tracking scripts, or live GitHub API dependencies.

## Motion

Staggered hero entrances, one-time scroll reveals, card hover effects, and a brief terminal cursor animation respect the system reduced-motion preference. Content remains available without JavaScript.

The Matrix code rain background uses lightweight Canvas rendering with a pause/play control. It starts paused for reduced-motion users and stops rendering while the tab is hidden.

## Cursor mask

`assets/mask-cursor.png` was generated with the built-in image tool. Brief: a front-facing V for Vendetta / Guy Fawkes mask, ivory face, black features, pale lime rim light, transparent background, legible as a small cursor decoration. The mask follows a desktop mouse, does not intercept clicks, and is hidden on touch devices and with reduced motion enabled.

Desktop cursors use a lime crosshair and a lime pointer for links and buttons. SVG cursor assets are bundled in `assets`; native fallbacks remain available.

Click non-interactive page content to emit “राम”; hold the left mouse button to emit more. Moving over text or scrolling does not interrupt a hold. Release, press Escape, or switch away from the window to stop. Links, buttons, and form controls never start the effect. Words fade away and never intercept clicks.

The राम effect plays `assets/ram-chant.mp3`, a 30-second, 128 kbps excerpt of the supplied MP3. Hold empty space to play and loop; release pauses immediately, and the next hold resumes. Sound on/off mutes the chant. No YouTube player or network dependency is used, and no audio plays on page load. The original audio file is unchanged.

The supplied Hanuman images are bundled in `assets`. On desktop, mouse movement sends Hanuman flying across the viewport; after the pointer rests, he returns to sit above the mask. The effect pauses when hidden and respects reduced motion.

A golden chakra rotates behind Hanuman’s head in both poses and follows his facing direction. Reduced-motion settings disable the rotation.

While the राम effect is held, the Matrix background changes to saffron राम rain. Releasing or cancelling the effect restores green code rain. The background pause setting remains respected.

## Simple mode and featured work

Simple mode switches off the rain, cursor companions, text particles, sound, and decorative motion together. The preference is saved locally. Switching it off restores the individual sound/background settings; audio still requires a new hold. The hero includes a desktop chanting hint and direct Email/LinkedIn links.

Three featured projects include screenshots captured from their public live sites. All six publications include their original Amazon cover images, bundled locally. See `assets/SOURCES.md` for source links.

On phones and tablets, touch and hold non-interactive content to chant. Release or swipe to stop; native page scrolling stays available. Reduced-motion users can explicitly tap Play background to animate the rain. Simple mode disables touch effects too.

## Story mode

The hero's Story mode button opens a separate, replayable Ramayana scene titled “Jatayu’s courage.” The portfolio no longer has a continuously looping battle over its content. Detailed transparent artwork shows Jatayu confronting Ravana, with Sita seated in the chariot, a symbolic wing injury, and a saffron राम call.

Visitors choose Play to begin the 24-second scene, with five synchronized captions, Pause/Resume, Replay, and Previous/Next scene controls. It does not autoplay or add automatic sound. Close or Escape returns to the portfolio; hiding the tab pauses playback. Simple mode and reduced-motion preferences provide static illustrations and manual caption navigation instead of animation.

## Additional tools

The Tools section also includes BountyRadar, sbomx, TouchGrass, Breathe, Bonsai, Kakashi Recon, Region Capture, Auto Clicker, and Keep-TeamsOnline. Descriptions were checked against their public GitHub READMEs on 2026-10-27. Project-site links and repository links use distinct labels. All three featured projects and the original three additional tools are preserved.

## Interactive terminal

The homepage terminal supports `whoami`, `projects`, `books`, `contact`, `help`, and `clear`. Enter submits commands; shortcut buttons support touch. Arrow keys recall up to 50 commands and Escape clears the input. Output is bounded to 20 entries. Project/book/contact links come from the page content, so additions stay in sync. Commands are an allowlist and user input is rendered as text, never executed as code. The terminal remains functional in Simple mode and excludes the chanting gesture.

## Find the vulnerability

The Challenge navigation link opens a fictional Express invoice-route puzzle. Visitors choose among three answers, receive tailored feedback, and reveal the IDOR explanation and ownership-scoped fix. Native details keep the explanation accessible without JavaScript. Try again resets the selection, feedback, and reveal state. The code is displayed only; it is never executed. The puzzle is excluded from the hold-to-chant gesture.

## Research timeline and demos

The timeline links selected publication milestones from July 2020 to June 2025 and an October 2026 portfolio snapshot. The 2020 dates were verified against CVEProject cvelistV5 records; later Exploit-DB dates use the existing portfolio entries. It does not claim these are the researcher’s first-ever disclosures or invent release dates for books.

SudoShark has a user-opened YouTube privacy-enhanced embed limited to the first 45 seconds, with a full-video fallback link. It does not autoplay; collapsing the preview removes the player. Resource Matrix and APK Auditor use live-tool links, as requested, until video clips are supplied.

## Custom tool development

The engagement section offers Essential builds from $200 USD, Professional builds from $300 USD, and custom quotes for larger work. Each card opens an email enquiry with its own subject. Final pricing and delivery depend on agreed scope. Existing security assessment pricing remains separate.

## Sample deliverable

An expandable fictional security report excerpt sits between Services and Pricing. It illustrates scope, impact, evidence, remediation, and retest acceptance checks using invented data. It is explicitly labeled as an example, not client work. The native details controls work without JavaScript.

## Engagement FAQ

Four expandable questions below tool development pricing cover source-code ownership, revisions, payment milestones, and maintenance. Specific terms are agreed in the proposal before work starts.

## Project process

A four-step custom development process appears above the FAQ: share requirements, agree scope and quote, build and review, and handover. An email link invites visitors to share their requirements.
