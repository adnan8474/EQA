# EQA Comparison Tool

This project provides a lightweight, browser-based tool for Point-of-Care Testing professionals to compare device results prior to official EQA reports. It parses CSV and XLSX files, displays the data in a table, and allows filtering by test type. Basic statistical analysis is performed in the browser.

## Usage
1. Open `index.html` in a modern browser.
2. Upload a `.csv` or `.xlsx` file in the format:
   
   ```
   Device ID,Test Name,Result,Date,Sample ID,Operator ID
   ABL90-01,Glucose,5.6,2025-06-01,SMP001,USR001
   ```
3. Select a test from the dropdown and click **Run Analysis**.
4. See console output for calculated mean, SD, and CV for each device.

This is a simplified proof of concept following the provided specification. More features such as charts, PDF/Excel export, and advanced statistics can be added.
