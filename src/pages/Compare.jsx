import React, { useState, useEffect, createContext } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import DataTable from '../components/DataTable'
import { Chart, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
} from 'chart.js'
import {
  BoxPlotController,
  BoxAndWiskers,
  BoxPlotChart,
} from 'chartjs-chart-box-and-violin-plot'

// Register all needed chart types
ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
  BoxPlotController,
  BoxAndWiskers,
  BoxPlotChart
)


export const DataContext = createContext()

function App() {
  const [data, setData] = useState([])
  const [filtered, setFiltered] = useState([])
  const [testNames, setTestNames] = useState([])
  const [selectedTest, setSelectedTest] = useState('')
  const [analysis, setAnalysis] = useState(null)

  const exportCSV = () => {
    if (!analysis) return
    const csv = Papa.unparse(analysis.deviceStats)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const computeStats = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    let sd = null
    let cv = null
    if (values.length > 1) {
      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        (values.length - 1)
      sd = Math.sqrt(variance)
      cv = mean !== 0 ? (sd / mean) * 100 : 0
    }
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid]
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    return { mean, sd, cv, median, iqr }
  }

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
    if (filtered.length === 0) return

    const grouped = {}
    filtered.forEach((row) => {
      const dev = row['Device ID']
      if (!grouped[dev]) grouped[dev] = []
      grouped[dev].push(Number(row.Result))
    })

    const deviceStats = Object.entries(grouped).map(([device, results]) => {
      const stats = computeStats(results)
      return { device, count: results.length, ...stats }
    })

    const allResults = filtered.map((r) => Number(r.Result))
    const overallMean = allResults.reduce((a, b) => a + b, 0) / allResults.length
    const overallVar =
      allResults.length > 1
        ? allResults.reduce((a, b) => a + Math.pow(b - overallMean, 2), 0) / (allResults.length - 1)
        : 0
    const overallSD = Math.sqrt(overallVar)

    const rowsWithZ = filtered.map((row) => {
      const z = overallSD ? (row.Result - overallMean) / overallSD : 0
      const dev = overallMean ? ((row.Result - overallMean) / overallMean) * 100 : 0
      return { ...row, z: z, deviation: dev }
    })

    const dates = Array.from(new Set(filtered.map((r) => r.Date))).sort()
    const devices = Object.keys(grouped)
    const colors = ['#2563eb', '#059669', '#f97316', '#be123c', '#8b5cf6']

    const lineData = {
      labels: dates,
      datasets: devices.map((device, i) => {
        const dataPoints = dates.map((d) => {
          const row = filtered.find(
            (r) => r.Date === d && r['Device ID'] === device
          )
          return row ? Number(row.Result) : null
        })
        return {
          label: device,
          data: dataPoints,
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length],
          spanGaps: true,
        }
      }),
    }

    const boxData = {
      labels: devices,
      datasets: [
        {
          label: selectedTest || 'All Tests',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          outlierColor: '#999999',
          padding: 10,
          itemRadius: 0,
          data: devices.map((d) => grouped[d]),
        },
      ],
    }

    setAnalysis({
      deviceStats: deviceStats.map((s) => ({
        device: s.device,
        mean: s.mean.toFixed(2),
        sd: s.sd !== null ? s.sd.toFixed(2) : 'N/A',
        cv: s.cv !== null ? s.cv.toFixed(2) : 'N/A',
        median: s.median.toFixed(2),
        iqr: s.iqr.toFixed(2),
        count: s.count,
      })),
      rows: rowsWithZ.map((r) => ({
        ...r,
        z: r.z.toFixed(2),
        deviation: r.deviation.toFixed(2),
      })),
      lineData,
      boxData,
    })
  }

  return (
    <DataContext.Provider value={{ data: filtered }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded shadow">EQA Comparison Tool</h1>
        <div className="bg-white p-4 rounded shadow space-y-4">
          <input type="file" accept=".csv,.xlsx" onChange={handleFile} className="border p-2 w-full" />
          {data.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap space-x-2 items-center">
                <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} className="border p-2 flex-grow">
                  <option value="">All Tests</option>
                  {testNames.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button onClick={runAnalysis} className="bg-blue-500 text-white px-4 py-2 rounded whitespace-nowrap">Run Analysis</button>
                {analysis && (
                  <button onClick={exportCSV} className="bg-green-500 text-white px-4 py-2 rounded whitespace-nowrap">Export CSV</button>
                )}
              </div>
              <DataTable />
            </div>
          )}
          {analysis && analysis.deviceStats.length > 0 && (
            <div className="mt-4 space-y-6">
              <h2 className="text-xl font-semibold mb-2">Results</h2>
              <table className="min-w-full table-auto border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 border">Device</th>
                    <th className="px-2 py-1 border">Mean</th>
                    <th className="px-2 py-1 border">SD</th>
                    <th className="px-2 py-1 border">CV %</th>
                    <th className="px-2 py-1 border">Median</th>
                    <th className="px-2 py-1 border">IQR</th>
                    <th className="px-2 py-1 border">n</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.deviceStats.map((s) => (
                    <tr key={s.device} className="border-b">
                      <td className="px-2 py-1 border-r font-medium">{s.device}</td>
                      <td className="px-2 py-1 border-r text-right">{s.mean}</td>
                      <td className="px-2 py-1 border-r text-right">{s.sd}</td>
                      <td className="px-2 py-1 text-right">
                        {s.cv}
                        {parseFloat(s.cv) > 5 && (
                          <span className="text-red-600 font-bold ml-1">!</span>
                        )}
                      </td>
                      <td className="px-2 py-1 border-r text-right">{s.median}</td>
                      <td className="px-2 py-1 text-right">{s.iqr}</td>
                      <td className="px-2 py-1 text-right">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <Chart type="boxplot" data={analysis.boxData} />
                </div>
                <div>
                  <Line data={analysis.lineData} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mt-6 mb-2">Deviation Table</h3>
                <table className="min-w-full table-auto border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 border">Date</th>
                      <th className="px-2 py-1 border">Device</th>
                      <th className="px-2 py-1 border">Result</th>
                      <th className="px-2 py-1 border">Z-score</th>
                      <th className="px-2 py-1 border">Deviation %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.rows.map((r, i) => (
                      <tr
                        key={i}
                        className={`border-b ${Math.abs(parseFloat(r.z)) > 2 ? 'bg-red-100' : ''}`}
                      >
                        <td className="px-2 py-1 border-r">{r.Date}</td>
                        <td className="px-2 py-1 border-r">{r['Device ID']}</td>
                        <td className="px-2 py-1 border-r text-right">{r.Result}</td>
                        <td className="px-2 py-1 border-r text-right">{r.z}</td>
                        <td className="px-2 py-1 text-right">{r.deviation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DataContext.Provider>
  )
}

export default App
