# Let's Talk Statistics

Charts of official U.S. government statistics.

Live site: [letstalkstatistics.com](https://letstalkstatistics.com)

## Pages

| Page | What it shows |
| --- | --- |
| Home | Latest saved point for CPI-U 12-month change, total public debt, the unemployment rate, and median household income |
| Prices and inflation | CPI-U, component indexes, and new-house prices |
| Federal budget and debt | Treasury debt, monthly receipts and outlays, interest, and OMB historical tables |
| Economy and wages | Hourly earnings, unemployment, household income, and GDP |
| Crime | No chart until an FBI file is fetched |
| Immigration | Lawful permanent residents (DHS Yearbook Table 1) and CBP nationwide encounters |
| Sources and methodology | Publisher, URL, retrieval date, and SHA-256 for each file |

A chart is omitted when its file cannot be fetched. The reason is stored in `data/todos.json` and shown on the page. Missing values are not filled in.

## Data

```bash
pip install -r scripts/requirements.txt
python -m scripts.fetch
python -m pytest tests/test_data_integrity.py tests/test_copy.py tests/test_chart_images.py
python scripts/render_charts.py
```

`scripts/fetch` saves the downloaded files in `data/raw`, a manifest in `data/manifest.json`, and the site payload in `frontend/data/site.json`. Free-key sources read `FRED_API_KEY`, `DATA_GOV_API_KEY`, or `FBI_API_KEY` from the environment and are skipped when the key is absent.

`tests/test_data_integrity.py` fails if a chart value does not match a row in a saved file or the formula recorded on a derived series.

A GitHub Action runs the fetch on the first day of each month and opens a pull request.

## Site

The public site is a static Next.js export.

```bash
cd frontend
npm ci
npm run build
```

The export is written to `frontend/out` and can be published on Cloudflare Pages. Build command: `npm ci && npm run build`. Output directory: `frontend/out`. Set the root directory to `frontend` if the host asks for one, and then set the output directory to `out`.

Chart pages are `/c/{chart-id}`. Each chart also has a PNG at `/charts/{chart-id}.png`.
