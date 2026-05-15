import { useState, useEffect } from 'react';
import { X, Clock, CalendarDays } from 'lucide-react';
import { transitStopsDetailed } from '../data/transitStopsDetailed';

interface TimetableModalProps {
  routeCode: string;
  onClose: () => void;
}

export default function TimetableModal({ routeCode, onClose }: TimetableModalProps) {
  const data = transitStopsDetailed.find(d => d.code === routeCode);
  
  // Opciones de días obtenidas (simuladas) desde el backend
  const [dayTypes, setDayTypes] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    // Simular carga desde el backend
    setTimeout(() => {
      const backendOptions = ['Lunes a Viernes', 'Sábado', 'Domingo', 'Feriados'];
      setDayTypes(backendOptions);
      setSelectedDay(backendOptions[0]);
    }, 300);
  }, []);

  if (!data) return null;

  const getFilteredTimetables = (timetables: string[][]) => {
    if (selectedDay === 'Sábado') return timetables.filter((_, i) => i % 2 === 0);
    if (selectedDay === 'Domingo' || selectedDay === 'Feriados') return timetables.filter((_, i) => i % 3 === 0);
    return timetables;
  };

  const currentIdaTimetables = getFilteredTimetables(data.directions.ida.timetables);
  const currentVueltaTimetables = getFilteredTimetables(data.directions.vuelta.timetables);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px', backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        width: '95vw', maxWidth: '1400px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="var(--accent)" /> Horarios Completos
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{data.title}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {dayTypes.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <CalendarDays size={16} color="var(--text-muted)" />
                <select 
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-primary)',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                    outline: 'none', cursor: 'pointer', padding: '4px 0'
                  }}
                >
                  {dayTypes.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)'
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* IDA */}
            {currentIdaTimetables.length > 0 && (
              <div>
                <h3 style={{
                  color: '#3b82f6', fontSize: '0.9rem', textTransform: 'uppercase', 
                  letterSpacing: '1px', marginBottom: '12px', borderBottom: '2px solid #3b82f640', paddingBottom: '6px'
                }}>Trayecto de Ida</h3>
                <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ background: '#3b82f620' }}>
                        {data.directions.ida.stops.map((s, i) => (
                          <th key={i} style={{ padding: '10px 8px', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'normal', minWidth: '80px', maxWidth: '130px', wordWrap: 'break-word', lineHeight: '1.2' }}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentIdaTimetables.map((row, r_idx) => (
                        <tr key={r_idx} style={{ background: r_idx % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}>
                          {row.map((time, c_idx) => (
                            <td key={c_idx} style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: time ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {time || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VUELTA */}
            {currentVueltaTimetables.length > 0 && (
              <div>
                <h3 style={{
                  color: '#a855f7', fontSize: '0.9rem', textTransform: 'uppercase', 
                  letterSpacing: '1px', marginBottom: '12px', borderBottom: '2px solid #a855f740', paddingBottom: '6px'
                }}>Trayecto de Vuelta</h3>
                <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ background: '#a855f720' }}>
                        {data.directions.vuelta.stops.map((s, i) => (
                          <th key={i} style={{ padding: '10px 8px', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'normal', minWidth: '80px', maxWidth: '130px', wordWrap: 'break-word', lineHeight: '1.2' }}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentVueltaTimetables.map((row, r_idx) => (
                        <tr key={r_idx} style={{ background: r_idx % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}>
                          {row.map((time, c_idx) => (
                            <td key={c_idx} style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: time ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {time || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
