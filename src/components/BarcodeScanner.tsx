import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScan: (isbn: string) => void
  onError?: (error: string) => void
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [manualIsbn, setManualIsbn] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<string>('barcode-reader-' + Math.random().toString(36).slice(2))

  async function startScanning() {
    try {
      const scanner = new Html5Qrcode(containerRef.current)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (decodedText) => {
          // ISBN barcodes are EAN-13 (13 digits starting with 978 or 979)
          const cleaned = decodedText.replace(/[^0-9X]/gi, '')
          if (cleaned.length === 13 || cleaned.length === 10) {
            stopScanning()
            onScan(cleaned)
          }
        },
        () => {} // ignore scan failures (normal during scanning)
      )
      setScanning(true)
    } catch (err) {
      onError?.('Camera access denied or not available')
    }
  }

  function stopScanning() {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {})
    }
    setScanning(false)
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = manualIsbn.replace(/[^0-9X]/gi, '')
    if (cleaned.length === 13 || cleaned.length === 10) {
      onScan(cleaned)
      setManualIsbn('')
    } else if (manualIsbn.trim().toUpperCase().startsWith('PP-NOISBN-')) {
      onScan(manualIsbn.trim().toUpperCase())
      setManualIsbn('')
    } else {
      onError?.('Enter a valid ISBN (10 or 13 digits) or PP-NOISBN-XXX code')
    }
  }

  useEffect(() => {
    return () => { stopScanning() }
  }, [])

  return (
    <div className="space-y-4">
      {/* Camera scanner */}
      <div>
        <div id={containerRef.current} className="w-full rounded-lg overflow-hidden" />
        {!scanning ? (
          <button
            onClick={startScanning}
            data-testid="start-scan-button"
            className="w-full mt-2 rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700"
          >
            📷 Scan ISBN Barcode
          </button>
        ) : (
          <button
            onClick={stopScanning}
            data-testid="stop-scan-button"
            className="w-full mt-2 rounded-md bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {/* Manual entry fallback */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-2">Or enter ISBN manually:</p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            data-testid="manual-isbn-input"
            value={manualIsbn}
            onChange={(e) => setManualIsbn(e.target.value)}
            placeholder="ISBN or PP-NOISBN-XXX"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            data-testid="manual-isbn-submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  )
}
