# TCG Trading Post

A single-page web app for turning a collection spreadsheet into a tiered
buy offer. Import a CSV or Excel export, set your buy-percentage tiers by
price band, and get a running offer total plus a searchable, sortable line
list.

## Running it

No build step or server required — just open `index.html` in a browser.
(If your browser blocks local file scripts, serve the folder instead, e.g.
`python3 -m http.server` from this directory and visit
`http://localhost:8000`.)

## Importing data

Click **Import file** (or drag a file onto the page, or paste CSV text
under "Paste CSV text instead"). Supported inputs:

- `.csv` / `.tsv` / `.txt` — comma, semicolon, or tab delimited
- `.xlsx` / `.xls` — the first sheet is used

The importer is intentionally permissive: **only three things are
required** to bring a spreadsheet in —

1. A **product/card name** column (`Product Name`, `Name`, `Card Name`, `Title`, …)
2. A **price** column (`Price`, `Market Price`, `TCG Market Price`, `Price Override`,
   `Average Cost Paid`, …)
3. A **quantity** column (`Quantity`, `Total Quantity`, `Qty`, …) — if none is
   found, every line is defaulted to a quantity of 1 and the app tells you so.

Anything else in the sheet — set, rarity, card number, condition, grade,
printing/variant, notes, date added, watchlist, portfolio name, photo URL,
TCGplayer/product IDs, etc. — is optional. Recognized columns (based on
real Collectr and TCGplayer exports) get mapped to labeled fields in the
item detail view; any column the app doesn't specifically recognize is
still kept and shown under "Additional info" for that line, so nothing
from the source file is silently dropped.

A short warning banner appears after import if anything had to be
defaulted or guessed (e.g. "No quantity column found — every line was
defaulted to qty 1").

## Offer tiers

Open **Offer tiers** to edit the price bands used to compute your offer:
each tier's buy % applies to any line whose unit price is at or above that
tier's start price, up to the next tier. The summary panel shows totals by
band as well as overall market value, your offer, and the blended
percentage.

## Files

- `index.html` — markup + styles
- `app.js` — import engine, tier math, and rendering/UI logic
- `vendor/xlsx.core.min.js` — [SheetJS](https://sheetjs.com) (Apache-2.0), vendored for
  offline `.xlsx`/`.xls` parsing — see `vendor/xlsx-LICENSE.txt`
