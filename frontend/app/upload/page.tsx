'use client'

import { useState } from 'react'
import { uploadReport } from '@/lib/api'
import { UploadResponse } from '@/lib/types'
import UploadZone from '@/components/upload/UploadZone'
import PatientInfoForm, { PatientInfo } from '@/components/upload/PatientInfoForm'
import UploadProgress from '@/components/upload/UploadProgress'
import { Zap, RotateCcw } from 'lucide-react'

const EMPTY_FORM: PatientInfo = {
  patient_name: '',
  patient_age: '',
  patient_id: '',
  report_type: '',
  referring_doctor: '',
}

// Three distinct states: 'form' → 'processing' → 'done'
type PageState = 'form' | 'processing' | 'done'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState<PatientInfo>(EMPTY_FORM)
  const [pageState, setPageState] = useState<PageState>('form')
  const [response, setResponse] = useState<UploadResponse | null>(null)

  const isFormValid =
    file !== null &&
    form.patient_name.trim() !== '' &&
    form.patient_age !== '' &&
    form.patient_id.trim() !== '' &&
    form.report_type !== '' &&
    form.referring_doctor.trim() !== ''

  const handleSubmit = async () => {
    if (!isFormValid || !file) return

    // Immediately switch to processing view — animation starts right away
    setPageState('processing')

    const res = await uploadReport({
      file,
      patient_name: form.patient_name,
      patient_age: parseInt(form.patient_age),
      patient_id: form.patient_id,
      report_type: form.report_type,
      referring_doctor: form.referring_doctor,
    })

    setResponse(res)
    setPageState('done')
  }

  const handleReset = () => {
    setFile(null)
    setForm(EMPTY_FORM)
    setResponse(null)
    setPageState('form')
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  if (pageState === 'form') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Upload Zone */}
        <div className="vf-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Diagnostic Report File
          </h2>
          <UploadZone file={file} onFileChange={setFile} />
        </div>

        {/* Patient Info */}
        <div className="vf-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Patient Information
          </h2>
          <PatientInfoForm values={form} onChange={setForm} />
        </div>

        {/* Submit */}
        <button
          id="analyze-report-btn"
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '12px',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
          }}
          disabled={!isFormValid}
          onClick={handleSubmit}
        >
          <Zap size={16} />
          Analyze Report
        </button>

        {!isFormValid && (
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: -10 }}>
            Upload a file and fill all required fields to proceed
          </p>
        )}
      </div>
    )
  }

  // ── Processing / Done view ─────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {/* Left: submitted form (read-only, dimmed) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="vf-card" style={{ padding: 24, opacity: 0.65 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Diagnostic Report File
          </h2>
          <UploadZone file={file} onFileChange={() => {}} />
        </div>
        <div className="vf-card" style={{ padding: 24, opacity: 0.65 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Patient Information
          </h2>
          <PatientInfoForm values={form} onChange={() => {}} />
        </div>
      </div>

      {/* Right: animated progress */}
      <div>
        {/* Pass `isStarted=true` immediately so animation begins right away */}
        <UploadProgress isStarted={pageState === 'processing' || pageState === 'done'} response={response} />
        {pageState === 'done' && (
          <button
            id="upload-new-btn"
            className="btn btn-ghost"
            style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
            onClick={handleReset}
          >
            <RotateCcw size={13} />
            Upload Another Report
          </button>
        )}
      </div>
    </div>
  )
}
