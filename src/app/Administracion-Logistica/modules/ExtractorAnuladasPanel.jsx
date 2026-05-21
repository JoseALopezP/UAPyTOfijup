'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExtractorAnuladasPanel() {
    const router = useRouter();
    const [cardHover, setCardHover] = useState(false);
    const [btnHover, setBtnHover] = useState(false);

    return (
        <div 
            onMouseEnter={() => setCardHover(true)}
            onMouseLeave={() => setCardHover(false)}
            style={{
                padding: '32px 24px',
                maxWidth: '800px',
                background: 'linear-gradient(135deg, #1b1b22 0%, #121216 100%)',
                borderRadius: '16px',
                color: '#e2e8f0',
                margin: '20px auto',
                boxShadow: cardHover 
                    ? '0 12px 32px rgba(245, 158, 11, 0.15), 0 0 1px 1px rgba(245, 158, 11, 0.3)' 
                    : '0 8px 24px rgba(0,0,0,0.4), 0 0 1px 1px rgba(255,255,255,0.1)',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '380px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Glow Effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
                transform: cardHover ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.5s ease'
            }} />

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ 
                        fontSize: '32px',
                        transform: cardHover ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                        transition: 'transform 0.4s ease'
                    }}>⚖️</span>
                    <h2 style={{ 
                        margin: 0, 
                        color: '#f59e0b', 
                        fontSize: '22px', 
                        fontWeight: '700',
                        letterSpacing: '-0.025em'
                    }}>
                        Extractor de Solicitudes Anuladas
                    </h2>
                </div>

                <p style={{ 
                    color: '#94a3b8', 
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    margin: '0 0 20px 0' 
                }}>
                    Permite extraer de forma automatizada y paralela las solicitudes del sistema PUMA que tengan el estado de <strong>ANULADA</strong> y sean de tipo <strong>SUSPENSIÓN/MODIFICACIÓN</strong>. 
                </p>
                <p style={{ 
                    color: '#64748b', 
                    fontSize: '13px', 
                    margin: 0 
                }}>
                    Configura la fecha límite (Fecha Hasta) y la ruta de descarga directa del reporte y documentos en formato CSV o JSON.
                </p>
            </div>

            <div>
                <button
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    onClick={() => router.push('/Extractor-Anuladas')}
                    style={{
                        width: '100%',
                        padding: '14px 28px',
                        background: btnHover 
                            ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' 
                            : 'linear-gradient(90deg, #d97706 0%, #b45309 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '16px',
                        boxShadow: btnHover 
                            ? '0 0 20px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)' 
                            : '0 2px 6px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span>🚀 Iniciar Extractor</span>
                    <span style={{ 
                        transform: btnHover ? 'translateX(4px)' : 'translateX(0)', 
                        transition: 'transform 0.2s' 
                    }}>→</span>
                </button>
            </div>
        </div>
    );
}
