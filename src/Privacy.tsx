import React from 'react';
import './index.css';

export default function Privacy() {
    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            background: "var(--bg-primary, #0a0a0f)",
            color: "var(--text-primary, #f1f5f9)",
            lineHeight: 1.6,
            padding: "2rem",
            maxWidth: "800px",
            margin: "0 auto",
            minHeight: "100vh"
        }}>
            <div style={{
                textAlign: "center",
                marginBottom: "3rem",
                paddingBottom: "2rem",
                borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.06))"
            }}>
                <h1 style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    background: "linear-gradient(to right, #60a5fa, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>Política de Privacidad</h1>
                <p style={{ color: "var(--text-secondary, #94a3b8)", fontSize: "0.9rem" }}>
                    Última actualización: 2 de mayo de 2026
                </p>
            </div>

            <div style={{
                background: "var(--bg-secondary, #12121a)",
                border: "1px solid var(--border, rgba(255, 255, 255, 0.06))",
                borderRadius: "12px",
                padding: "2rem",
                marginBottom: "2rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
            }}>
                <p style={{ color: "var(--text-secondary, #94a3b8)", marginBottom: "2rem" }}>
                    En <strong>¿Por dónde viene?</strong> (Transporte Zárate), valoramos su privacidad y la seguridad de sus datos. En cumplimiento con la <strong>Ley N° 25.326</strong> de Protección de Datos Personales de la República Argentina, esta Política de Privacidad describe cómo recolectamos, usamos y protegemos la información.
                </p>

                <div style={{
                    background: "rgba(251, 191, 36, 0.1)",
                    border: "1px solid rgba(251, 191, 36, 0.2)",
                    color: "#fbbf24",
                    padding: "1rem",
                    borderRadius: "12px",
                    margin: "2rem 0",
                    fontSize: "0.9rem"
                }}>
                    <strong>AVISO IMPORTANTE:</strong> Esta aplicación es una herramienta de monitoreo y logística de transporte. Los datos de ubicación mostrados corresponden a las unidades de transporte público (colectivos), no al dispositivo del usuario, a menos que el usuario lo permita explícitamente para ver su posición en el mapa.
                </div>

                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary, #f1f5f9)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ display: "inline-block", width: "8px", height: "8px", background: "var(--accent, #3b82f6)", borderRadius: "50%" }}></span>
                        1. Información que recopilamos
                    </h2>
                    <p style={{ color: "var(--text-secondary, #94a3b8)", marginBottom: "1rem" }}>La aplicación principal funciona como un visor de telemetría y recopila:</p>
                    <ul style={{ listStyle: "none", paddingLeft: "1.5rem", color: "var(--text-secondary, #94a3b8)" }}>
                        <li style={{ position: "relative", marginBottom: "0.5rem" }}>
                            <span style={{ position: "absolute", left: "-1.5rem", color: "var(--accent, #3b82f6)" }}>→</span>
                            <strong>Datos de Ubicación (Unidades de Transporte):</strong> Recopilamos y mostramos la ubicación de las unidades que están transmitiendo telemetría en tiempo real.
                        </li>
                        <li style={{ position: "relative", marginBottom: "0.5rem" }}>
                            <span style={{ position: "absolute", left: "-1.5rem", color: "var(--accent, #3b82f6)" }}>→</span>
                            <strong>Ubicación del Usuario (Opcional):</strong> Si usted otorga permisos de ubicación en su dispositivo, la aplicación utilizará su GPS únicamente para mostrar su posición en el mapa localmente. <strong>Esta ubicación no se almacena ni se transmite a nuestros servidores.</strong>
                        </li>
                        <li style={{ position: "relative", marginBottom: "0.5rem" }}>
                            <span style={{ position: "absolute", left: "-1.5rem", color: "var(--accent, #3b82f6)" }}>→</span>
                            <strong>Datos de análisis y rendimiento:</strong> Recopilamos información anónima sobre fallos y rendimiento de la app para mejorar la estabilidad.
                        </li>
                    </ul>
                </div>

                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary, #f1f5f9)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ display: "inline-block", width: "8px", height: "8px", background: "var(--accent, #3b82f6)", borderRadius: "50%" }}></span>
                        2. Uso de la Información
                    </h2>
                    <ul style={{ listStyle: "none", paddingLeft: "1.5rem", color: "var(--text-secondary, #94a3b8)" }}>
                        <li style={{ position: "relative", marginBottom: "0.5rem" }}><span style={{ position: "absolute", left: "-1.5rem", color: "var(--accent, #3b82f6)" }}>→</span> Visualizar los colectivos y recorridos en tiempo real sobre el mapa.</li>
                        <li style={{ position: "relative", marginBottom: "0.5rem" }}><span style={{ position: "absolute", left: "-1.5rem", color: "var(--accent, #3b82f6)" }}>→</span> Proporcionar publicidad local segmentada (banners de comercios de la zona).</li>
                        <li style={{ position: "relative", marginBottom: "0.5rem" }}><span style={{ position: "absolute", left: "-1.5rem", color: "var(--accent, #3b82f6)" }}>→</span> Mejorar la precisión y rendimiento de nuestra plataforma.</li>
                    </ul>
                </div>

                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary, #f1f5f9)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ display: "inline-block", width: "8px", height: "8px", background: "var(--accent, #3b82f6)", borderRadius: "50%" }}></span>
                        3. Seguridad de los Datos
                    </h2>
                    <p style={{ color: "var(--text-secondary, #94a3b8)", marginBottom: "1rem" }}>
                        Implementamos medidas técnicas y de seguridad en la infraestructura de la nube (AWS) para proteger las conexiones entre la aplicación y nuestros servidores mediante protocolos seguros (HTTPS/SSL).
                    </p>
                </div>

                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary, #f1f5f9)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ display: "inline-block", width: "8px", height: "8px", background: "var(--accent, #3b82f6)", borderRadius: "50%" }}></span>
                        4. Contacto
                    </h2>
                    <p style={{ color: "var(--text-secondary, #94a3b8)", marginBottom: "1rem" }}>
                        Para cualquier consulta legal o relacionada con esta política de privacidad, por favor contáctenos a: <br/>
                        <a href="mailto:soporte@pordondeviene.com.ar" style={{ color: "var(--accent, #3b82f6)", textDecoration: "none" }}>soporte@pordondeviene.com.ar</a>
                    </p>
                </div>
            </div>

            <div style={{
                textAlign: "center",
                color: "var(--text-secondary, #94a3b8)",
                fontSize: "0.85rem",
                marginTop: "3rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.06))"
            }}>
                <p>Al utilizar ¿Por dónde viene?, usted acepta los términos descritos en esta política de privacidad.</p>
                <p style={{ marginTop: "1rem" }}>© 2026 ¿Por dónde viene?. Todos los derechos reservados.</p>
            </div>
        </div>
    );
}
