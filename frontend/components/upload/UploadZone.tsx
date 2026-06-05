'use client'

import { useState, useCallback } from 'react'
import { Upload, File as FileIcon, X, CloudUpload } from 'lucide-react'

interface UploadZoneProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE_MB = 10

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadZone({ file, onFileChange }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const validateAndSet = useCallback((f: File) => {
    setError('')
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only PDF, JPG, and PNG files are accepted')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB`)
      return
    }
    onFileChange(f)
  }, [onFileChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSet(dropped)
  }, [validateAndSet])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) validateAndSet(selected)
  }

  return (
    <div>
      <label
        htmlFor="file-upload-input"
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          display: 'block',
          border: `2px dashed ${isDragging ? 'var(--accent)' : file ? '#22c55e' : 'var(--border)'}`,
          borderRadius: 12,
          padding: '40px 24px',
          textAlign: 'center',
          background: isDragging
            ? 'rgba(59,130,246,0.06)'
            : file
              ? 'rgba(34,197,94,0.04)'
              : 'var(--bg-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        {file ? (
          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <FileIcon size={24} color="#4ade80" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {file.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {formatFileSize(file.size)}
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CloudUpload size={24} color="var(--accent)" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Drag & drop your diagnostic report
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>click to browse</span>
            </div>
            <div style={{ fontSize: 11, color: '#334155', marginTop: 8 }}>
              PDF, JPG, PNG · Max {MAX_SIZE_MB}MB
            </div>
          </div>
        )}
      </label>

      {file && (
        <button
          id="remove-file-btn"
          className="btn btn-ghost btn-sm"
          onClick={() => onFileChange(null)}
          style={{ marginTop: 8, color: '#f87171' }}
        >
          <X size={12} />
          Remove file
        </button>
      )}

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#f87171' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  )
}
