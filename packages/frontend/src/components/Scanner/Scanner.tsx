import { useZxing } from 'react-zxing'
import './Scanner.css'

interface ScannerProps {
  onScan: (ean: string) => void
  onClose: () => void
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText())
    },
  })

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        <h2>Escanear código de barras</h2>
        <video ref={ref} className="scanner-video" />
        <button className="scanner-close" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}