// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // @ts-ignore
    onRegistered(r) {
      // Si quieres revisar actualizaciones cada X tiempo:
      console.log('SW Registered', r)
    },
    // @ts-ignore
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  if (!needRefresh) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '16px',
      right: '16px',
      background: 'var(--bg-card)',
      border: '2px solid var(--accent)',
      borderRadius: '12px',
      padding: '16px',
      zIndex: 9999,
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      animation: 'fadeInUp 0.3s ease-out'
    }}>
      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
        ¡Nueva versión disponible!
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Se ha descargado una actualización de la aplicación.
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button 
          onClick={() => updateServiceWorker(true)}
          style={{ flex: 1, padding: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Actualizar ahora
        </button>
        <button 
          onClick={close}
          style={{ flex: 1, padding: '10px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          Más tarde
        </button>
      </div>
    </div>
  )
}

export default ReloadPrompt
