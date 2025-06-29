import React, { useContext } from 'react'
import { DataContext } from '../App'

export default function DataTable() {
  const { data } = useContext(DataContext)
  if (!data || data.length === 0) return null
  const headers = Object.keys(data[0])
  return (
    <table className="min-w-full table-auto border">
      <thead className="bg-gray-100">
        <tr>
          {headers.map((h) => (
            <th key={h} className="border px-2 py-1 text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b">
            {headers.map((h) => (
              <td key={h} className="px-2 py-1 border-r">
                {row[h]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
