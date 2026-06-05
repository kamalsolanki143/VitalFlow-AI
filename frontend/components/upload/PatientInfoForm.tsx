'use client'

import { ChevronDown } from 'lucide-react'

export interface PatientInfo {
  patient_name: string
  patient_age: string
  patient_id: string
  report_type: string
  referring_doctor: string
}

interface PatientInfoFormProps {
  values: PatientInfo
  onChange: (values: PatientInfo) => void
}

const REPORT_TYPES = ['Blood Test', 'ECG', 'MRI', 'CT Scan', 'X-Ray', 'Other']

function Field({
  id,
  label,
  children,
  required,
}: {
  id: string
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: 6,
        }}
      >
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export default function PatientInfoForm({ values, onChange }: PatientInfoFormProps) {
  const set = (key: keyof PatientInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...values, [key]: e.target.value })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Field id="patient-name" label="Patient Name" required>
        <input
          id="patient-name"
          className="vf-input"
          type="text"
          placeholder="Full name"
          value={values.patient_name}
          onChange={set('patient_name')}
        />
      </Field>

      <Field id="patient-age" label="Patient Age" required>
        <input
          id="patient-age"
          className="vf-input"
          type="number"
          min={0}
          max={130}
          placeholder="Years"
          value={values.patient_age}
          onChange={set('patient_age')}
        />
      </Field>

      <Field id="patient-id" label="Patient ID" required>
        <input
          id="patient-id"
          className="vf-input"
          type="text"
          placeholder="e.g. PID-1042"
          value={values.patient_id}
          onChange={set('patient_id')}
        />
      </Field>

      <Field id="report-type" label="Report Type" required>
        <div style={{ position: 'relative' }}>
          <select
            id="report-type"
            className="vf-input"
            style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
            value={values.report_type}
            onChange={set('report_type')}
          >
            <option value="">Select type...</option>
            {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </Field>

      <Field id="referring-doctor" label="Referring Doctor" required>
        <input
          id="referring-doctor"
          className="vf-input"
          type="text"
          placeholder="Dr. Name"
          value={values.referring_doctor}
          onChange={set('referring_doctor')}
          style={{ gridColumn: '1 / -1' }}
        />
      </Field>
    </div>
  )
}
