import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

function App() {
  const [ledOn, setLedOn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('')

  const formatDate = (value) => {
    if (!value) return 'sin registro'
    return new Date(value).toLocaleString()
  }

  const loadLedState = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('device_state')
      .select('id, device_name, led_status, updated_at')
      .eq('device_name', 'esp32-led-1')
      .single()

    if (error) {
      console.error('Error al cargar estado:', error)
    } else {
      setLedOn(data.led_status)
      setLastUpdate(formatDate(data.updated_at))
    }

    setLoading(false)
  }

  const updateLedState = async (status) => {
    setSaving(true)

    const { data, error } = await supabase
      .from('device_state')
      .update({
        led_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('device_name', 'esp32-led-1')
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar estado:', error)
    } else {
      setLedOn(data.led_status)
      setLastUpdate(formatDate(data.updated_at))
    }

    setSaving(false)
  }

  useEffect(() => {
    loadLedState()
  }, [])

  return (
    <div className="page">
      <div className="background-glow glow-1"></div>
      <div className="background-glow glow-2"></div>

      <main className="panel">
        <div className="topbar">
          <div>
            <p className="eyebrow">simulación IoT</p>
            <h1>control de led esp32</h1>
            <p className="subtitle">
              interfaz web conectada a Supabase para persistir el estado del led
            </p>
          </div>

          <div className={`status-badge ${ledOn ? 'online' : 'offline'}`}>
            {loading ? 'cargando...' : ledOn ? 'encendido' : 'apagado'}
          </div>
        </div>

        <section className="card">
          <div className="led-section">
            <div className={`led-shell ${ledOn ? 'on' : 'off'}`}>
              <div className={`led-core ${ledOn ? 'on' : 'off'}`}></div>
            </div>

            <div className="led-info">
              <h2>estado actual</h2>
              <p className="state-text">
                {loading ? 'cargando estado...' : ledOn ? 'led encendido' : 'led apagado'}
              </p>

              <p className="helper-text">
                {saving
                  ? 'guardando cambio...'
                  : 'el estado se conserva aunque recargues la página'}
              </p>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn btn-on"
              onClick={() => updateLedState(true)}
              disabled={saving}
            >
              encender
            </button>

            <button
              className="btn btn-off"
              onClick={() => updateLedState(false)}
              disabled={saving}
            >
              apagar
            </button>
          </div>

          <div className="footer-info">
            <div className="info-box">
              <span>dispositivo</span>
              <strong>esp32-led-1</strong>
            </div>

            <div className="info-box">
              <span>última actualización</span>
              <strong>{lastUpdate || 'sin registro'}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App