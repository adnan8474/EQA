import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow max-w-xl space-y-4">
        <img src="/logo.png" alt="Logo" className="h-16 mx-auto" />
        <h1 className="text-3xl font-bold text-center">EQA Comparison Tool</h1>
        <p className="text-center">
          Upload your device results to compare performance before official EQA reports are released.
        </p>
        <div className="text-center">
          <a href="/template.csv" download className="text-blue-600 underline">
            Download template CSV
          </a>
        </div>
        <div>
          <h2 className="text-xl font-semibold mt-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Fill in the template CSV with your device results.</li>
            <li>
              Go to the{' '}
              <Link to="/app" className="text-blue-600 underline">
                Analysis page
              </Link>{' '}
              and upload the file.
            </li>
            <li>Select a test and run the analysis to view calculated statistics.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
