import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">EQA Comparison Tool</h1>
      <p>
        This application lets Point-of-Care Testing professionals compare device
        results before official EQA reports are available.
      </p>
      <a href="/template.csv" download className="text-blue-600 underline">
        Download template CSV
      </a>
      <div>
        <h2 className="text-xl font-semibold mt-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Download and fill in the template CSV with your device results.</li>
          <li>
            Navigate to the <Link to="/app" className="text-blue-600 underline">Analysis page</Link> and upload
            the completed file.
          </li>
          <li>Select a test from the dropdown and run the analysis.</li>
        </ol>
      </div>
    </div>
  )
}
