# EQA Comparison Tool

This project provides a lightweight, browser-based tool for Point-of-Care Testing professionals to compare device results prior to official EQA reports.

The application is built with React, Vite and Tailwind CSS. It parses CSV and XLSX files, displays the data in a table, and allows filtering by test name. A basic per-device analysis can be run in the browser with the results shown in a summary table.

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

The build output in `dist/` can be deployed directly to Netlify or any static host.
If using Netlify, make sure the Node version is at least 18. A sample
`netlify.toml` is included:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

## Usage

Visit the home page to download a sample template and read basic instructions.

1. Download `template.csv` and fill it with your results.
2. Go to the **Analysis** page and upload the completed file (`.csv` or `.xlsx`).
3. Select a test from the dropdown and click **Run Analysis**.
4. The calculated mean, SD and CV for each device will appear in a results table below the data.

This is a simplified proof of concept. More features such as charts, PDF/Excel export, and advanced statistics can be added.
