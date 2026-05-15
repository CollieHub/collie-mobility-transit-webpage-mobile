import { useState, useMemo, useEffect, useRef } from 'react';
import { Bus, MapPin, Clock, ChevronRight, Layers, ArrowRight, ArrowLeft, Navigation, X, Maximize2, ChevronDown, Check, CheckSquare, Square, AlertTriangle } from 'lucide-react';

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const XIconSocial = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
);
import TransitMap from './components/TransitMap';
import TimetableModal from './components/TimetableModal';
import { useTransitData } from './hooks/useTransitData';
import { useAppConfig } from './hooks/useAppConfig';
import { useTransitAds } from './hooks/useTransitAds';
import './index.css';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function useIsMobile() {
  const width = useWindowWidth();
  return width < 768;
}

const CAROUSEL_BANNERS = [
  [
    { title: "Remisería Centro", subtitle: "Viajes de corta y larga distancia", color: "#fef3c7", text: "#b45309", border: "#fcd34d" },
    { title: "Panadería El Sol", subtitle: "Facturas calientes todo el día", color: "#e0e7ff", text: "#4338ca", border: "#a5b4fc" },
    { title: "Ferretería Los Hermanos", subtitle: "Todo para tu hogar", color: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
    { title: "Carnicería La Mejor", subtitle: "Cortes premium todos los días", color: "#dcfce7", text: "#15803d", border: "#86efac" },
    { title: "Kiosco El Paso", subtitle: "Abierto 24 horas", color: "#f3e8ff", text: "#7e22ce", border: "#d8b4fe" },
    { title: "Veterinaria Huellas", subtitle: "Clínica y pet shop", color: "#ecfccb", text: "#4d7c0f", border: "#bef264" },
  ],
  [
    { title: "Remisería La Rápida", subtitle: "Autos ejecutivos", color: "#ffe4e6", text: "#be123c", border: "#fda4af" },
    { title: "Panadería La Abuela", subtitle: "Especialidad en masas finas", color: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" },
    { title: "Ferretería Industrial", subtitle: "Ventas por mayor y menor", color: "#fef9c3", text: "#a16207", border: "#fde047" },
    { title: "Carnicería El Torito", subtitle: "Ofertas de fin de semana", color: "#ffedd5", text: "#c2410c", border: "#fdba74" },
    { title: "Kiosco Open 25", subtitle: "Bebidas frías y snacks", color: "#cffafe", text: "#0f766e", border: "#67e8f9" },
    { title: "Veterinaria San Roque", subtitle: "Peluquería canina", color: "#fae8ff", text: "#a21caf", border: "#f0abfc" },
  ]
];

const DraggableBannerCarousel = ({ slotIndex, activeBanner, banners, onBannerChange, onBannerDoubleClick }: { slotIndex: number, activeBanner: number, banners: any[], onBannerChange: (idx: number) => void, onBannerDoubleClick: (bannerIdx: number) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const wheelCooldownRef = useRef(false);
  
  const [localIndex, setLocalIndex] = useState(activeBanner + 1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const prevActiveBannerRef = useRef(activeBanner);

  const n = banners.length;

  useEffect(() => {
    const prev = prevActiveBannerRef.current;
    if (prev === activeBanner) return;

    setTransitionEnabled(true);

    if (prev === n - 1 && activeBanner === 0) {
      setLocalIndex(n + 1); // animate to clone 0
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setLocalIndex(1); // instantly move to actual 0
      }, 550);
      prevActiveBannerRef.current = activeBanner;
      return () => clearTimeout(timer);
    } else if (prev === 0 && activeBanner === n - 1) {
      setLocalIndex(0); // animate to clone n-1
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setLocalIndex(n); // instantly move to actual n-1
      }, 550);
      prevActiveBannerRef.current = activeBanner;
      return () => clearTimeout(timer);
    } else {
      setLocalIndex(activeBanner + 1);
      prevActiveBannerRef.current = activeBanner;
    }
  }, [activeBanner, n]);

  useEffect(() => {
    if (!isHovered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onBannerChange((activeBanner - 1 + n) % n);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onBannerChange((activeBanner + 1) % n);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, activeBanner, onBannerChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientY - startY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Umbral para cambiar de diapositiva (50px)
    if (dragOffset < -50) {
      onBannerChange((activeBanner + 1) % n);
    } else if (dragOffset > 50) {
      onBannerChange((activeBanner - 1 + n) % n);
    }
    setDragOffset(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (wheelCooldownRef.current) return;
    
    if (e.deltaY > 20) {
      wheelCooldownRef.current = true;
      onBannerChange((activeBanner + 1) % n);
      setTimeout(() => wheelCooldownRef.current = false, 800);
    } else if (e.deltaY < -20) {
      wheelCooldownRef.current = true;
      onBannerChange((activeBanner - 1 + n) % n);
      setTimeout(() => wheelCooldownRef.current = false, 800);
    }
  };

  const currentTranslate = -(localIndex * 100);
  const transitionStyle = isDragging || !transitionEnabled ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <div 
      style={{ 
        flex: 1, width: '100%', minHeight: '120px', overflow: 'hidden', borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', pointerEvents: 'auto', position: 'relative', 
        cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' 
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onWheel={handleWheel}
    >
      <div style={{ display: 'flex', flexDirection: 'column', transition: transitionStyle, transform: `translateY(calc(${currentTranslate}% + ${dragOffset}px))`, height: '100%' }}>
        {[banners[n - 1], ...banners, banners[0]].map((banner, arrIdx) => {
          const actualBannerIdx = arrIdx === 0 ? n - 1 : arrIdx === n + 1 ? 0 : arrIdx - 1;
          return (
            <div key={arrIdx} onDoubleClick={() => onBannerDoubleClick(actualBannerIdx)} style={{ position: 'relative', flexShrink: 0, width: '100%', height: '100%', background: banner.color || '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '16px', boxSizing: 'border-box' }}>
              {banner.imageUrl ? (
                <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', border: `2px solid ${banner.border || '#ccc'}` }}>
                  <img src={banner.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Ad" draggable={false} />
                </div>
              ) : (
                <div style={{ padding: '24px', border: `2px solid ${banner.border}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90%', height: '90%' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: banner.text, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', userSelect: 'none', marginBottom: '8px' }}>{banner.title}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: banner.text, opacity: 0.8, textAlign: 'center', userSelect: 'none' }}>{banner.subtitle}</span>
                </div>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onBannerDoubleClick(actualBannerIdx); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ position: 'absolute', bottom: '12px', right: '12px', background: banner.text, color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Ampliar anuncio"
              >
                <Maximize2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
      

    </div>
  );
};

function App() {
  const { config } = useAppConfig();
  const { ads } = useTransitAds();
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(new Set());
  const [routeShowIda, setRouteShowIda] = useState<Record<string, boolean>>({});
  const [routeShowVuelta, setRouteShowVuelta] = useState<Record<string, boolean>>({});
  const [routeStopsIda, setRouteStopsIda] = useState<Record<string, boolean>>({});
  const [routeStopsVuelta, setRouteStopsVuelta] = useState<Record<string, boolean>>({});
  const [routeSimIda, setRouteSimIda] = useState<Record<string, boolean>>({});
  const [routeSimVuelta, setRouteSimVuelta] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<string | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set(['ALL']));
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recorridos' | 'informacion' | 'acerca_de'>('recorridos');
  const [bannerStates, setBannerStates] = useState([0, 0]);
  const [expandedBanner, setExpandedBanner] = useState<{slot: number, banner: number} | null>(null);
  const [infoModal, setInfoModal] = useState<'privacy' | 'terms' | 'pricing' | 'advertising_prices' | null>(null);
  const isMobile = useIsMobile();
  const windowWidth = useWindowWidth();
  const isTablet = windowWidth >= 768 && windowWidth < 1150;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLineDropdownOpen(false);
      }
    };
    if (lineDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [lineDropdownOpen]);

  const dynamicBanners: any[][] = useMemo(() => {
    if (ads.length > 0) {
      const mid = Math.ceil(ads.length / 2);
      return [ads.slice(0, mid), ads.slice(mid)];
    }
    return CAROUSEL_BANNERS;
  }, [ads]);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      const slotToMove = tick % 2;
      setBannerStates(prev => {
        const next = [...prev];
        if (dynamicBanners[slotToMove] && dynamicBanners[slotToMove].length > 0) {
          next[slotToMove] = (next[slotToMove] + 1) % dynamicBanners[slotToMove].length;
        }
        return next;
      });
      tick++;
    }, 8000);
    return () => clearInterval(interval);
  }, [dynamicBanners]);
  
  // Dynamic OTA Data
  const { data: transitData, isLoading, error } = useTransitData();
  const transitRoutes = useMemo(() => {
    let routes = [...(transitData?.routes || [])];
    if (config.enabled_routes.length > 0) {
      routes = routes.filter(r => config.enabled_routes.includes(r.id));
    }
    return routes.sort((a, b) => a.code.localeCompare(b.code));
  }, [transitData?.routes, config.enabled_routes]);

  const getLineName = (code: string) => {
    if (code.startsWith('RZ')) return 'SIT';
    const match = code.match(/^(\d+)/);
    if (match) return match[1];
    return 'Otras';
  };

  const availableLines = useMemo(() => {
    const lines = new Set<string>();
    transitRoutes.forEach(r => lines.add(getLineName(r.code)));
    return Array.from(lines).sort((a, b) => {
      if (a === 'SIT') return -1;
      if (b === 'SIT') return 1;
      if (a === 'Otras') return 1;
      if (b === 'Otras') return -1;
      return parseInt(a) - parseInt(b);
    });
  }, [transitRoutes]);

  const filteredRoutes = useMemo(() => {
    if (selectedLines.has('ALL')) return transitRoutes;
    return transitRoutes.filter(r => selectedLines.has(getLineName(r.code)));
  }, [transitRoutes, selectedLines]);

  const toggleRoute = (routeId: string) => {
    setSelectedRouteIds(prev => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
        setRouteShowIda(prev => ({...prev, [routeId]: true}));
        setRouteShowVuelta(prev => ({...prev, [routeId]: true}));
      }
      return next;
    });
  };

  const toggleDirection = (e: React.MouseEvent, routeId: string, dir: 'ida' | 'vuelta') => {
    e.stopPropagation();
    if (dir === 'ida') {
      setRouteShowIda(prev => ({...prev, [routeId]: !(prev[routeId] ?? true)}));
    } else {
      setRouteShowVuelta(prev => ({...prev, [routeId]: !(prev[routeId] ?? true)}));
    }
  };

  const toggleStops = (routeId: string, dir: 'ida' | 'vuelta') => {
    if (dir === 'ida') {
      setRouteStopsIda(prev => ({...prev, [routeId]: !(prev[routeId] ?? false)}));
    } else {
      setRouteStopsVuelta(prev => ({...prev, [routeId]: !(prev[routeId] ?? false)}));
    }
  };

  const toggleSim = (routeId: string, dir: 'ida' | 'vuelta') => {
    if (dir === 'ida') {
      setRouteSimIda(prev => ({...prev, [routeId]: !(prev[routeId] ?? true)}));
    } else {
      setRouteSimVuelta(prev => ({...prev, [routeId]: !(prev[routeId] ?? true)}));
    }
  };

  const selectAll = () => setSelectedRouteIds(new Set());
  const hasFilter = selectedRouteIds.size > 0;

  const selectedRoutes = useMemo(
    () => transitRoutes.filter((r: any) => selectedRouteIds.has(r.id)),
    [selectedRouteIds, transitRoutes]
  );

  const [devAccess, setDevAccess] = useState(localStorage.getItem('dev_access') === 'true');
  const [devPassword, setDevPassword] = useState('');

  // === EARLY RETURNS (must be after ALL hooks) ===
  if (!devAccess) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)', flexDirection: 'column', fontFamily: 'sans-serif' }}>
        <h2 style={{ marginBottom: '20px' }}>Entorno Protegido</h2>
        <input 
          type="password" 
          placeholder="Contraseña de acceso"
          value={devPassword}
          onChange={e => setDevPassword(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && devPassword === 'collie2026') {
              localStorage.setItem('dev_access', 'true');
              setDevAccess(true);
            }
          }}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '10px', width: '250px', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
        />
        <button 
          onClick={() => {
            if (devPassword === 'collie2026') {
              localStorage.setItem('dev_access', 'true');
              setDevAccess(true);
            } else {
              alert('Contraseña incorrecta');
            }
          }}
          style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', width: '250px', fontWeight: 'bold' }}
        >
          Ingresar al Desarrollo
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <Layers size={32} style={{ color: 'var(--accent)', marginBottom: '16px', animation: 'pulse 2s infinite' }} />
        <h2>Cargando datos de transporte...</h2>
      </div>
    </div>;
  }
  
  if (error) {
    return <div style={{ padding: '24px', color: 'red' }}>Error cargando la cartografía.</div>;
  }

  // ========== ROUTE LIST CONTENT (shared between sidebar and drawer) ==========
  const routeListContent = (
    <>
      {/* Line Filter */}
      <div style={{ marginBottom: '12px', position: 'relative' }} ref={dropdownRef}>
        <div
          onClick={() => setLineDropdownOpen(!lineDropdownOpen)}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            userSelect: 'none'
          }}
        >
          <span>
            {selectedLines.has('ALL') 
              ? 'Todas las líneas' 
              : `${selectedLines.size} línea${selectedLines.size > 1 ? 's' : ''} seleccionada${selectedLines.size > 1 ? 's' : ''}`}
          </span>
          <ChevronDown size={16} style={{ transform: lineDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
        </div>
        
        {lineDropdownOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)', zIndex: 100, maxHeight: '300px', overflowY: 'auto',
            padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px'
          }}>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLines(new Set(['ALL']));
              }}
              style={{
                padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontWeight: selectedLines.has('ALL') ? 700 : 500,
                fontSize: '0.85rem', borderRadius: '8px', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--hover-light)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', color: selectedLines.has('ALL') ? 'var(--accent)' : 'var(--text-muted)' }}>
                {selectedLines.has('ALL') ? <CheckSquare size={18} /> : <Square size={18} />}
              </div>
              Todas las líneas
            </div>
            
            {availableLines.map(line => {
              const lineRoutes = transitRoutes.filter(r => getLineName(r.code) === line);
              const count = lineRoutes.length;
              const isSelected = selectedLines.has(line);
              
              return (
                <div key={line} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLines(prev => {
                        const next = new Set(prev);
                        if (next.has('ALL')) next.delete('ALL');
                        if (next.has(line)) {
                          next.delete(line);
                          if (next.size === 0) next.add('ALL');
                        } else {
                          next.add(line);
                        }
                        return next;
                      });
                    }}
                    style={{
                      padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem', borderRadius: '8px', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--hover-light)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', color: isSelected ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    {line} <span style={{ opacity: isSelected ? 0.9 : 0.6, fontSize: '0.75rem', marginLeft: 'auto' }}>({count} ramales)</span>
                  </div>

                  {/* Mostrar ramales cuando la línea está seleccionada */}
                  {isSelected && (
                    <div style={{ 
                      marginLeft: '36px', paddingLeft: '8px', borderLeft: '2px solid var(--border)',
                      display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', marginBottom: '8px'
                    }}>
                      {lineRoutes.map(r => (
                        <div key={r.id} style={{ 
                          fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '4px 0'
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: r.color, flexShrink: 0 }}>{r.code}</span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.85 }}>{r.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual routes */}
      {filteredRoutes.map((route, idx) => {
        const isSelected = selectedRouteIds.has(route.id);
        const idaPts = route.directions.find((d: any) => d.direction === 'ida')?.coordinates.length || 0;
        const vueltaPts = route.directions.find((d: any) => d.direction === 'vuelta')?.coordinates.length || 0;
        
        return (
          <button
            key={route.id}
            onClick={() => toggleRoute(route.id)}
            style={{
              width: '100%', padding: isMobile ? '12px 14px' : '14px 16px', marginBottom: '6px',
              background: isSelected ? `${route.color}15` : 'var(--bg-card)',
              border: `1px solid ${isSelected ? `${route.color}40` : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer', transition: 'all 0.2s',
              textAlign: 'left',
              animation: `fadeInUp 0.3s ease ${idx * 0.05}s both`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${route.color}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.7rem', color: route.color }}>{route.code}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600, fontSize: '0.85rem', color: isSelected ? route.color : 'var(--text-primary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {route.name}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} /> {route.estimatedDuration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Layers size={10} /> {route.directions.length} recorridos
                  </span>
                </div>
              </div>
              <div style={{
                width: '18px', height: '18px', borderRadius: '5px',
                border: `2px solid ${isSelected ? route.color : 'rgba(255,255,255,0.15)'}`,
                background: isSelected ? `${route.color}30` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0
              }}>
                {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: route.color }} />}
              </div>
            </div>

            {/* Expanded details */}
            {isSelected && (
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: `1px solid ${route.color}20`,
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {route.directions.map((d: any, i: number) => {
                    const isDirVisible = d.direction === 'ida' ? (routeShowIda[route.id] ?? true) : (routeShowVuelta[route.id] ?? true);
                    const isStopsVisible = d.direction === 'ida' ? (routeStopsIda[route.id] ?? false) : (routeStopsVuelta[route.id] ?? false);
                    const isSimVisible = d.direction === 'ida' ? (routeSimIda[route.id] ?? true) : (routeSimVuelta[route.id] ?? true);
                    const isIda = d.direction === 'ida';
                    return (
                      <div key={i} style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={(e) => toggleDirection(e, route.id, d.direction as 'ida'|'vuelta')}
                          style={{
                            flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: isDirVisible ? (isIda ? 'rgba(59, 130, 246, 0.12)' : 'rgba(168, 85, 247, 0.12)') : 'rgba(0,0,0,0.03)', 
                            opacity: isDirVisible ? 1 : 0.5,
                            display: 'flex', alignItems: 'center', gap: '10px'
                          }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isIda ? '#3b82f6' : '#a855f7' }} />
                          <div style={{ fontSize: '0.75rem', color: isIda ? '#3b82f6' : '#a855f7', fontWeight: 600, textTransform: 'capitalize' }}>
                            Recorrido {i + 1}: {d.direction}
                          </div>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSim(route.id, d.direction as 'ida'|'vuelta'); }}
                          style={{
                            padding: '0 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: isSimVisible ? (isIda ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)') : 'rgba(0,0,0,0.03)',
                            color: isSimVisible ? (isIda ? '#3b82f6' : '#a855f7') : 'var(--text-muted)'
                          }}
                          title="Mostrar/Ocultar Simulación"
                        >
                          <Bus size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStops(route.id, d.direction as 'ida'|'vuelta'); }}
                          style={{
                            padding: '0 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: isStopsVisible ? (isIda ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)') : 'rgba(0,0,0,0.03)',
                            color: isStopsVisible ? (isIda ? '#3b82f6' : '#a855f7') : 'var(--text-muted)'
                          }}
                          title="Mostrar/Ocultar Paradas"
                        >
                          <MapPin size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginTop: '8px', padding: '6px 10px',
                  background: 'var(--success-glow)', borderRadius: 'var(--radius-sm)',
                  width: 'fit-content'
                }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--success)' }}>Colectivo en servicio</span>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setViewingSchedule(route.code); }} 
                  style={{ 
                    width: '100%', marginTop: '10px', padding: '8px', 
                    background: 'var(--bg-primary)', border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', 
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-light)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                >
                  <Clock size={12} /> Ver Cuadro de Horarios
                </button>
              </div>
            )}
          </button>
        );
      })}
    </>
  );

  const infoContent = (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>Estado del Tránsito</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <CheckSquare size={20} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', color: '#065f46', fontSize: '0.9rem', marginBottom: '4px' }}>Servicio Normal</strong>
            <span style={{ fontSize: '0.8rem', color: '#064e3b', lineHeight: '1.4' }}>Todas las líneas operando en sus horarios y recorridos habituales.</span>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Clock size={20} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>Demoras Línea RZ02</strong>
            <span style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: '1.4' }}>Tráfico intenso en zona céntrica (Av. Lavalle). Posibles demoras de 10-15 min.</span>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', color: '#991b1b', fontSize: '0.9rem', marginBottom: '4px' }}>Desvío Programado RZ01</strong>
            <span style={{ fontSize: '0.8rem', color: '#7f1d1d', lineHeight: '1.4' }}>Corte por obras en calle Justa Lima. El recorrido vuelve por Bolívar.</span>
          </div>
        </div>
      </div>
    </div>
  );

  const acercaDeContent = (
    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <img src="/bus-icon.png" alt="Logo" style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'contain' }} draggable={false} />
        <div>
          <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1.15rem', marginBottom: '12px' }}>¿Por dónde viene?</strong>
          <span style={{ fontSize: '0.95rem', lineHeight: '1.6', display: 'block', color: 'var(--text-primary)' }}>Esta es una aplicación <strong style={{ color: 'var(--accent)' }}>completamente independiente</strong>, desarrollada para facilitar la movilidad urbana.</span>
          <br/>
          <span style={{ fontSize: '0.85rem', lineHeight: '1.6', display: 'block', fontStyle: 'italic', padding: '0 10px' }}>No está asociada, patrocinada, ni afiliada a ninguna empresa de transporte público específica ni a ningún ente u organismo gubernamental.</span>
          
          <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Para más información revisar los <span style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }} onClick={() => setInfoModal('terms')}>Términos y Condiciones</span> y <span style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }} onClick={() => setInfoModal('privacy')}>Privacidad</span>.
          </div>
        </div>
      </div>
    </div>
  );

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div style={{ position: 'relative', height: '100dvh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        {/* Full-screen Map */}
        <div style={{ position: 'absolute', inset: '0 0 32px 0' }}>
          <TransitMap selectedRouteIds={selectedRouteIds} routeStopsIda={routeStopsIda} routeStopsVuelta={routeStopsVuelta} routeShowIda={routeShowIda} routeShowVuelta={routeShowVuelta} routeSimIda={routeSimIda} routeSimVuelta={routeSimVuelta} transitRoutes={transitRoutes} transitStops={transitData?.stops || []} />
        </div>

        <div style={{ position: 'absolute', bottom: '90px', left: '16px', zIndex: 1000, pointerEvents: 'auto', opacity: 0.6, fontFamily: 'Inter, sans-serif', color: '#1e293b', textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,1)', userSelect: 'none', WebkitUserSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <div style={{ fontWeight: 900, fontSize: '1.2rem', lineHeight: '1.1' }}>¿Por dónde viene?</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.85, marginBottom: '2px' }}>Tu app de transportes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.8 }}>
            {config.publicite_enabled && (
              <a href={config.publicite_url || '#'} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', fontWeight: 900, color: '#16a34a', marginRight: '4px', cursor: 'pointer', textDecoration: 'underline', textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 4px rgba(255,255,255,1)' }}>Publicite aquí</a>
            )}
            <a href="#" style={{ color: 'inherit' }}><InstagramIcon size={18} /></a>
            <a href="#" style={{ color: 'inherit' }}><FacebookIcon size={18} /></a>
            <a href="#" style={{ color: 'inherit' }}><XIconSocial size={18} /></a>
          </div>
        </div>

        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))',
          padding: '12px 16px 32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/bus-icon.png" alt="Logo" style={{ width: '68px', height: '68px', borderRadius: '8px', objectFit: 'contain' }} draggable={false} />
            <div>
              <h1 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>¿Por dónde viene?</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Tu app de transportes</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', background: 'var(--success-glow)', borderRadius: '6px'
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>
                  {availableLines.length} {availableLines.length === 1 ? 'LÍNEA ACTIVA' : 'LÍNEAS ACTIVAS'}
                </span>
              </div>
            </div>
          </div>

          {/* Selected routes chips */}
          {selectedRoutes.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              {selectedRoutes.map(sr => (
                <div key={sr.id} onClick={() => toggleRoute(sr.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: `${sr.color}25`, padding: '3px 10px',
                  borderRadius: '8px', border: `1px solid ${sr.color}40`,
                  cursor: 'pointer'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: sr.color }} />
                  <span style={{ fontWeight: 700, color: sr.color, fontSize: '0.7rem' }}>{sr.code}</span>
                  <X size={10} color={sr.color} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banners on Mobile */}
        {config.banners_enabled && (
          <div style={{ position: 'absolute', top: selectedRoutes.length > 0 ? '135px' : '95px', left: '16px', right: '16px', height: '100px', zIndex: 1000, pointerEvents: 'none', transition: 'top 0.3s' }}>
            <DraggableBannerCarousel 
              key="mobile-banner"
              slotIndex={0}
              activeBanner={bannerStates[0]}
              banners={dynamicBanners[0] || []}
              onBannerChange={(newIdx) => {
                setBannerStates(prev => {
                  const next = [...prev];
                  next[0] = newIdx;
                  return next;
                });
              }}
              onBannerDoubleClick={(bannerIdx) => setExpandedBanner({ slot: 0, banner: bannerIdx })}
            />
          </div>
        )}

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text-primary)',
            width: '54px',
            height: '54px',
            borderRadius: '27px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Layers size={24} color="#3b82f6" />
          {hasFilter && (
            <div style={{
              position: 'absolute', top: '-2px', right: '-2px',
              background: '#ef4444', color: 'white', fontSize: '0.7rem',
              fontWeight: 800, width: '22px', height: '22px',
              borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {selectedRouteIds.size}
            </div>
          )}
        </button>

        {/* Modal Bottom Sheet */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
          opacity: mobileDrawerOpen ? 1 : 0,
          pointerEvents: mobileDrawerOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s'
        }} onClick={() => setMobileDrawerOpen(false)}>
          
          <div style={{
            position: 'absolute',
            bottom: mobileDrawerOpen ? 0 : '-100%',
            left: 0, right: 0,
            maxHeight: '85dvh',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            borderRadius: '24px 24px 0 0',
            padding: '20px 16px 40px',
            display: 'flex', flexDirection: 'column',
            transition: 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="var(--accent)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Capas y Recorridos</h2>
              </div>
              <button onClick={() => setMobileDrawerOpen(false)} style={{
                background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)', cursor: 'pointer'
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
              <button 
                onClick={() => setActiveTab('recorridos')}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: activeTab === 'recorridos' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'recorridos' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'recorridos' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem', outline: 'none' }}
              >Recorridos</button>
              <button 
                onClick={() => setActiveTab('informacion')}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: activeTab === 'informacion' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'informacion' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'informacion' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem', outline: 'none' }}
              >Información</button>
            </div>

            {/* Modal Content */}
            <div style={{ overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
              {activeTab === 'recorridos' ? routeListContent : activeTab === 'informacion' ? infoContent : acercaDeContent}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span 
                onClick={() => setActiveTab('acerca_de')}
                style={{ fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
              >
                Acerca de
              </span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      
      {/* Map Area - Full background */}
      <div style={{ position: 'absolute', inset: '0 0 32px 0', zIndex: 1 }}>
        <TransitMap selectedRouteIds={selectedRouteIds} routeStopsIda={routeStopsIda} routeStopsVuelta={routeStopsVuelta} routeShowIda={routeShowIda} routeShowVuelta={routeShowVuelta} routeSimIda={routeSimIda} routeSimVuelta={routeSimVuelta} transitRoutes={transitRoutes} transitStops={transitData?.stops || []} />
        
        {/* Espacios Publicitarios (2 Carruseles Arrastrables) */}
        {config.banners_enabled && (
          <div style={{ position: 'absolute', top: '16px', bottom: '110px', right: '16px', zIndex: 1000, width: isTablet ? '220px' : '300px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-evenly', pointerEvents: 'none', transition: 'width 0.3s' }}>
            {[0, 1].map(slotIndex => (
              <DraggableBannerCarousel 
                key={slotIndex}
                slotIndex={slotIndex}
                activeBanner={bannerStates[slotIndex]}
                banners={dynamicBanners[slotIndex] || []}
                onBannerChange={(newIdx) => {
                  setBannerStates(prev => {
                    const next = [...prev];
                    next[slotIndex] = newIdx;
                    return next;
                  });
                }}
                onBannerDoubleClick={(bannerIdx) => setExpandedBanner({ slot: slotIndex, banner: bannerIdx })}
              />
            ))}
          </div>
        )}


        <div style={{ position: 'absolute', bottom: '36px', right: '16px', zIndex: 1000, pointerEvents: 'auto', opacity: 0.6, fontFamily: 'Inter, sans-serif', color: '#1e293b', textShadow: '0 0 12px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,1)', userSelect: 'none', WebkitUserSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.8 }}>
            {config.publicite_enabled && (
              <a href={config.publicite_url || '#'} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a', marginRight: '8px', cursor: 'pointer', textDecoration: 'underline', textShadow: '0 0 12px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,1)' }}>Publicite aquí</a>
            )}
            <a href="#" style={{ color: 'inherit' }}><InstagramIcon size={20} /></a>
            <a href="#" style={{ color: 'inherit' }}><FacebookIcon size={20} /></a>
            <a href="#" style={{ color: 'inherit' }}><XIconSocial size={20} /></a>
          </div>
        </div>
      </div>

      {/* Floating Sidebar Container */}
      <div style={{
        position: 'absolute',
        top: '16px', left: '16px', bottom: '48px',
        width: sidebarOpen ? (isTablet ? '320px' : '380px') : '0px',
        zIndex: 10,
        background: 'var(--bg-card)',
        borderRadius: '24px',
        border: '3px solid var(--success)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        pointerEvents: sidebarOpen ? 'auto' : 'none',
        opacity: sidebarOpen ? 1 : 0,
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.05))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <img src="/bus-icon.png" alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'contain' }} draggable={false} />
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                ¿Por dónde viene?
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 500 }}>Tu app de transportes</p>
            </div>
          </div>
          
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px',
            padding: '6px 10px', background: 'var(--success-glow)', borderRadius: 'var(--radius-sm)',
            width: 'fit-content'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {availableLines.length} {availableLines.length === 1 ? 'LÍNEA ACTIVA' : 'LÍNEAS ACTIVAS'}
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('recorridos')}
            style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: activeTab === 'recorridos' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'recorridos' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'recorridos' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem', outline: 'none' }}
          >Recorridos</button>
          <button 
            onClick={() => setActiveTab('informacion')}
            style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: activeTab === 'informacion' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'informacion' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'informacion' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem', outline: 'none' }}
          >Información</button>
        </div>

        {/* Route List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {activeTab === 'recorridos' ? routeListContent : activeTab === 'informacion' ? infoContent : acercaDeContent}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span 
            onClick={() => setActiveTab('acerca_de')}
            style={{ fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
          >
            Acerca de
          </span>
        </div>
      </div>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'absolute', left: sidebarOpen ? '404px' : '16px',
          top: '24px',
          zIndex: 20, width: '40px', height: '40px',
          background: '#ffffff', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'var(--shadow-sm)'
        }}
        title={sidebarOpen ? "Ocultar panel" : "Mostrar panel"}
      >
        <ChevronRight size={20} style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>


      {/* Timetable Modal (Desktop) */}
      {viewingSchedule && <TimetableModal routeCode={viewingSchedule} onClose={() => setViewingSchedule(null)} />}
      
      {/* Expanded Banner Modal */}
      {expandedBanner && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease', cursor: 'zoom-out'
        }} onClick={() => setExpandedBanner(null)}>
          <div style={{
            background: dynamicBanners[expandedBanner.slot][expandedBanner.banner].color || '#fff', 
            border: `4px solid ${dynamicBanners[expandedBanner.slot][expandedBanner.banner].border || '#ccc'}`,
            borderRadius: '24px', padding: '40px',
            width: '80%', maxWidth: '800px', aspectRatio: '16/9',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', cursor: 'default', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            {dynamicBanners[expandedBanner.slot][expandedBanner.banner].imageUrl ? (
              <img src={dynamicBanners[expandedBanner.slot][expandedBanner.banner].imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Ad Expanded" draggable={false} />
            ) : (
              <>
                <span style={{ fontSize: '3.5rem', fontWeight: 900, color: dynamicBanners[expandedBanner.slot][expandedBanner.banner].text, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '24px' }}>
                  {dynamicBanners[expandedBanner.slot][expandedBanner.banner].title}
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: 600, color: dynamicBanners[expandedBanner.slot][expandedBanner.banner].text, opacity: 0.8, textAlign: 'center' }}>
                  {dynamicBanners[expandedBanner.slot][expandedBanner.banner].subtitle}
                </span>
              </>
            )}
            <button 
              onClick={() => setExpandedBanner(null)}
              style={{
                position: 'absolute', top: '24px', right: '24px',
                background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Admin-style Status Bar Footer */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '32px',
        background: '#111827', color: '#9ca3af', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif',
        WebkitUserSelect: 'none', userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 800, color: '#f3f4f6' }}>¿Por dónde viene?</span>
          {!isMobile && <span style={{ opacity: 0.8 }}>Tu app de transportes.</span>}
          <span style={{ opacity: 0.7, fontWeight: 500, marginLeft: isMobile ? '6px' : '0' }}>v1.0.0 [local]</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>© 2026 CollieTech. Todos los derechos reservados.</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setInfoModal('privacy'); }} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Privacidad</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setInfoModal('terms'); }} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Términos</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setInfoModal('pricing'); }} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Pricing</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Español</a>
        </div>
      </div>

      {/* Info Modal (Privacy & Terms) */}
      {infoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: '32px',
          background: 'var(--bg-primary)', zIndex: 1999,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          WebkitUserSelect: 'none', userSelect: 'none'
        }}>
          {/* Sticky Header */}
          <div style={{
            position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10,
            borderBottom: '1px solid var(--border)', padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src="/bus-icon.png" alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'contain' }} draggable={false} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', lineHeight: '1.2' }}>¿Por dónde viene?</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tu app de transportes</span>
              </div>
            </div>
            <button 
              onClick={() => setInfoModal(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            ><X size={24} /></button>
          </div>

          <div style={{
            background: 'var(--bg-card)', width: '100%', maxWidth: '800px', margin: '0 auto',
            minHeight: 'calc(100vh - 32px - 65px)', padding: '40px 24px', display: 'flex', flexDirection: 'column',
            position: 'relative'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 900 }}>
                {infoModal === 'privacy' ? 'Políticas de Privacidad' : infoModal === 'pricing' ? 'Planes y Precios' : infoModal === 'advertising_prices' ? 'Tarifas de Publicidad' : 'Términos y Condiciones'}
              </h2>
            </div>
            <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', paddingBottom: '60px' }}>
              <p style={{ marginBottom: '32px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Última actualización: Mayo 2026
              </p>
              {infoModal === 'pricing' ? (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                      <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        Soluciones diseñadas tanto para negocios locales como para empresas de transporte de pasajeros.
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>
                      {/* Plan Publicitario */}
                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Plan Publicitario</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          Consultar
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', minHeight: '40px' }}>Promociona tu comercio para llegar a miles de usuarios diarios.</p>
                        
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}><Check size={16} color="var(--accent)"/> Banners destacados en la app</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}><Check size={16} color="var(--accent)"/> Ubicación patrocinada en mapa</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}><Check size={16} color="var(--accent)"/> Redirección a WhatsApp o Web</li>
                        </ul>
                        <button onClick={() => setInfoModal('advertising_prices')} style={{ width: '100%', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>Consultar Precios</button>
                      </div>

                      {/* Plan Flota Privada */}
                      <div style={{ background: 'var(--accent)', border: 'none', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Corporativo</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Flota Privada</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>
                          Consultar
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '24px', minHeight: '40px' }}>Seguimiento para transporte privado de pasajeros (Ej. MASTERBUS).</p>
                        
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><Check size={16} color="#fff"/> Telemetría y monitoreo en vivo</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><Check size={16} color="#fff"/> Recorridos privados y seguros</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><Check size={16} color="#fff"/> Panel de control y alertas</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><Check size={16} color="#fff"/> Soporte dedicado y marca blanca</li>
                        </ul>
                        <button style={{ width: '100%', padding: '12px', background: '#fff', border: 'none', borderRadius: '8px', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>Contactar Ventas</button>
                      </div>
                    </div>
                  </>
              ) : infoModal === 'advertising_prices' ? (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                      <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        Servicios y precios para promocionar tu comercio frente a pasajeros locales todos los días.
                      </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>¿Qué ofrecemos?</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                          <strong style={{ color: 'var(--accent)', fontSize: '1.05rem', display: 'block', marginBottom: '8px' }}>📌 Pin Patrocinado en el Mapa</strong>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', display: 'block' }}>Tu local aparecerá destacado directamente en el mapa interactivo por donde circulan las unidades. Alta visibilidad garantizada para comercios ubicados sobre las avenidas o rutas principales.</span>
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                          <strong style={{ color: 'var(--accent)', fontSize: '1.05rem', display: 'block', marginBottom: '8px' }}>🖼️ Banner Rotativo en la App</strong>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', display: 'block' }}>Un espacio gráfico exclusivo (carrusel publicitario) en la interfaz principal. Convierte visualizaciones en clientes permitiendo que los usuarios te contacten por WhatsApp con un solo clic.</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Nuestras Tarifas</h3>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🎉 ¡15% OFF contratando el trimestre!
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                      {/* Plan Medio Día */}
                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Plan Medio Día</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '24px' }}>
                          $120.000<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}> /mes</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Visibilidad 12hs (Mañana o Tarde)</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Pin Destacado en Mapa</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Banner Gráfico Rotativo</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Botón directo a WhatsApp</li>
                        </ul>
                      </div>

                      {/* Plan Jornada Completa */}
                      <div style={{ background: 'var(--bg-primary)', border: '2px solid var(--accent)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)' }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recomendado</div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Plan Jornada Completa</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '24px' }}>
                          $190.000<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}> /mes</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Visibilidad Total 24hs</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Máxima Prioridad de Rotación</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Pin Destacado + Banner</li>
                          <li style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}><Check size={16} color="var(--accent)"/> Botón WhatsApp + Redes Sociales</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '48px', textAlign: 'center', padding: '32px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>¿Listo para empezar?</h4>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Comunícate con nuestro equipo comercial para activar tu publicidad en menos de 24 horas.</p>
                      <a href="mailto:ventas@collietech.com" style={{ display: 'inline-flex', padding: '16px 32px', background: 'var(--accent)', color: '#fff', textDecoration: 'none', borderRadius: '30px', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        Contactar a Ventas
                      </a>
                    </div>
                  </>
              ) : infoModal === 'privacy' ? (
                <>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>1. Recopilación de Información</h3>
                  <p style={{ marginBottom: '16px' }}>CollieTech recopila información de manera anónima relacionada con tu dispositivo, ubicación general y patrones de uso al utilizar la aplicación "Por dónde viene" y los servicios de Collie Mobility. Esta información incluye, pero no se limita a, la dirección IP, tipo de navegador, sistema operativo y las rutas consultadas.</p>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>2. Uso de la Información</h3>
                  <p style={{ marginBottom: '16px' }}>La información recopilada es utilizada de forma agregada para:</p>
                  <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    <li style={{ marginBottom: '8px' }}>Mejorar la precisión de las predicciones de llegada y los horarios del transporte público.</li>
                    <li style={{ marginBottom: '8px' }}>Realizar análisis de tráfico, frecuencias y estadísticas operativas del transporte metropolitano.</li>
                    <li style={{ marginBottom: '8px' }}>Diagnosticar problemas técnicos y mejorar el rendimiento de nuestra infraestructura.</li>
                  </ul>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>3. Privacidad y Seguridad</h3>
                  <p style={{ marginBottom: '16px' }}>Nos comprometemos a proteger tus datos. Aplicamos medidas de seguridad técnicas y organizativas para proteger la información contra acceso no autorizado, pérdida o alteración. No vendemos ni compartimos tu información personal identificable con terceros bajo ninguna circunstancia, salvo cuando sea requerido estrictamente por la ley aplicable o las autoridades competentes.</p>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>4. Proveedores de Terceros</h3>
                  <p style={{ marginBottom: '16px' }}>Nuestra plataforma puede utilizar servicios de terceros (ej. Google Maps) para proveer mapas y rutas. Estos servicios pueden recopilar información propia sujeta a sus respectivas políticas de privacidad.</p>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>5. Tus Derechos</h3>
                  <p style={{ marginBottom: '16px' }}>Tienes el derecho a desactivar los permisos de ubicación en cualquier momento desde la configuración de tu sistema operativo o navegador web. Ten en cuenta que esto podría limitar ciertas funcionalidades de la plataforma orientadas a mostrar datos geolocalizados en tiempo real.</p>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>1. Aceptación de los Términos</h3>
                  <p style={{ marginBottom: '16px' }}>Al acceder y utilizar la plataforma "Por dónde viene", administrada por CollieTech ("nosotros", "la Empresa"), aceptas estar sujeto a los presentes Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra plataforma.</p>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>2. Naturaleza del Servicio ("As-Is")</h3>
                  <p style={{ marginBottom: '16px' }}>Nuestro servicio proporciona estimaciones de horarios e información de recorridos en base a datos de simulación y sistemas de terceros. Todo el servicio se proporciona "tal cual" (As-Is) y "según disponibilidad". No ofrecemos ninguna garantía, expresa o implícita, sobre la exactitud, puntualidad, o fiabilidad de los horarios mostrados.</p>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>3. Limitación de Responsabilidad</h3>
                  <p style={{ marginBottom: '16px' }}>En la máxima medida permitida por la ley aplicable, CollieTech y sus directores, empleados o afiliados, no serán responsables bajo ninguna circunstancia de cualquier daño directo, indirecto, incidental, o consecuente derivado de:</p>
                  <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    <li style={{ marginBottom: '8px' }}>El uso o la imposibilidad de usar el servicio.</li>
                    <li style={{ marginBottom: '8px' }}>Retrasos, pérdida de tiempo, llegadas tardías, o lucro cesante originados por imprecisiones en los horarios previstos.</li>
                    <li style={{ marginBottom: '8px' }}>Interrupciones del servicio por mantenimiento, fallos técnicos, o causas de fuerza mayor (ej. clima, tráfico, huelgas).</li>
                  </ul>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>4. Uso Aceptable y Restricciones</h3>
                  <p style={{ marginBottom: '16px' }}>Esta aplicación se proporciona únicamente para el uso personal e informativo del pasajero. Queda terminantemente prohibido:</p>
                  <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    <li style={{ marginBottom: '8px' }}>El uso comercial, reventa o redistribución de nuestra información.</li>
                    <li style={{ marginBottom: '8px' }}>La extracción masiva de datos (web scraping), ingeniería inversa, o el uso de bots y crawlers sobre nuestros endpoints públicos o privados.</li>
                    <li style={{ marginBottom: '8px' }}>Intentar vulnerar la seguridad, estabilidad o disponibilidad de nuestra infraestructura.</li>
                  </ul>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>5. Propiedad Intelectual</h3>
                  <p style={{ marginBottom: '16px' }}>Todo el código fuente, diseño, bases de datos, marcas registradas ("Collie Mobility", "CollieTech") y logotipos asociados al servicio son propiedad exclusiva de la Empresa. El acceso al servicio no otorga ninguna licencia sobre estos activos intelectuales.</p>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '12px' }}>6. Modificaciones de los Términos</h3>
                  <p style={{ marginBottom: '16px' }}>Nos reservamos el derecho de modificar estos términos en cualquier momento, con o sin previo aviso. El uso continuado del servicio tras la publicación de cualquier cambio implicará tu aceptación tácita de los nuevos términos.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
