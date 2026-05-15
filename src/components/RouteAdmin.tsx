import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Clock, MapPin, Zap, ChevronDown, ChevronUp, Search, ChevronRight } from 'lucide-react';
import { linea194Schedule } from '../data/schedule194';
import { linea204Schedule } from '../data/schedule204';
import { linea228Schedule } from '../data/schedule228';
import { linea313Schedule } from '../data/schedule313';

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

// Distancias reales del KML en metros (entre paradas consecutivas)
const DISTANCES_IDA: Record<string, number> = {
  'B° BOSCH → Centro T RAWSON': 4670,
  'Centro T RAWSON → PLAZA ITALIA': 1260,
  'PLAZA ITALIA → ESTACIÓN': 2530,
  'ESTACIÓN → HOSPITAL': 2430,
  'HOSPITAL → PUERTO PANAL': 11880,
  'PUERTO PANAL → LIMA': 5350,
  'Zárate Centro → Campana': 12000,
  'Campana → Escobar': 25000,
  'Escobar → Pilar': 15000,
  'Pilar → Panamericana': 18000,
  'Panamericana → Saavedra': 20000,
  'Saavedra → Once': 14000,
};

const DISTANCES_VUELTA: Record<string, number> = {
  'LIMA → PUERTO PANAL': 5640,
  'PUERTO PANAL → QUIRNO y PASO': 6200,
  'QUIRNO y PASO → ESTACIÓN': 7500,
  'ESTACIÓN → AVELL y RIVADA': 1000,
  'AVELL y RIVADA → Centro T RAWSON': 2220,
  'Centro T RAWSON → B° BOSCH': 4610,
  'Once → Saavedra': 14000,
  'Saavedra → Panamericana': 20000,
  'Panamericana → Pilar': 18000,
  'Pilar → Escobar': 15000,
  'Escobar → Campana': 25000,
  'Campana → Zárate Centro': 12000,
};

const STOP_COORDS: Record<string, { lat: number; lng: number } | null> = {
  'B° BOSCH': { lat: -34.1389207, lng: -59.0073585 },
  'Centro T RAWSON': { lat: -34.1074141, lng: -59.0275728 },
  'PLAZA ITALIA': { lat: -34.1008954, lng: -59.0185858 },
  'ESTACIÓN': { lat: -34.0977137, lng: -59.0376357 },
  'HOSPITAL': { lat: -34.0838231, lng: -59.0340123 },
  'PUERTO PANAL': { lat: -34.0706931, lng: -59.1480057 },
  'LIMA': { lat: -34.0423737, lng: -59.1948845 },
  'QUIRNO y PASO': null,
  'AVELL y RIVADA': { lat: -34.0961002, lng: -59.0259819 },
  'Zárate Centro': { lat: -34.0970, lng: -59.0300 },
  'Campana': { lat: -34.1633, lng: -58.9592 },
  'Escobar': { lat: -34.3444, lng: -58.8239 },
  'Pilar': { lat: -34.4589, lng: -58.9142 },
  'Panamericana': { lat: -34.4756, lng: -58.6472 },
  'Saavedra': { lat: -34.5474, lng: -58.4894 },
  'Once': { lat: -34.6092, lng: -58.4065 },
};

export default function RouteAdmin() {
  const [activeDir, setActiveDir] = useState<'ida' | 'vuelta'>('ida');
  const [searchTime, setSearchTime] = useState('');
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  const [selectedScheduleCode, setSelectedScheduleCode] = useState<'194A' | '204' | '228' | '313'>('313');

  const schedule = selectedScheduleCode === '194A' ? linea194Schedule : 
                   selectedScheduleCode === '204' ? linea204Schedule :
                   selectedScheduleCode === '228' ? linea228Schedule :
                   linea313Schedule;
  const dir = schedule.directions[activeDir];

  // Calculate stats
  const stats = useMemo(() => {
    const totalTrips = dir.trips.length;
    const firstDeparture = dir.trips[0]?.[0] || '--:--';
    const lastDeparture = dir.trips[dir.trips.length - 1]?.[0] || '--:--';
    
    // Average trip duration
    const durations = dir.trips.map(trip => {
      const start = timeToMin(trip[0]);
      const end = timeToMin(trip[trip.length - 1]);
      return end - start;
    });
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    // Average frequency (in minutes between departures)
    const departureMins = dir.trips.map(t => timeToMin(t[0]));
    const gaps = [];
    for (let i = 1; i < departureMins.length; i++) {
      gaps.push(departureMins[i] - departureMins[i - 1]);
    }
    const avgFreq = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

    const distances = activeDir === 'ida' ? DISTANCES_IDA : DISTANCES_VUELTA;
    const totalDistM = Object.values(distances).reduce((a, b) => a + b, 0);

    return { totalTrips, firstDeparture, lastDeparture, avgDuration, avgFreq, totalDistM };
  }, [dir, activeDir]);

  // Filter trips by search time
  const filteredTrips = useMemo(() => {
    if (!searchTime) return dir.trips.map((trip: string[], idx: number) => ({ trip, idx }));
    const searchMin = timeToMin(searchTime);
    return dir.trips
      .map((trip: string[], idx: number) => ({ trip, idx }))
      .filter(({ trip }: { trip: string[] }) => {
        const start = timeToMin(trip[0]);
        const end = timeToMin(trip[trip.length - 1]);
        return searchMin >= start - 30 && searchMin <= end + 10; // Show trips close to search time
      });
  }, [dir, searchTime]);

  // Build segment analysis for a trip
  const getSegments = (trip: string[]) => {
    const distances = activeDir === 'ida' ? DISTANCES_IDA : DISTANCES_VUELTA;
    const segments: { from: string; to: string; time: number; dist: number; speed: number }[] = [];
    
    for (let i = 0; i < dir.stops.length - 1; i++) {
      const from = dir.stops[i];
      const to = dir.stops[i + 1];
      const t1 = timeToMin(trip[i]);
      const t2 = timeToMin(trip[i + 1]);
      const timeDelta = t2 - t1;
      const key = `${from} → ${to}`;
      const dist = distances[key] || 0;
      const speed = timeDelta > 0 && dist > 0 ? (dist / 1000) / (timeDelta / 60) : 0;
      segments.push({ from, to, time: timeDelta, dist, speed });
    }
    return segments;
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div style={{ height: '100dvh', overflow: 'auto', background: 'var(--bg-primary)', padding: '20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{
                background: selectedScheduleCode === '194A' ? '#1E88E5' : '#558B2F', color: '#fff', padding: '4px 12px',
                borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.5px'
              }}>
                {schedule.code}
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Administración de Recorrido
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {schedule.title}
            </p>
          </div>
          
          <select 
            value={selectedScheduleCode} 
            onChange={e => {
              setSelectedScheduleCode(e.target.value as '194A' | '204' | '228' | '313');
              setExpandedTrip(null);
            }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: '0.9rem', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="313">Línea 313 - Escobar / Los Cardales</option>
            <option value="228">Línea 228 - Ariel del Plata / Lima</option>
            <option value="204">Línea 204 - Escobar / Zárate</option>
            <option value="194A">Línea 194 - Metropol (Interurbano)</option>
          </select>
        </div>

        {/* Direction Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['ida', 'vuelta'] as const).map(d => (
            <button
              key={d}
              onClick={() => { setActiveDir(d); setExpandedTrip(null); }}
              style={{
                flex: 1, padding: '12px 20px',
                background: activeDir === d
                  ? (d === 'ida' ? 'linear-gradient(135deg, #558B2F, #33691E)' : 'linear-gradient(135deg, #E65100, #BF360C)')
                  : 'var(--bg-card)',
                border: `1px solid ${activeDir === d ? 'transparent' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                color: activeDir === d ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: activeDir === d ? '0 4px 16px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {d === 'ida' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {d === 'ida' ? dir.label : schedule.directions.vuelta.label}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { icon: '🚌', label: 'Servicios', value: `${stats.totalTrips} viajes` },
            { icon: '🕐', label: 'Primer salida', value: stats.firstDeparture },
            { icon: '🌙', label: 'Último salida', value: stats.lastDeparture },
            { icon: '⏱', label: 'Duración prom.', value: formatDuration(stats.avgDuration) },
            { icon: '📊', label: 'Frecuencia', value: `c/${Math.round(stats.avgFreq)} min` },
            { icon: '📏', label: 'Distancia', value: `${(stats.totalDistM / 1000).toFixed(1)} km` },
          ].map(stat => (
            <div key={stat.label} style={{
              ...cardStyle,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.4rem' }}>{stat.icon}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Stops Diagram */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} /> PARADAS DEL RECORRIDO
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '8px' }}>
            {dir.stops.map((stop: string, i: number) => {
              const coords = STOP_COORDS[stop];
              const distances = activeDir === 'ida' ? DISTANCES_IDA : DISTANCES_VUELTA;
              const nextStop = dir.stops[i + 1];
              const key = nextStop ? `${stop} → ${nextStop}` : null;
              const dist = key ? distances[key] : null;
              
              return (
                <div key={stop} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    minWidth: '100px'
                  }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: i === 0 ? '#10b981' : i === dir.stops.length - 1 ? '#ef4444' : '#3b82f6',
                      border: '3px solid rgba(255,255,255,0.2)',
                      boxShadow: `0 0 8px ${i === 0 ? 'rgba(16,185,129,0.4)' : i === dir.stops.length - 1 ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.3)'}`
                    }} />
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)',
                      textAlign: 'center', lineHeight: 1.2, maxWidth: '90px'
                    }}>
                      {stop}
                    </span>
                    <span style={{
                      fontSize: '0.6rem',
                      color: coords ? 'var(--text-muted)' : '#ef4444',
                      fontFamily: 'monospace'
                    }}>
                      {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '⚠ Sin coords'}
                    </span>
                  </div>
                  {i < dir.stops.length - 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '60px' }}>
                      <div style={{ width: '100%', height: '2px', background: 'var(--border-light)' }} />
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        {dist ? `${(dist / 1000).toFixed(1)}km` : '?'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
            ...cardStyle, padding: '10px 16px'
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="time"
              value={searchTime}
              onChange={e => setSearchTime(e.target.value)}
              placeholder="Buscar por hora..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'Inter', fontSize: '0.9rem'
              }}
            />
            {searchTime && (
              <button onClick={() => setSearchTime('')} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '2px'
              }}>×</button>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filteredTrips.length} viaje{filteredTrips.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Trip List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '40px' }}>
          {filteredTrips.map(({ trip, idx }: { trip: string[], idx: number }) => {
            const isExpanded = expandedTrip === idx;
            const startTime = trip[0];
            const endTime = trip[trip.length - 1];
            const duration = timeToMin(endTime) - timeToMin(startTime);
            const segments = isExpanded ? getSegments(trip) : [];

            return (
              <div key={idx} style={{
                ...cardStyle,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderColor: isExpanded ? 'rgba(59,130,246,0.3)' : 'var(--border)',
              }}>
                {/* Trip Header */}
                <div
                  onClick={() => setExpandedTrip(isExpanded ? null : idx)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                      padding: '4px 10px', borderRadius: '6px',
                      fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600
                    }}>
                      #{(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace', color: '#10b981' }}>
                          {startTime}
                        </span>
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace', color: '#ef4444' }}>
                          {endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {formatDuration(duration)}
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Compact stop times */}
                <div style={{
                  display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap'
                }}>
                  {trip.map((time: string, si: number) => (
                    <span key={si} style={{
                      fontSize: '0.7rem', fontFamily: 'monospace',
                      padding: '2px 6px', borderRadius: '4px',
                      background: si === 0 ? 'rgba(16,185,129,0.15)' : si === trip.length - 1 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                      color: si === 0 ? '#34d399' : si === trip.length - 1 ? '#f87171' : 'var(--text-secondary)',
                    }}>
                      {time}
                    </span>
                  ))}
                </div>

                {/* Expanded: Segment Analysis */}
                {isExpanded && (
                  <div style={{
                    marginTop: '16px', paddingTop: '16px',
                    borderTop: '1px solid var(--border)',
                    animation: 'fadeInUp 0.3s ease'
                  }}>
                    <h4 style={{
                      fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                      marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      <Zap size={13} /> Análisis por Tramo
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {segments.map((seg, si) => {
                        const speedColor = seg.speed > 50 ? '#fbbf24' : seg.speed > 30 ? '#60a5fa' : '#34d399';
                        return (
                          <div key={si} style={{
                            display: 'grid', gridTemplateColumns: '2fr 80px 70px 80px', gap: '8px',
                            alignItems: 'center', padding: '8px 12px',
                            background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                            fontSize: '0.8rem'
                          }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                              {seg.from} → {seg.to}
                            </span>
                            <span style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                              {seg.dist > 0 ? `${(seg.dist / 1000).toFixed(1)} km` : '—'}
                            </span>
                            <span style={{ color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'monospace' }}>
                              {seg.time} min
                            </span>
                            <span style={{
                              color: speedColor, fontWeight: 700, textAlign: 'right',
                              fontFamily: 'monospace'
                            }}>
                              {seg.speed > 0 ? `${seg.speed.toFixed(0)} km/h` : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
