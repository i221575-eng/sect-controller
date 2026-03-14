'use client'
import React, { useState } from 'react';
interface LogData {
  id: number;
  date: string;
  time: string;
  message: string;
 
}



const staticLogs: LogData[] = [
    { id: 1, date: '2023-01-01', time: '10:00:00', message: 'John Doe edited network "Network 1" settings.' },
    { id: 2, date: '2023-01-02', time: '12:30:00', message: 'Mussabab added user "Alice" to "Developers" group.' },
    { id: 3, date: '2023-01-03', time: '14:45:00', message: 'Murtaza removed user "Bob" from "Managers" group.' },
    { id: 4, date: '2023-01-04', time: '16:15:00', message: 'Alice edited network "Network 2" settings.' },
    { id: 5, date: '2023-01-05', time: '09:30:00', message: 'Mussabab added user "Charlie" to "Developers" group.' },
    { id: 6, date: '2023-01-06', time: '11:20:00', message: 'John Doe edited network "Network 3" settings.' },
    { id: 7, date: '2023-01-07', time: '13:50:00', message: 'Murtaza removed user "Eve" from "Managers" group.' },
    { id: 8, date: '2023-01-08', time: '15:40:00', message: 'Charlie edited network "Network 4" settings.' },
    { id: 9, date: '2023-01-09', time: '08:45:00', message: 'Mussabab added user "David" to "Developers" group.' },
    { id: 10, date: '2023-01-10', time: '10:10:00', message: 'John Doe edited network "Network 5" settings.' },
    { id: 11, date: '2023-01-11', time: '14:20:00', message: 'Murtaza removed user "Frank" from "Managers" group.' },
    { id: 12, date: '2023-01-12', time: '16:30:00', message: 'Alice edited network "Network 6" settings.' },
    { id: 13, date: '2023-01-13', time: '09:15:00', message: 'Mussabab added user "Grace" to "Developers" group.' },
    { id: 14, date: '2023-01-14', time: '11:25:00', message: 'John Doe edited network "Network 7" settings.' },
    { id: 15, date: '2023-01-15', time: '13:35:00', message: 'Murtaza removed user "Helen" from "Managers" group.' },
];


export default function DashboardPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleRowSelection = (rowId: number) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter(id => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  return (
    <div className="flex flex-wrap justify-center">
    {/* User Information Card */}
  

    {/* Log Statistics Section */}
    <div className="flex justify-around mb-4">
            <div className="w-6/12">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">15</div>
              <div className='text-black text-center text-bold'>Logs</div>
            </div>
            <div className="w-6/12">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">05</div>
              <div className='text-black text-center text-bold'>Warnings</div>
            </div>
            <div className="w-6/12">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">03</div>
              <div className='text-black text-center text-bold'>Errors</div>
            </div>
            
    </div>

      {/* Logs Section */}
      <div className="w-full rounded-lg bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <table className="w-full border-collapse text-black">
          <thead style={{ backgroundColor: "#4a4a4a", color: "white" }}>
            <tr className='text-left'>
              <th></th>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {staticLogs.map((row, index) => (
              <tr
                key={row.id}
                className={`${
                  selectedRows.includes(row.id) ? "bg-gray-400" : ""
                } ${
                  index % 2 === 0 ? "" : "bg-gray-200"
                }`}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowSelection(row.id)}
                  />
                </td>
                <td>{row.id}</td>
                <td>{row.date}</td>
                <td>{row.time}</td>
                <td>{row.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
