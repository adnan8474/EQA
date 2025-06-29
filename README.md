# EQA Comparison Tool

This project provides a lightweight, browser-based tool for Point-of-Care Testing professionals to compare device results prior to official EQA reports.

The application is built with React, Vite and Tailwind CSS. It parses CSV and XLSX files, displays the data in a table, and allows filtering by test name. A basic per-device analysis can be run in the browser.

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

1. Upload a `.csv` or `.xlsx` file in the format:

   ```
   Device ID,Test Name,Result,Date,Sample ID,Operator ID
   ABL90-01,Glucose,5.6,2025-06-01,SMP001,USR001
   ```
2. Select a test from the dropdown and click **Run Analysis**.
3. See console output for calculated mean, SD, and CV for each device.

This is a simplified proof of concept. More features such as charts, PDF/Excel export, and advanced statistics can be added.
