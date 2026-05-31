// src/app/documentation/_components/DocTable.tsx
import React from 'react';

interface Column {
  header: string;
  accessor: string;
}

interface DocTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

export function DocTable({ columns, data }: DocTableProps) {
  return (
    <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg">
      <table className="min-w-full divide-y divide-slate-200 m-0">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-none">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm text-slate-600 whitespace-pre border-none">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}