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
      .update({ led_status: status, updated_at: new Date().toISOString() })
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

  useEffect(() => { loadLedState() }, [])

  return (
    <div className="page">
      <main className="panel">

        {/* Header */}
        <div className="topbar">
          <div>
            <p className="eyebrow">simulación IoT</p>
            <h1>Control LED ESP32</h1>
            <p className="subtitle">Supabase · persistencia en tiempo real</p>
          </div>
          <div className={`status-badge ${ledOn ? 'online' : 'offline'}`}>
            {loading ? 'init...' : ledOn ? 'encendido' : 'apagado'}
          </div>
        </div>

        {/* Card */}
        <section className="card">

          {/* LED + info */}
          <div className={`led-section ${ledOn ? 'is-on' : ''}`}>
            <div className="led-info">
              <h2>estado del dispositivo</h2>
              <p className={`state-text ${ledOn ? 'is-on' : ''}`}>
                {loading ? 'load...' : ledOn ? 'ON' : 'OFF'}
              </p>
              <p className="helper-text">
                {saving
                  ? '// escribiendo en db...'
                  : '// estado persistido en supabase'}
              </p>
            </div>

            <div className={`led-shell ${ledOn ? 'on' : 'off'}`}>
              <div className="led-ring"></div>
              <div className={`led-core ${ledOn ? 'on' : 'off'}`}></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="actions">
            <button className="btn btn-on" onClick={() => updateLedState(true)} disabled={saving}>
              encender
            </button>
            <button className="btn btn-off" onClick={() => updateLedState(false)} disabled={saving}>
              apagar
            </button>
          </div>

          {/* Metadata */}
          <div className="footer-info">
            <div className="info-box">
              <span>dispositivo</span>
              <strong>esp32-led-1</strong>
            </div>
            <div className="info-box">
              <span>última sync</span>
              <strong>{lastUpdate || 'sin registro'}</strong>
            </div>
          </div>

        </section>
      </main>
    </div>
  )
}

export default App