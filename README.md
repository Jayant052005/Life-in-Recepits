# 🧾 Your Life, In Receipts

> **Transform your digital footprint into a visual, interactive, and gamified narrative story.**

*Crafted with passion for the Digital Life Hackathon · 2026*

---

## ✨ Overview

**Life in Receipts** is a pure frontend, zero-dependency static web application that turns a curated dataset of personal digital life moments — music, movies, places, purchases, photos, messages, searches, events, and personal notes — into a rich, immersive storytelling experience.

Instead of data tables and spreadsheets, your memories become **story chapters**, **relationship graphs**, **persona insights**, **achievement quests**, and a **filterable receipt explorer** — all rendered beautifully in a glassmorphic dark UI.

---

## 🖼️ Features at a Glance

| View | Description |
|------|-------------|
| 📖 **Story Chapters** | Chronological narrative journey through life chapters with an auto-play narrative player |
| 🕸️ **Web of Life** | Interactive 2D/3D canvas relationship graph connecting receipts by date, city, companion, or mood |
| 🧠 **Persona Insights** | AI-style digital persona card with Chart.js analytics — categories, moods, cities, spending |
| 🏆 **Story Quests** | Gamified detective mode — complete hidden challenges, unlock badges with confetti celebrations |
| 🗺️ **Receipts Explorer** | Full-text search, multi-filter grid + live Leaflet.js geo map of moments by city |

---

## 🗂️ Project Structure

```
Life-in-Recepits/
├── index.html              # Single-page app shell with all 5 views
├── css/
│   └── styles.css          # Glassmorphic dark theme + all component styles
├── js/
│   ├── data.js             # Generated RECEIPTS_DATA (311 moments as JS array)
│   ├── app.js              # Main orchestrator — routing, search, modals, city chips
│   └── components/
│       ├── story.js        # Story Chapters — chapters, timeline, auto-play
│       ├── graph.js        # Web of Life — canvas 2D/3D graph engine
│       ├── persona.js      # Persona Insights — Chart.js charts & persona card
│       ├── quests.js       # Story Quests — quest definitions, progress, badges
│       └── explorer.js     # Receipts Explorer — filters, grid, Leaflet map
├── Dataset/
│   ├── 01_Music.xlsx
│   ├── 02_Movies_Entertainment.xlsx
│   ├── 03_Places.xlsx
│   ├── 04_Purchases.xlsx
│   ├── 05_Photos.xlsx
│   ├── 06_Messages.xlsx
│   ├── 07_Searches.xlsx
│   ├── 08_Events.xlsx
│   ├── 09_Personal_Notes.xlsx
│   └── README.xlsx         # Dataset documentation
├── dataset.json            # Raw JSON export of all receipts
├── package.json
└── vercel.json             # Static deployment config for Vercel
```

---

## 🚀 Getting Started

### Option 1 — Open Directly (No Build Step)

This is a pure static app. Just open `index.html` in your browser:

```bash
# Clone the repository
git clone <your-repo-url>
cd Life-in-Recepits

# Open in browser (Windows)
start index.html

# Open in browser (macOS/Linux)
open index.html
```

### Option 2 — Local Dev Server (Recommended)

Use any static file server to avoid CORS quirks with local file paths:

```bash
# Using Node.js (npx)
npx serve .

# Using Python 3
python -m http.server 8080

# Using VS Code
# Install the "Live Server" extension and click "Go Live"
```

Then visit `http://localhost:8080` (or whichever port your server uses).

---

## ☁️ Deployment

The project is pre-configured for **Vercel** deployment with [`vercel.json`](vercel.json):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

**Vercel config highlights:**
- No build command required (pure static)
- Output directory: `.` (root)
- Clean URLs enabled
- Cache-Control headers set to `must-revalidate`

---

## 📊 The Dataset

The app visualizes **311 digital life moments** spanning **Jan 13 – May 13, 2026** across **5 Indian cities** in **9 categories**:

| # | Category | Example |
|---|----------|---------|
| 1 | 🎵 Music | Midnight City · M83 · Mumbai · calm |
| 2 | 🎬 Movies & Entertainment | Movie screenings, OTT watches |
| 3 | 📍 Places | Cafés, parks, restaurants visited |
| 4 | 🛍️ Purchases | Spending receipts (INR) |
| 5 | 📸 Photos | Photo memory moments |
| 6 | 💬 Messages | Key message exchanges |
| 7 | 🔍 Searches | Digital search intent trail |
| 8 | 🎉 Events | Concerts, meetups, celebrations |
| 9 | 📝 Personal Notes | Journal entries & reflections |

**Cities:** Mumbai · Bengaluru · Pune · Jamshedpur · Delhi  
**Key Companions:** Maya · Aarav · Rohan · Priya · Neha  
**Mood Tags:** hopeful · happy · curious · focused · nostalgic · calm

Each receipt object includes: `id`, `category`, `date`, `time`, `title`, `detail`, `city`, `mood`, `companions[]`, `tags[]`, `connectedIds[]`, and a `raw` payload from the original Excel row.

---

## 🛠️ Tech Stack

| Technology | Role |
|------------|------|
| **HTML5 / CSS3 / Vanilla JS** | Core app — no framework |
| **Chart.js** (CDN) | Persona analytics charts (donut, bar, radar) |
| **Leaflet.js** (CDN) | Interactive geo map in Receipts Explorer |
| **Lucide Icons** (CDN) | Icon set throughout the UI |
| **Canvas Confetti** (CDN) | Quest badge celebration animations |
| **Google Fonts** | Outfit · Space Grotesk · JetBrains Mono |

> No npm build step. No bundler. No framework. Pure browser-native code.

---

## 🎮 Key Interactions

| Shortcut / Action | Behaviour |
|-------------------|-----------|
| Press `/` | Focus global search bar from anywhere |
| Type in search | Auto-switches to Explorer tab + filters results live |
| Click a city chip | Filters Explorer to that city instantly |
| Click a graph node | Opens side panel with receipt details & connections |
| Toggle **3D Galaxy Orbit** | Switches graph between 2D force-layout and 3D orbit mode |
| Click **Add Receipt** | Opens modal to add a custom memory to your timeline |
| Complete a Quest | Triggers confetti + unlocks badge |
| Auto Narrative Player | Play/pause/skip through story chapters automatically |

---

## 🧩 Adding Your Own Data

To personalize the app with your own life receipts:

1. **Edit [`js/data.js`](js/data.js)** — Replace or extend the `RECEIPTS_DATA` array with your own receipt objects following the existing schema.
2. **Update [`index.html`](index.html)** — Change the user name (`Alex`), city chips, date range, and companion names in the hero banner.
3. **Adjust persona text** — Edit the persona card copy in the `view-persona` section of `index.html` to reflect your persona.
4. **Update filter options** — Add/remove cities, moods, and companions in the Explorer and Graph filter `<select>` dropdowns.

**Receipt schema:**
```json
{
  "id": "MUS001",
  "category": "Music",
  "categoryKey": "01_Music",
  "icon": "music",
  "color": "#c4bca8",
  "date": "2026-01-13",
  "time": "00:00",
  "title": "Midnight City",
  "detail": "M83",
  "city": "Mumbai",
  "mood": "calm",
  "companions": [],
  "tags": ["night", "travel"],
  "connectedIds": ["MUS022", "MUS043"],
  "raw": { }
}
```

---

## 📄 License

This project was built for the **Digital Life Hackathon 2026**. Feel free to fork, adapt, and make it your own story.

---

<div align="center">
  <sub>Made with ♥ · Your Life, In Receipts · 2026</sub>
</div>
