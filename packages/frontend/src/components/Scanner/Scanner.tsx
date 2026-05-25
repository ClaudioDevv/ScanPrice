import { useEffect, useRef } from 'react'
import Quagga from '@ericblade/quagga2'
import './Scanner.css'

interface ScannerProps {
  onScan: (ean: string) => void
  onClose: () => void
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasScanned = useRef(false)

  useEffect(() => {
    let isMounted = true

    // Sacamos la función para poder removerla limpiamente en el cleanup
    const handleDetected = (result: any) => {
      const code = result.codeResult.code
      if (!code) return

      const errors = result.codeResult.decodedCodes
        .filter((x: any) => x.error !== undefined)
        .map((x: any) => x.error as number)
      
      const avgError = errors.reduce((a: number, b: number) => a + b, 0) / errors.length

      if (avgError < 0.15 && !hasScanned.current) {
        hasScanned.current = true
        onScan(code)
      }
    }

    async function initQuagga() {
      if (!containerRef.current) return

      // Espera a que el contenedor tenga dimensiones reales
      if (containerRef.current.offsetWidth === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (!isMounted) return // Si ya se desmontó en estos 100ms, abortamos
      }

      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            target: containerRef.current,
            constraints: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          decoder: {
            readers: ['ean_reader', 'ean_8_reader', 'upc_reader'],
          },
          locate: true,
          numOfWorkers: navigator.hardwareConcurrency || 4,
        },
        (err) => {
          if (err) {
            // Si se desmontó mientras calculaba las dimensiones, ignoramos el error
            if (isMounted) {
              console.error('Quagga init error:', err)
            }
            return
          }
          
          // CRUCIAL: Solo arrancamos si el componente sigue vivo en el DOM
          if (isMounted) {
            Quagga.start()
            Quagga.onDetected(handleDetected)
          } else {
            Quagga.stop()
          }
        }
      )
    }

    initQuagga()

    // Al desmontar, limpiamos TODO rigurosamente
    return () => {
      isMounted = false
      Quagga.offDetected(handleDetected)
      Quagga.stop()
    }
  }, [onScan])

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        <h2>Escanear código de barras</h2>
        <div ref={containerRef} className="scanner-video" />
        <button className="scanner-close" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}