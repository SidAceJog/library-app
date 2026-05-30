import { useRef, useState } from 'react'

interface PhotoCaptureProps {
  onCapture: (file: File) => void
}

export default function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    onCapture(file)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Book Photo (for catalog)
      </label>

      {preview ? (
        <div className="relative">
          <img src={preview} alt="Book preview" className="w-full max-h-48 object-contain rounded-md border" />
          <button
            onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
          >
            Retake
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          data-testid="photo-capture-button"
          className="w-full rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          📷 Tap to take photo of book
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
