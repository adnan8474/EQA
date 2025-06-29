import React, { useState, useEffect, createContext } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import DataTable from './components/DataTable'

export const DataContext = createContext()

function App() {
  const [data, setData] = useState([])
  const [filtered, setFiltered] = useState([])
  const [testNames, setTestNames] = useState([])
  const [selectedTest, setSelectedTest] = useState('')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'csv') parseCSV(file)
    else if (ext === 'xlsx') parseXLSX(file)
    else alert('Unsupported file type')
  }

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => setData(results.data),
    })
  }

  const parseXLSX = (file) => {
    const reader = new FileReader()
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' })
      const first = workbook.SheetNames[0]
      const sheet = workbook.Sheets[first]
      const csv = XLSX.utils.sheet_to_csv(sheet)
      Papa.parse(csv, {
        header: true,
        dynamicTyping: true,
        complete: (results) => setData(results.data),
      })
    }
    reader.readAsBinaryString(file)
  }

  useEffect(() => {
    const names = Array.from(new Set(data.map((row) => row['Test Name'])))
    setTestNames(names)
  }, [data])

  useEffect(() => {
    if (selectedTest) {
      setFiltered(data.filter((row) => row['Test Name'] === selectedTest))
    } else {
      setFiltered(data)
    }
  }, [selectedTest, data])

  const runAnalysis = () => {
    const grouped = {}
    filtered.forEach((row) => {
      const key = row['Device ID']
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(row.Result)
    })
    const stats = Object.entries(grouped).map(([device, results]) => {
      const mean = results.reduce((a, b) => a + b, 0) / results.length
      const variance = results.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / results.length
      const sd = Math.sqrt(variance)
      const cv = (sd / mean) * 100
      return { device, mean, sd, cv }
    })
    console.log('Stats', stats)
    alert('Analysis complete. See console for stats.')
  }

  return (
    <DataContext.Provider value={{ data: filtered }}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">EQA Comparison Tool</h1>
        <input type="file" accept=".csv,.xlsx" onChange={handleFile} className="border p-2" />
        {data.length > 0 && (
          <div className="space-y-2">
            <div className="flex space-x-2 items-center">
              <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} className="border p-2">
                <option value="">All Tests</option>
                {testNames.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button onClick={runAnalysis} className="bg-blue-500 text-white px-4 py-2 rounded">Run Analysis</button>
            </div>
            <DataTable />
          </div>
        )}
      </div>
    </DataContext.Provider>
  )
}

export default App
