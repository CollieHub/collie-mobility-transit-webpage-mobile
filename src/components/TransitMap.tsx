import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZARATE_CENTER } from '../data/transitRouteData';
import { transitStopsDetailed } from '../data/transitStopsDetailed';
import { findStopGeo, stopGeoIndex, type StopGeo } from '../data/stopGeoIndex';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createStopIcon = (color: string = '#0288D1', direction?: 'ida' | 'vuelta') => {
  const strokeStyle = direction === 'vuelta' 
      ? 'stroke-dasharray="3,2"' 
      : '';
  const svgCode = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="16" height="16">
      <circle cx="10" cy="10" r="7" fill="${color}" stroke="#ffffff" stroke-width="3" ${strokeStyle}/>
    </svg>
  `;
  return L.divIcon({ className: 'custom-stop-dot', html: svgCode, iconSize: [16, 16], iconAnchor: [8, 8] });
};

const createBusIcon = (color: string) => L.divIcon({
  className: 'custom-bus-icon',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="36" height="36">
    <rect width="26" height="28" x="3" y="2" rx="6" fill="${color}" stroke="#ffffff" stroke-width="2"/>
    <rect width="18" height="7" x="7" y="5" rx="2" fill="rgba(255,255,255,0.85)"/>
    <rect width="7" height="5" x="6" y="15" rx="1" fill="rgba(255,255,255,0.5)"/>
    <rect width="7" height="5" x="19" y="15" rx="1" fill="rgba(255,255,255,0.5)"/>
    <circle cx="9" cy="27" r="2.5" fill="#fcd34d" stroke="#fff" stroke-width="1"/>
    <circle cx="23" cy="27" r="2.5" fill="#fcd34d" stroke="#fff" stroke-width="1"/>
  </svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// === Physics (pure functions, no data dependency) ===
function geoDistance(p1: [number, number], p2: [number, number]): number {
  const R = 6371000;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}



function timeToMin(timeStr: string): number {
  if (!timeStr) return -1;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return -1;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// === Bus interface ===
interface Bus {
  routeId: string; name: string; code: string; color: string;
  pos: [number, number]; dir: 'ida' | 'vuelta'; dist: number;
  speed: number; nextStop: string; tripIdx: number;
}

interface StopWaypoint { name: string; pathDist: number; stopIdx: number; }

interface Props { 
  selectedRouteIds: Set<string>; 
  routeStopsIda: Record<string, boolean>;
  routeStopsVuelta: Record<string, boolean>;
  routeSimIda?: Record<string, boolean>;
  routeSimVuelta?: Record<string, boolean>;
  routeShowIda?: Record<string, boolean>;
  routeShowVuelta?: Record<string, boolean>;
  transitRoutes: any[];
  transitStops: any[];
}

// === Stop Info Popup Component ===
const StopInfoPopup = ({ stop, simTime, transitRoutesRef }: { stop: any, simTime: string, transitRoutesRef: any[] }) => {
  if (!simTime) return <div style={{ fontFamily: 'Inter', color: 'var(--text-primary)' }}><strong>🚏 {stop.name}</strong></div>;
  const parts = simTime.split(':');
  const simMin = parseInt(parts[0], 10) * 60 + (parts.length > 1 ? parseInt(parts[1], 10) : 0);
  
  const matchingExcelStops = Object.entries(stopGeoIndex as Record<string, StopGeo>).filter(([_, geo]) => {
     if (geo.lat && geo.lng) {
         return geoDistance([stop.lat, stop.lng], [geo.lat, geo.lng]) < 150;
     }
     return false;
  }).map(e => e[0]);

  const upcoming: { routeCode: string, color: string, dir: string, mMin: number, timeStr: string }[] = [];
  
  transitStopsDetailed.forEach(table => {
      const rd = transitRoutesRef.find((r: any) => r.code === table.code);
      if (!rd) return;
      
      const checkDir = (dirData: any, dirName: string) => {
          dirData.stops.forEach((sName: string, sIdx: number) => {
              if (matchingExcelStops.some(m => m.toUpperCase() === sName.toUpperCase()) || sName.toUpperCase() === stop.name.toUpperCase()) {
                  for (let i = 0; i < dirData.timetables.length; i++) {
                      const tStr = dirData.timetables[i][sIdx];
                      if (!tStr) continue;
                      const m = timeToMin(tStr);
                      if (m >= simMin && m <= simMin + 60) {
                          upcoming.push({ routeCode: rd.code, color: rd.color, dir: dirName, mMin: m, timeStr: tStr });
                          break;
                      } else if (m >= 0 && m < simMin && (m + 1440) <= simMin + 60) {
                          upcoming.push({ routeCode: rd.code, color: rd.color, dir: dirName, mMin: m + 1440, timeStr: tStr });
                          break;
                      }
                  }
              }
          });
      };
      if (table.directions.ida) checkDir(table.directions.ida, 'IDA');
      if (table.directions.vuelta) checkDir(table.directions.vuelta, 'VUELTA');
  });

  upcoming.sort((a,b) => a.mMin - b.mMin);

  return (
    <div style={{ fontFamily: 'Inter', color: 'var(--text-primary)', minWidth: '180px' }}>
       <div className="flex items-start justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <strong>🚏 {stop.name}</strong>
          {stop.direction && (
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: stop.direction === 'ida' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: stop.direction === 'ida' ? '#10b981' : '#ef4444' }}>
              {(() => {
                const route = transitRoutesRef.find((r: any) => r.color.toUpperCase() === (stop.color || '').toUpperCase());
                if (!route) return stop.direction;
                const cleanName = route.name.replace(route.code, '').trim();
                const parts = cleanName.split(/ - | – |-|–/);
                if (parts.length >= 2) {
                  const origin = parts[0].trim();
                  const destination = parts[1].trim();
                  return stop.direction === 'ida' ? `${origin} ➔ ${destination}` : `${destination} ➔ ${origin}`;
                }
                return stop.direction;
              })()}
            </span>
          )}
       </div>
       {upcoming.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No hay servicios en los próximos 60 min</div>
       ) : (
          upcoming.map((u, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: u.color, color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{u.routeCode}</span>
                <span style={{ fontSize: '0.85rem' }}>{u.dir.substring(0, 3)}</span>
                <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>{u.timeStr}</span>
             </div>
          ))
       )}
    </div>
  );
};

// === Componente principal ===
export default function TransitMap({ selectedRouteIds, routeStopsIda = {}, routeStopsVuelta = {}, routeShowIda = {}, routeShowVuelta = {}, routeSimIda = {}, routeSimVuelta = {}, transitRoutes, transitStops }: Props) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [simTime, setSimTime] = useState<string>('');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Error obtaining geolocation: ", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Bus simulation effect (Fetching from Backend /transit/buses/live)
  useEffect(() => {
    // Timer for display only
    const timerIv = setInterval(() => {
      const now = new Date();
      const argTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
      setSimTime(`${argTime.getHours().toString().padStart(2, '0')}:${argTime.getMinutes().toString().padStart(2, '0')}:${argTime.getSeconds().toString().padStart(2, '0')}`);
    }, 1000);

    const fetchLiveBuses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_TRANSIT_API_URL || 'http://localhost:6002'}/transit/buses/live`, {
          headers: { 'X-Application-ID': 'COLLIE-HEALTH-WEB' }
        });
        if (res.ok) {
          const liveData = await res.json();
          // Filter by local UI settings
          const filteredBuses = liveData.filter((b: Bus) => {
            if (b.dir === 'ida' && !(routeSimIda[b.routeId] ?? true)) return false;
            if (b.dir === 'vuelta' && !(routeSimVuelta[b.routeId] ?? true)) return false;
            return true;
          });
          setBuses(filteredBuses);
        }
      } catch (err) {
        console.warn('Failed to fetch live buses', err);
      }
    };

    fetchLiveBuses();
    const iv = setInterval(fetchLiveBuses, 2000); // Poll every 2 seconds

    return () => { clearInterval(timerIv); clearInterval(iv); };
  }, [routeSimIda, routeSimVuelta]);

  const hasFilter = selectedRouteIds.size > 0;
  const routes = hasFilter ? transitRoutes.filter((r: any) => selectedRouteIds.has(r.id)) : [];
  const visibleBuses = hasFilter ? buses.filter(b => selectedRouteIds.has(b.routeId)) : [];

  return (
    <MapContainer center={ZARATE_CENTER} zoom={13} style={{ width: '100%', height: '100%', borderRadius: '16px' }} zoomControl={false}>

      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      
      {routes.map((route: any) => route.directions.map((dir: any) => {
        const isVisible = dir.direction === 'ida' ? (routeShowIda[route.id] ?? true) : (routeShowVuelta[route.id] ?? true);
        if (!isVisible) return null;
        return (
          <Polyline key={`${route.id}-${dir.direction}`} positions={dir.coordinates}
            pathOptions={{ color: route.color, weight: dir.direction === 'ida' ? 4 : 3, opacity: dir.direction === 'ida' ? 0.85 : 0.45, dashArray: dir.direction === 'vuelta' ? '8, 6' : undefined, lineJoin: 'round', lineCap: 'round' }}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: route.color, color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>{route.code}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{route.name}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{dir.direction === 'ida' ? '→ Recorrido de IDA' : '← Recorrido de VUELTA'}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>⏱ {route.estimatedDuration}</div>
              </div>
            </Popup>
          </Polyline>
        );
      }))}

      {transitStops
        .filter((stop: any) => {
            if (selectedRouteIds.size === 0) return false; // PERFORMANCE FIX: Do not render all stops by default
            const parentRoutes = transitRoutes.filter((r: any) => selectedRouteIds.has(r.id) && r.color.toUpperCase() === (stop.color || '').toUpperCase());
            if (parentRoutes.length === 0) return false;
            
            return parentRoutes.some((route: any) => {
              const isStopsIdaOn = routeStopsIda[route.id] ?? false;
              const isStopsVueltaOn = routeStopsVuelta[route.id] ?? false;
              
              if (stop.direction === 'ida' && !isStopsIdaOn) return false;
              if (stop.direction === 'vuelta' && !isStopsVueltaOn) return false;
              return true;
            });
        })
        .map((stop: any, i: number) => (
        <Marker key={`stop-${i}`} position={[stop.lat, stop.lng]} icon={createStopIcon(stop.color, stop.direction)}>
          <Popup><StopInfoPopup stop={stop} simTime={simTime} transitRoutesRef={transitRoutes} /></Popup>
        </Marker>
      ))}

      {visibleBuses.map((bus, i) => (
        <Marker 
          key={`bus-${i}`} 
          position={bus.pos} 
          icon={createBusIcon(bus.color)}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <strong>{bus.name} ({bus.code})</strong><br/>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>Velocidad: {bus.speed} km/h</span>
            </div>
          </Popup>
        </Marker>
      ))}

      {liveUsers.map((u, i) => (
        <Marker 
          key={'live-user-' + i} 
          position={[u.lat, u.lng]} 
          icon={L.divIcon({ 
              className: 'custom-user-dot', 
              html: `<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#10b981" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>`, 
              iconSize: [24, 24], 
              iconAnchor: [12, 12] 
          })}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <strong>Usuario SIT</strong><br/>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>Velocidad: {Number(u.speed || 0).toFixed(1)} km/h</span>
            </div>
          </Popup>
        </Marker>
      ))}

      {userPos && (
        <Marker
          position={userPos}
          icon={L.divIcon({
            className: 'user-location-dot',
            html: `
              <div style="position: relative; width: 24px; height: 24px;">
                <div style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: pulse 2s infinite;"></div>
                <div style="position: absolute; top: 6px; left: 6px; width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
        >
          <Popup>
             <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Tu ubicación</div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
