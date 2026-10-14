---
name: Mario Costabile
description: Personal portfolio set as a ruled technical ledger on paper.
colors:
  paper: "#F2F1EC"
  sheet: "#FBFAF6"
  ink: "#111111"
  graphite: "#5E5E5A"
  hairline: "#D3D0C7"
  ledger-green: "#1E6B4F"
  accent-ink: "#F2F1EC"
  paper-dark: "#121211"
  sheet-dark: "#1C1C1A"
  ink-dark: "#ECEBE6"
  graphite-dark: "#9A9993"
  hairline-dark: "#2E2E2B"
  ledger-green-dark: "#5FBF94"
  accent-ink-dark: "#121211"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.6vw, 4.5rem)"
    fontWeight: 750
    lineHeight: 0.98
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 112"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 112"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 110"
  body-large:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontVariation: "\"wdth\" 100"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.04em"
rounded:
  none: "0px"
  dot: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  inset: "clamp(0px, 2.5vw, 32px)"
  grid-gap: "24px"
  row: "24px"
  section: "clamp(48px, 6vw, 88px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "12px 18px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 18px"
  button-hover:
    backgroundColor: "{colors.ledger-green}"
    textColor: "{colors.accent-ink}"
  button-compact:
    rounded: "{rounded.none}"
    padding: "8px 12px"
  tag-status:
    textColor: "{colors.ledger-green}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  lang-toggle-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "5px 10px"
  profile-sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.none}"
    padding: "14px 14px 6px"
  project-row:
    rounded: "{rounded.none}"
    padding: "24px 12px"
---

# Design System: Mario Costabile

## Overview

**Creative North Star: "The Ruled Ledger"**

The site reads as one printed sheet of technical paper. A single warm paper ground carries everything; structure comes from lines, never from coloured bands or boxed cards. Two fixed hairlines frame the content column like page margins, full-bleed rules cross that frame so it reads as a grid, and each section is laid out as a ledger entry: heading column, vertical hairline, content.

Density is calm and editorial. Archivo, pushed wide through its `wdth` axis, carries every word; JetBrains Mono appears only where the content is data (table headers, row numbers, languages, dates, field labels). Colour is almost absent: ink on paper, plus one ink-green that marks state and nothing else. The only object that lifts off the page is the profile sheet, a lighter slip of paper with a soft shadow.

The world exists in light and dark, following the system preference, with every token swapped as a pair. A faint paper grain sits over everything and never intercepts input.

**Key Characteristics:**
- One paper ground; no section backgrounds, no cards.
- Structure from 1px hairlines, 3px ink bars and a closing double rule.
- Wide Archivo for all text; mono strictly for data.
- One accent (ledger green) reserved for state, focus and the sync dot.
- Square corners everywhere; circles only for small status dots.
- A single lifted object: the profile sheet.

## Colors

Ink on warm paper, with one restrained green that only ever signals state.

### Primary
- **Ledger Green** (light / dark pair `ledger-green`, `ledger-green-dark`): hover fill on buttons, link hover, the project-row hover tint (7% mix), the drawn arrow on hover, the "In corso" status tag, focus outlines, text selection, caret, and the pulsing sync dot. Never a background for a section or a decorative fill.
- **Accent Ink** (`accent-ink`, `accent-ink-dark`): text set on a Ledger Green fill (hovered buttons, selection).

### Neutral
- **Paper** (`paper`, `paper-dark`): the single page ground and the inverted text on ink buttons.
- **Sheet** (`sheet`, `sheet-dark`): the lighter paper of the profile sheet only.
- **Ink** (`ink`, `ink-dark`): all primary text, primary button fill, 3px heading bars, the table's top rule, the hero rule under the name, the closing double rule.
- **Graphite** (`graphite`, `graphite-dark`): secondary text, nav links, data columns, descriptions, footer.
- **Hairline** (`hairline`, `hairline-dark`): page-frame lines, section dividers, row dividers, sheet field rules.

Language dots in the projects table take GitHub's own linguist colour per repository (fallback Graphite). They are data, not palette, and stay at dot size.

### Named Rules
**The State-Only Green Rule.** Ledger Green appears only in response to state (hover, focus, selection, "in progress", live sync). At rest, a screen is ink and paper.

**The Paired Token Rule.** Every colour exists as a light/dark pair under `prefers-color-scheme`; a new colour without its dark twin is not part of the system.

## Typography

**Display Font:** Archivo variable (with system-ui, sans-serif), weight 100-900, width 62-125
**Body Font:** Archivo (same family; width 100)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace), 400 and 500

**Character:** One grotesque stretched wide for authority in headings and held at normal width for reading; a mono that reads as the ledger's tabular columns.

### Hierarchy
- **Display** (750, clamp(2.5rem, 5.6vw, 4.5rem), 0.98, wdth 112): the two-line name in the hero, each line rising in from a clipped mask.
- **Headline** (700, clamp(1.375rem, 2.2vw, 1.875rem), 1.1, wdth 112): section headings, each preceded by a 28px x 3px ink bar.
- **Title** (700, clamp(1.25rem, 2vw, 1.75rem), 1.15, wdth 110): project names in the table. Smaller titles (education degrees, role line) use 600 at 1.25rem.
- **Body Large** (400, clamp(1.25rem, 2vw, 1.625rem), 1.45): the about statement, held to 36ch; contact intro at a slightly smaller clamp, 30ch.
- **Body** (400, 1.0625rem, 1.6): running text; lead line at 1.125rem, 44ch; project descriptions capped at 68ch.
- **Label** (mono 400-500, 0.6875-0.875rem, uppercase with 0.04-0.06em tracking for column and field headers, tabular numerals for numbers and dates): data only.

### Named Rules
**The Mono Is Data Rule.** JetBrains Mono is used only for values a ledger would tabulate: column headers, row numbers, languages, dates, topics, sheet field labels, the sync line. Never for headings, prose or buttons.

**The Wide Heading Rule.** Headings widen through the `wdth` axis (110-112) and tighten tracking (-0.02 to -0.03em); body stays at width 100.

## Layout

A centred column (max 1240px) bounded by two fixed hairlines at the gutter (clamp(16px, 4vw, 48px)); content sits a further inset (clamp(0px, 2.5vw, 32px)) inside the frame. Horizontal rules run full-bleed across it.

The page uses a 12-column grid with 24px gaps. Hero: text on columns 1-7, profile sheet on 9-12, vertically centred. Ledger sections: heading on columns 1-3 (sticky under the 64px header), a 1px vertical hairline, content on 4-12. Section vertical rhythm is clamp(48px, 6vw, 88px). The projects section breaks the ledger into a full-width table with columns `3rem | 1fr | 10.5rem | 9rem | 2rem` (number, repository, language, updated, arrow).

The header is sticky, 64px, on paper at 90% with a 10px blur and a bottom hairline.

At 860px and below: the frame lines and inset disappear, the grid collapses to one column, the sheet caps at 320px, section headings lose their sticky position and vertical rule, skills stack, and the table reduces to `2rem | 1fr | 1.5rem` with language and date stacked under the title. The section nav is hidden on small screens; brand and language toggle remain.

## Elevation & Depth

Flat by default. Depth is carried by line weight (1px hairline, 1px ink, 3px ink, 4px double) rather than shadow. Exactly one object is lifted: the profile sheet.

### Shadow Vocabulary
- **Sheet lift** (light `box-shadow: 0 1px 2px rgb(17 17 17 / .06), 0 12px 32px -8px rgb(17 17 17 / .16)`; dark `0 1px 2px rgb(0 0 0 / .4), 0 16px 40px -10px rgb(0 0 0 / .6)`): the profile sheet only.

The sync dot's expanding ring is an animated `box-shadow` pulse, a motion signal, not elevation.

### Named Rules
**The One Lifted Sheet Rule.** Only the profile sheet casts a shadow. Everything else lies on the page and is separated by rules.

**The Line Weight Ladder Rule.** Hierarchy of separation is 1px hairline (rows, sections) < 1px ink (emphasis, the hero rule, table header bottom) < 3px ink (heading bars, table top) < 4px double ink (closes the document before contact).

## Shapes

Rectangular throughout: buttons, toggle, tags, sheet, table rows and focus outlines have square corners (0px). The only round forms are small status dots (language dots at 0.6em, the 8px sync dot). Borders are 1px; underlines are 1px with a 0.22em offset, and the email link carries a 2px bottom border. Icons are inline 24px-grid SVG strokes at 1.75 with square caps, sized to 1em.

## Components

### Buttons
Rectangular, outlined, typeset like labels on a form.
- **Shape:** square corners (0px), 1px ink border.
- **Primary:** ink fill, paper text, Archivo 600 at 0.9375rem, 12px x 18px padding, 10px gap to a trailing stroke icon.
- **Secondary:** transparent on paper, ink text and border, same metrics.
- **Hover / Focus:** any button fills with Ledger Green, border to green, text to accent-ink, over 0.25s on the house ease (cubic-bezier(0.16, 1, 0.3, 1)); active nudges down 1px; focus is a 2px green outline at 3px offset.
- **Compact:** 8px x 12px at 0.8125rem (the copy-email button).

### Chips
- **Status tag:** mono 500 at 0.75rem, Ledger Green text with a 1px border in the same colour, 2px x 8px, square. Used for "In corso".

### Cards / Containers
- **Profile sheet:** the one container. Sheet colour, sheet lift shadow, 14px padding (6px bottom), square avatar (1:1), then a two-column field list: mono uppercase Graphite labels left, Archivo 500 values right, each row ruled with a hairline. Settles in on load from 24px below with a 1.5deg rotation.
- No other cards exist; content is held by rules, not boxes.

### Navigation
- Brand name in Archivo 700 at left; section links in Graphite at 0.9375rem, 28px apart, no underline at rest, green with underline on hover.
- **Language toggle:** two segments inside a 1px ink box, Archivo 600 0.8125rem; the pressed segment inverts to ink fill and paper text.

### Projects Table (signature)
The ledger itself. A 3px ink top rule and 1px ink bottom rule frame a mono uppercase header row (0.6875rem, 0.06em tracking, Graphite). Each row: tabular row number, project title (Title type) with description and mono topics beneath, language with its dot, updated date, and a stroke arrow. The whole row is the link. On hover or focus-within: a 7% Ledger Green tint, a 2px underline drawing under the title over 0.45s, and the arrow shifting 4px up-right and turning green. Keyboard focus outlines the whole row in green inset by 2px. Rows are separated by hairlines, 24px x 12px padding.

### Sync Indicator (signature)
A mono 0.8125rem Graphite line with an 8px Ledger Green dot emitting a 10px fading ring every 2.4s. It is the only perpetual motion on the page.

## Do's and Don'ts

### Do:
- **Do** separate content with rules from the line weight ladder (1px hairline, 1px ink, 3px ink, 4px double) instead of backgrounds or boxes.
- **Do** keep a screen ink and paper at rest; bring in Ledger Green only for hover, focus, selection, in-progress status and live sync.
- **Do** set every heading in Archivo widened (wdth 110-112) with negative tracking, and lead section headings with the 28px x 3px ink bar.
- **Do** use JetBrains Mono for tabular data only, with tabular numerals for numbers and dates.
- **Do** keep corners square on every rectangle; reserve circles for status dots.
- **Do** define every new colour as a light/dark pair.
- **Do** use the house ease (cubic-bezier(0.16, 1, 0.3, 1)) for transitions and entrances, and honour reduced motion by removing all animation and transition.

### Don't:
- **Don't** add section background bands, cards or tinted panels; the page has one ground.
- **Don't** add shadows to anything except the profile sheet.
- **Don't** introduce a second accent hue; the only non-palette colours are GitHub language dots at dot size.
- **Don't** round button, tag or container corners.
- **Don't** set prose, headings or buttons in mono.
