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
                background: '#111115',
                borderRadius: '12px',
                color: '#e2e8f0',
                margin: '20px auto',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'all 0.3s ease',
                border: cardHover ? '1px solid #f59e0b' : '1px solid #2B2B2B',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '380px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ 
                        fontSize: '32px',
                        transform: cardHover ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.3s ease'
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
                        background: btnHover ? '#b45309' : '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
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
