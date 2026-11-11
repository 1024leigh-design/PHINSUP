# Phins Rugby 🐬

A learning site for the Phins: rugby basics for new players, plus the Phins Playbook.
Static HTML, CSS, and JS. No build step. Works on GitHub Pages.

**Rugby is chaos. One heart, one beat.**

## Password (please read)

The whole site sits behind a password screen because it uses player names.

- Change the password in `assets/js/config.js` (the `password:` line). Changing it logs everyone out.
- Players only type it once per device.
- **This is not real security.** It keeps casual visitors out, but anyone who knows how can still read the files on GitHub Pages (and the repo itself, if it's public). Don't put anything truly private on the site: no phone numbers, addresses, medical info, or anything you wouldn't want a stranger to see.

## Put it online (GitHub Pages)

1. In the repo on GitHub, go to **Settings**, then **Pages**.
2. Under **Build and deployment**, pick **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. After a minute or two, the site link shows at the top of that page.

## Preview on your own computer

The pages load their text from the `data` folder, so opening a file by double-clicking it won't work. Instead, in this folder run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Editing text (no layout code needed)

Almost all the words live in the `data` folder. Open a file, change the text between the quotes, save, and push.

| File | What's in it |
| --- | --- |
| `data/positions.json` | Position cards (1 to 15), the forwards banner |
| `data/vocab.json` | Every vocab card, by tab. `"phins": true` adds the 🐬 badge |
| `data/scrum.json` | Callouts for the build-by-number scrum |
| `data/lineout.json` | The example lineout setup and what each number does |
| `data/shape.json` | 1-3-3-1 settings, pod roles, HOT/FLASH rules, and backs spots for "Show backs". Fill `podA` / `podB` with numbers to label the pods |
| `data/penalties.json` | Penalties cheat sheet and golden rules |
| `data/signals.json` | Ref signal pictures for the Penalties page (arm angles, a second pose makes them move) |
| `data/pitch.json` | What each line on The Pitch means |
| `data/calls.json` | Communication calls |
| `data/whatif.json` | What If? Lab scenarios, tags, and mini diagrams |
| `data/playbook.json` | Principles, zones, lineout/scrum/maul calls (lineout `x` = start spot, `to` = end spot), kickoff phases, red zone exit |
| `data/plays.json` | The interactive plays: HOT, FLASH, TANGO, SALSA. Each step lists who moves and where |
| `data/quizzes.json` | Self-check questions for each Section 1 page |
| `data/videos.json` | "Watch this" clip links for each page |

Little formatting tricks inside the text:
- `**words**` shows up **bold**.
- Anything like `[HANNAH TO PROVIDE: ...]` shows as a yellow to-do tag on the page, so you can spot what's left.

Other page text (headings, Learn More panels) is plain HTML in each page file. Edit the words between the tags.

**House rule:** no em dashes anywhere. Use commas, colons, periods, or parentheses.

## Deep links

Every diagram page takes a number to highlight:

- `scrum.html?highlight=3`
- `lineout.html?highlight=2`
- `openplay.html?highlight=6`
- `shape.html?highlight=7`
- `positions.html?n=4` (opens a position card)
- `vocab.html?q=ruck` (search) or `vocab.html?tab=defense`

## Themes

The header toggle switches between **Classic** and **✨ Sparkle**. The choice is remembered on each device. Sparkles turn off automatically for anyone with "reduce motion" turned on.

## Still to do

Search the `data` folder for `HANNAH` to find every placeholder. The big ones:

- Which numbers go in which pod (`podA` / `podB` in `data/shape.json`) and how pods rotate
- The rest of the "no bananas" note (it was cut off in the screenshot)
- Lineout call N is marked "to be confirmed"
- Zone boundaries and what changes in each zone
- Scrum calls
- Kickoff receiving/kicking setups and first phases
- Exiting the red zone
- More What If? scenarios, and where the 8 goes when J plays 8
- Backs cards (9 to 15) and our real backs spots ("Show backs" uses a standard backline for now)
- Video links
- Confirm: hooker brake foot rule, tackle height rule, "Hold!" meaning

Already filled in from the forwards' slides: pod roles (lead, plus, lazy), the sacred channel, HOT and FLASH, lineout calls P, H, I, N, and maul calls (TANGO, SALSA, offense).

**This repo is public.** Use initials for player names (for example "J" or "N!"), except Hannah's.

Before launch:
- Check the official law links still work (USA Rugby Referee Resources, World Rugby Laws of the Game). They couldn't be checked from the build machine.
- Check the ref signal pictures against the official World Rugby signals.
