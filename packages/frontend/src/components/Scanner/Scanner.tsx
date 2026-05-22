import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import './Scanner.css'

interface ScannerProps {
  onScan: (ean: string) => void
  onClose: () => void
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
      if (result) {
        onScan(result.getText())
        reader.reset()
      }
      if (err && err.name !== 'NotFoundException') {
        setError('Error al acceder a la cámara')
      }
    }).catch(() => setError('No se pudo acceder a la cámara'))

    return () => {
      reader.reset()
    }
  }, [])

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        <h2>Escanear código de barras</h2>
        {error ? (
          <p className="scanner-error">{error}</p>
        ) : (
          <video ref={videoRef} className="scanner-video" />
        )}
        <button className="scanner-close" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}