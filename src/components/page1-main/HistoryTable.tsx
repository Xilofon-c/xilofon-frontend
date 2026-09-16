import React, { useState } from 'react';
import './HistoryTable.css';

export type ShipmentStatus = 'Completed' | 'Loading' | 'Draft' ;

export interface Shipment {
  id: string;
  vehicle: string;
  volume: string;
  weight: string;
  status: ShipmentStatus;
  date: string;
}

const initialData: Shipment[] = [
  { id: 'TRK-8921', vehicle: 'Truck 24T', volume: '96%', weight: '82%', status: 'Completed', date: '2026-05-14' },
  { id: 'TRK-8922', vehicle: 'Container 40ft', volume: '88%', weight: '95%', status: 'Loading', date: '2026-05-15' },
  { id: 'TRK-8923', vehicle: 'Sprinter Van', volume: '45%', weight: '30%', status: 'Draft', date: '2026-05-15' },
];

export const getBadgeClass = (status: ShipmentStatus): string => {
  switch (status) {
    case 'Completed': return 'badge-completed';
    case 'Loading': return 'badge-loading';
    case 'Draft': return 'badge-draft';
    default: return '';
  }
};


export const HistoryTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = initialData.filter((item) =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="table-container">
      <input
        type="text"
        placeholder="Search by ID, Vehicle, or Status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="shipment-table">
        <thead >
          <tr className='titles'>
            <th>Shipment ID</th>
            <th>Vehicle Type</th>
            <th>Vol. Usage</th>
            <th>Weight Usage</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row) => (
              <tr key={row.id} className="rows">
                <td className='rowcard'><strong>{row.id}</strong></td>
                <td className='rowcard'>{row.vehicle}</td>
                <td className='rowcard'>{row.volume}</td>
                <td className='rowcard'>{row.weight}</td>
                <td >
               
                   <div className={`badge ${getBadgeClass(row.status)}`} >
                    {row.status}
                   </div>
               
                </td>
                <td>{row.date}</td>
                <td>
                  <button className="action-btn" onClick={() => alert(`Opening ${row.id}`)}>
                    View 3D
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="no-data">No shipments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};