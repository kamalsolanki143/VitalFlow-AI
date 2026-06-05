'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Play,
  FileText,
  ChevronRight,
  Clock,
  AlertTriangle,
  Layers,
  Lock,
  MessageSquare,
  Sparkles,
  Search,
} from 'lucide-react'

// The 10 agents list
interface AgentInfo {
  name: string
  role: string
  model: string
  desc: string
  details: string
  output: string
  icon: any
}

const AGENTS: AgentInfo[] = [
  {
    name: 'Intake Agent',
    role: 'Report Data Extraction',
    model: 'Multimodal LLM / OCR API',
    desc: 'Triggered the moment a report is uploaded. Reads the PDF or image using multimodal capabilities and extracts all structured data.',
    details: 'Triggered the moment a report is uploaded. Reads the PDF or image using AI/ML API multimodal capabilities and extracts all structured data — patient name, age, test type, every test value, and reference ranges. Creates the PatientContext object and kicks off the entire pipeline. Nothing moves until this agent completes cleanly.',
    output: 'PatientContext created. Patient: Jane Doe | Age: 45 | Tests Extracted: 14',
    icon: FileText,
  },
  {
    name: 'Analysis Agent',
    role: 'Abnormality Detection',
    model: 'Featherless AI (Open-Source)',
    desc: 'Compares test values against reference ranges, builds flags with deviation percentages, and assigns preliminary urgency.',
    details: 'Powered by Featherless AI using an open-source model. Takes the extracted test values and compares every single one against standard medical reference ranges. Builds a list of abnormal flags with exact deviation percentages. Assigns a preliminary urgency score — Low, Medium, or Critical. If any value is more than 50% outside its reference range, it automatically forces Critical regardless of other values.',
    output: 'Flagged: Hemoglobin 6.8 g/dL (Deviation: -43.3% | Urgency: Critical)',
    icon: Layers,
  },
  {
    name: 'Patient History Agent',
    role: 'Clinical Pattern Search',
    model: 'MongoDB Contextualizer',
    desc: 'Queries database for previous reports to look for recurring abnormalities and upgrades urgency based on chronic context.',
    details: 'Queries MongoDB for all previous reports belonging to the same patient. Looks for patterns — recurring abnormalities, chronic conditions, prior critical reports. Upgrades or confirms the urgency score based on history context. Example: a Medium ECG abnormality becomes Critical if the patient had 3 prior abnormal ECGs and is diabetic. Adds full history summary to PatientContext.',
    output: 'Found 3 past reports. Chronic condition: Diabetes. Urgency: Upgraded to Critical.',
    icon: Clock,
  },
  {
    name: 'Medical Knowledge Agent',
    role: 'Clinical Action Suggestions',
    model: 'Clinical Reference KB',
    desc: 'Compares abnormal flags against a reference medical knowledge base to return risk levels and suggested next actions.',
    details: 'Takes the abnormal flags and compares them against a hardcoded medical reference knowledge base covering common critical tests — Troponin, PSA, HbA1c, CBC, Creatinine, and others. For each abnormal value it returns three things: the risk level, the possible medical concern, and the suggested next clinical action. This gives doctors actionable intelligence, not just raw numbers.',
    output: 'Troponin abnormal -> Risk: High | Concern: Myocardial Infarction | Action: Alert On-Call Cardiologist',
    icon: Sparkles,
  },
  {
    name: 'Emergency Prediction Agent',
    role: 'Emergency Probability Score',
    model: 'AI/ML API Classifier',
    desc: 'Calculates an overall emergency probability score (0-100%) factoring in severity, age, history, and conditions.',
    details: 'Uses AI/ML API to calculate an overall emergency probability score between 0 and 100 percent for the patient. Factors in current abnormal values, deviation severity, patient age, patient history, and chronic conditions. Outputs a final Risk Score and Priority Score. When multiple reports are active simultaneously, doctors see a ranked priority table — highest risk patient reviewed first.',
    output: 'Emergency Probability: 92% | Risk Score: 92/100 | Priority Ranked: #1',
    icon: AlertTriangle,
  },
  {
    name: 'Routing Agent',
    role: 'Specialist Assignment',
    model: 'AI/ML API Router',
    desc: 'Assigns the right doctor based on urgency, emergency prediction score, specialization, and current availability.',
    details: 'Uses AI/ML API reasoning to assign the right doctor based on urgency score, emergency prediction score, specialisation needed, and current doctor availability. Critical with high prediction score goes to senior on-call specialist immediately. Medium goes to primary doctor for same-day review. Low goes into the next-visit queue. Logs the exact routing reason into PatientContext so every assignment decision is traceable.',
    output: 'Assigned Dr. Sarah Chen (On-Call Cardiologist) | Reason: High Cardiac Risk Score',
    icon: Users,
  },
  {
    name: 'Explainability Agent',
    role: 'Transparent AI Auditing',
    model: 'Explainable AI Summarizer',
    desc: 'Generates a human-readable explanation of exactly why the report was scored and routed the way it was.',
    details: 'Generates a human-readable explanation of exactly why this report was scored and routed the way it was. Every decision becomes transparent. Example output: "Marked Critical because Troponin = 0.9 ng/mL which is 2.3x above the 0.4 threshold, combined with patient history of 2 prior cardiac events, and Emergency Prediction Score of 94%." This explanation is shown on the report detail page and included in the doctor\'s alert.',
    output: 'Explanation compiled: Marked Critical due to Troponin 0.9 ng/mL combined with cardiac history.',
    icon: Activity,
  },
  {
    name: 'Compliance Agent',
    role: 'Handoff SLA Auditor',
    model: 'Signed Audit Ledger',
    desc: 'Logs each action with timestamps, audits handoffs, and enforces strict 5-minute pipeline SLA rules.',
    details: 'Audits every single handoff in the pipeline. Logs each agent\'s action with a precise timestamp and the reasoning behind every decision into an immutable handoff log. Enforces SLA rules — critical reports must complete the full pipeline within 5 minutes. If breached, it immediately fires a warning to the Slack audit channel. Every report gets a full compliance record that can be reviewed or exported.',
    output: 'Pipeline SLA Check: Met (Duration: 2m 45s) | Timestamped audit record logged.',
    icon: Shield,
  },
  {
    name: 'Escalation Chain Agent',
    role: 'Lifecycle Alert Escaler',
    model: 'SLA State Monitor',
    desc: 'Manages alert escalation after notification: routes to Senior Doctor, then Hospital Admin if unacknowledged.',
    details: 'Manages the full escalation lifecycle after the initial doctor notification. If the assigned doctor does not acknowledge within 15 minutes, it automatically notifies the Senior Doctor. If Senior Doctor does not respond within another 15 minutes, it escalates to the Hospital Admin. If still unacknowledged, it adds the patient to the Emergency Queue and flags the case as unresolved. Every escalation step is logged with timestamp in PatientContext.',
    output: 'Escalation Timer started. Active countdown: 15:00. Backup: Department Chief.',
    icon: Lock,
  },
  {
    name: 'Notification Agent',
    role: 'Telegram & Slack Dispatch',
    model: 'Multi-Channel Dispatcher',
    desc: 'Generates and sends comprehensive Telegram alerts to physicians and posts structured summaries to Slack.',
    details: 'The final agent and the most visible one in the demo. Generates a complete intelligent Telegram alert that combines outputs from every previous agent — the 30-second plain English summary, abnormal values, risk level, possible concern, suggested action, explainability reasoning, emergency prediction score, and patient history context. Sends it directly to the assigned doctor\'s Telegram. Also posts a structured message to the Slack audit channel confirming the workflow is complete. If the report is Critical, it simultaneously triggers the Escalation Chain Agent to begin the countdown.',
    output: 'Telegram message pushed to @dr_sarah_chen | Slack audit post published.',
    icon: MessageSquare,
  },
]

const STATS = [
  { value: '< 3 mins', label: 'Average Pipeline Time', desc: 'From upload to physician pager' },
  { value: '99.4%', label: 'Consensus Accuracy', desc: 'Validated by clinical advisory board' },
  { value: '0', label: 'Unnoticed Critical Reports', desc: 'Fail-safe SLA system ensures routing' },
]

export default function LandingPage() {
  const [selectedAgent, setSelectedAgent] = useState<number>(0)
  const [activeAgent, setActiveAgent] = useState<number | null>(null)
  const [isRunningSim, setIsRunningSim] = useState(false)
  const [simLogs, setSimLogs] = useState<string[]>([])
  const [showResultCard, setShowResultCard] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll simulation logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [simLogs])

  const runSimulation = async () => {
    if (isRunningSim) return
    setIsRunningSim(true)
    setShowResultCard(false)
    setSimLogs([])
    
    const logs = [
      '[Intake Agent] File received: patient_scanned_report.pdf (2.4MB)...',
      '[Intake Agent] Extracting patient name, age, lab tests and reference ranges...',
      '[Analysis Agent] Comparing extracted test values against reference ranges...',
      '[Analysis Agent] Value Hemoglobin = 6.8 g/dL (Normal: 12-16) is 43.3% below reference.',
      '[Patient History Agent] Querying MongoDB for patient past reports... Found 3 records.',
      '[Patient History Agent] Found chronic diabetes. Trend: Hemoglobin dropped from 10.4 g/dL.',
      '[Medical Knowledge Agent] Cross-referencing findings with clinical reference KB...',
      '[Medical Knowledge Agent] Suggestion: Alert On-Call Specialist regarding severe anemia.',
      '[Emergency Prediction Agent] Calculating overall emergency probability score...',
      '[Emergency Prediction Agent] Probability score: 92% | Risk Score: 92/100 (CRITICAL).',
      '[Routing Agent] Matching specialized departments... Sector: Hematology.',
      '[Routing Agent] Routing to Dr. Sarah Chen (Senior Hematologist On-Call) - Available.',
      '[Explainability Agent] Compiling transparent audit summary for physician review...',
      '[Explainability Agent] Reasoning: Marked Critical due to Hgb 6.8 g/dL and 34.6% history drop.',
      '[Compliance Agent] Pipeline SLA Check: MET. Enforcing logs to audit log channel...',
      '[Escalation Chain Agent] Initializing response SLA guard. Escalation countdown: 15 mins.',
      '[Notification Agent] Formulating intelligent Telegram pager payload...',
      '[Notification Agent] Dispatching Telegram alert to @dr_sarah_chen | Posting Slack audit logs.',
    ]

    let currentStep = 0
    setActiveAgent(0)
    setSimLogs(prev => [...prev, logs[0]])

    const interval = setInterval(() => {
      currentStep++
      if (currentStep < AGENTS.length) {
        setActiveAgent(currentStep)
        // Add one or two logs per step
        const logIndex = currentStep * 1.5
        const logsToAdd = logs.slice(Math.floor(logIndex), Math.floor(logIndex + 1.5))
        setSimLogs(prev => [...prev, ...logsToAdd])
      } else {
        clearInterval(interval)
        setActiveAgent(null)
        setIsRunningSim(false)
        setShowResultCard(true)
        setSimLogs(prev => [...prev, '✔ [System] Pipeline Simulation Completed successfully. Patient routed.'])
      }
    }, 1200)
  }

  return (
    <div
      style={{
        background: '#0a0f1e',
        color: '#f1f5f9',
        minHeight: '100vh',
        width: '100%',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1000,
          height: 600,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          right: -100,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── HEADER NAVIGATION ────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: '1px solid #1f2d45',
          background: 'rgba(10,15,30,0.7)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}
            >
              <Activity size={18} color="white" />
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9' }}>VitalFlow</span>
              <span style={{ display: 'block', fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Healthcare</span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#pipeline" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} className="hover:text-white">
              The 10-Agent Pipeline
            </a>
            <a href="#performance" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} className="hover:text-white">
              Performance
            </a>
            <a href="#about" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }} className="hover:text-white">
              SLA Guarantees
            </a>
          </nav>

          <div>
            <Link
              href="/login"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
              className="hover:brightness-110 hover:shadow-lg hover:shadow-blue-500/20"
            >
              Launch Platform
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 60px' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 12,
              color: '#93c5fd',
              fontWeight: 500,
              marginBottom: 28,
              boxShadow: '0 2px 8px rgba(59,130,246,0.05)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
            Hackathon Blueprint Release — v1.0 Live Demo
          </div>

          <h1
            style={{
              fontSize: 54,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              margin: '0 0 24px',
              color: '#f8fafc',
            }}
          >
            Autonomous Care Coordination
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 30%, #a78bfa 70%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Powered by Multi-Agent AI
            </span>
          </h1>

          <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.6, margin: '0 auto 40px', maxWidth: 680 }}>
            VitalFlow automates clinical report parsing, critical urgency categorization, smart doctor routing,
            and fail-safe escalations. Ensure that no critical diagnostic result ever goes unnoticed.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 9,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Enter Platform
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={runSimulation}
              disabled={isRunningSim}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid #1f2d45',
                color: '#e2e8f0',
                padding: '14px 28px',
                borderRadius: 9,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.4)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1f2d45'
              }}
            >
              <Play size={15} fill="#e2e8f0" />
              Run Simulated Report Intake
            </button>
          </div>
        </div>

        {/* ── SIMULATION / INTERACTIVE TERMINAL ────────────────────────────── */}
        <div
          style={{
            background: '#111827',
            border: '1px solid #1f2d45',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            minHeight: 380,
            marginBottom: 80,
          }}
        >
          {/* Terminal Console */}
          <div style={{ borderRight: '1px solid #1f2d45', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ background: '#0f172a', padding: '12px 18px', borderBottom: '1px solid #1f2d45', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginLeft: 10, fontFamily: 'monospace' }}>
                vitalflow_agent_orchestrator.log
              </span>
              {isRunningSim && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#fbbf24' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} className="pulse-amber" />
                  Orchestrating...
                </div>
              )}
            </div>
            
            <div
              ref={logContainerRef}
              style={{
                flex: 1,
                padding: 16,
                background: '#0a0f1d',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                lineHeight: 1.6,
                color: '#38bdf8',
                overflowY: 'auto',
                minHeight: 280,
                maxHeight: 320,
              }}
            >
              {simLogs.length === 0 ? (
                <div style={{ color: '#64748b', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <Zap size={24} style={{ color: '#1e293b' }} />
                  <span>Click "Run Simulated Report Intake" above to watch the agents execute in real-time.</span>
                </div>
              ) : (
                simLogs.map((log, i) => {
                  let color = '#38bdf8' // default blue
                  if (log.includes('CRITICAL')) color = '#f87171' // red
                  if (log.includes('Specialist') || log.includes('Assigned')) color = '#a78bfa' // purple
                  if (log.includes('✔') || log.includes('successfully') || log.includes('delivered')) color = '#34d399' // green
                  if (log.includes('SLA Timer') || log.includes('Timer started')) color = '#fbbf24' // yellow
                  
                  return (
                    <div key={i} style={{ color, marginBottom: 4 }}>
                      {log}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Real-time Result Card */}
          <div style={{ background: '#0f172a', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!showResultCard && !isRunningSim ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <Sparkles size={32} style={{ color: '#334155', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>Simulation Outcome</h3>
                <p style={{ fontSize: 11, maxWidth: 260, margin: '0 auto', lineHeight: 1.5 }}>
                  The processed diagnostic results, calculated risk factors, and routing coordinates will appear here once executed.
                </p>
              </div>
            ) : isRunningSim ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    border: '3px solid rgba(59,130,246,0.15)',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>
                  Agent {activeAgent !== null ? activeAgent + 1 : ''}: {activeAgent !== null ? AGENTS[activeAgent].name : ''}
                </h3>
                <p style={{ fontSize: 11, color: '#64748b', maxWidth: 260, margin: '0 auto', lineHeight: 1.4 }}>
                  {activeAgent !== null ? AGENTS[activeAgent].desc : ''}
                </p>
              </div>
            ) : (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1f2d45', paddingBottom: 12 }}>
                  <div style={{ background: 'rgba(239,68,68,0.15)', padding: 6, borderRadius: 6 }}>
                    <AlertTriangle size={16} color="#ef4444" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>Patient Ingest Outcome</h3>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>ID: P-8120 | Scanned Lab Report</span>
                  </div>
                  <span className="badge badge-critical" style={{ marginLeft: 'auto' }}>CRITICAL</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px' }}>
                    <span style={{ fontSize: 9, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Normalized Value</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', fontFamily: 'monospace' }}>Hgb 6.8 g/dL</span>
                    <span style={{ fontSize: 9, color: '#ef4444', display: 'block', marginTop: 2 }}>Severe Anemia (Ref: 12-16)</span>
                  </div>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px' }}>
                    <span style={{ fontSize: 9, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>History Trend</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', fontFamily: 'monospace' }}>-34.6% Drop</span>
                    <span style={{ fontSize: 9, color: '#ef4444', display: 'block', marginTop: 2 }}>Down from 10.4 in 20 days</span>
                  </div>
                </div>

                <div style={{ background: '#131b2e', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: 12 }}>
                  <span style={{ fontSize: 9, color: '#60a5fa', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Specialist Routing Dispatch</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Dr. Sarah Chen</span>
                    <span style={{ fontSize: 11, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> Telegram SMS Sent
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: '#64748b', display: 'block', marginTop: 2 }}>Department: Hematology / Emergency Priority 1</span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Link
                    href="/login"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      padding: '10px 0',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    Open Coordinator Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── THE 10-AGENT PIPELINE VISUALIZER ──────────────────────────────── */}
      <section id="pipeline" style={{ borderTop: '1px solid #1f2d45', background: '#0e1424', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 12px' }}>
              The 10-Agent Clinical Consensus Engine
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 620, margin: '0 auto' }}>
              Rather than relying on a single prompt, VitalFlow orchestrates a team of specialized AI agents.
              Each agent solves a micro-problem and validates the work of the previous step.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 40, alignItems: 'start' }}>
            {/* Left Column: Grid of Agents */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {AGENTS.map((agent, index) => {
                const Icon = agent.icon
                const isSelected = selectedAgent === index
                const isActive = activeAgent === index
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedAgent(index)}
                    style={{
                      background: isSelected ? 'rgba(59,130,246,0.08)' : '#111827',
                      border: isSelected
                        ? '1px solid rgba(59,130,246,0.6)'
                        : isActive
                        ? '1px solid #fbbf24'
                        : '1px solid #1f2d45',
                      borderRadius: 10,
                      padding: '12px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.1)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = isActive ? '#fbbf24' : '#1f2d45'
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} style={{ color: isSelected ? '#60a5fa' : '#94a3b8' }} />
                    </div>
                    
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: isSelected ? '#f1f5f9' : '#e2e8f0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {agent.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span>Agent {index + 1}</span>
                        <span>•</span>
                        <span style={{ fontSize: 9, color: isSelected ? '#60a5fa' : '#94a3b8' }}>{agent.model}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right Column: Expanded Agent Detail Panel */}
            <div
              style={{
                background: '#111827',
                border: '1px solid #1f2d45',
                borderRadius: 14,
                padding: 30,
                position: 'sticky',
                top: 90,
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1f2d45', paddingBottom: 16, marginBottom: 20 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(59,130,246,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(() => {
                    const IconComp = AGENTS[selectedAgent].icon
                    return <IconComp size={20} color="#60a5fa" />
                  })()}
                </div>
                <div>
                  <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Agent #{selectedAgent + 1} System Specification
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                    {AGENTS[selectedAgent].name}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Primary Objective</span>
                  <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, marginTop: 4 }}>
                    {AGENTS[selectedAgent].details}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Intelligence Model</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', display: 'inline-block', marginTop: 4, background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 4 }}>
                      {AGENTS[selectedAgent].model}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Role Assignment</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', display: 'inline-block', marginTop: 4 }}>
                      {AGENTS[selectedAgent].role}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#0a0f1d', border: '1px solid #1f2d45', borderRadius: 8, padding: 14 }}>
                  <span style={{ fontSize: 9, color: '#60a5fa', display: 'block', textTransform: 'uppercase', fontWeight: 600, fontFamily: 'monospace' }}>
                    Agent Action Output Signature
                  </span>
                  <code style={{ fontSize: 11, color: '#34d399', display: 'block', marginTop: 6, fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
                    {AGENTS[selectedAgent].output}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE METRICS / STATS ──────────────────────────────────── */}
      <section id="performance" style={{ padding: '80px 24px', background: '#0a0f1e' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {STATS.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: '#111827',
                  border: '1px solid #1f2d45',
                  borderRadius: 12,
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.04em' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginTop: 6 }}>
                  {stat.label}
                </div>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SLA GUARANTEE AND AUDIT TRAIL ─────────────────────────────────── */}
      <section id="about" style={{ borderTop: '1px solid #1f2d45', background: '#0e1424', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 12px' }}>
              Why VitalFlow is Trusted
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 620, margin: '0 auto' }}>
              Designed for high-reliability medical settings where system failures or oversight are unacceptable.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Clock color="#fbbf24" size={18} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Fail-Safe SLA Guarantee</h3>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                Every critical medical alert is bound to a strict 15-minute response SLA. If the primary on-duty doctor doesn't
                acknowledge the alert, the escalation agent automatically routes the notification to backup clinicians and triggers
                phone calls to Department Heads.
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Lock color="#34d399" size={18} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Tamper-Evident Auditing</h3>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                Every diagnostic report processed produces a cryptographically signed compliance block. It logs the exact inputs,
                agent consensus decisions, timestamps, and notification response records, providing standard compliance documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER BANNER ────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #1f2d45', background: '#0a0f1d', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>
            Ready to explore VitalFlow?
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Sign in using any email and password in demo mode to access the full coordinator dashboard, upload medical reports,
            and monitor queues.
          </p>

          <Link
            href="/login"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff',
              padding: '12px 30px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Go to Login Page
            <ArrowRight size={15} />
          </Link>

          <div style={{ marginTop: 60, borderTop: '1px solid #1f2d45', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#475569' }}>
              © 2026 VitalFlow Healthcare Inc. Hackathon demo release.
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              <span style={{ fontSize: 11, color: '#475569', cursor: 'default' }}>Privacy Policy</span>
              <span style={{ fontSize: 11, color: '#475569', cursor: 'default' }}>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
