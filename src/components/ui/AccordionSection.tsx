'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function AccordionSection({
  storageKey,
  title,
  icon,
  defaultOpen,
  children,
}: {
  storageKey: string
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const persisted = useMemo(() => {
    try { const v = localStorage.getItem(storageKey); return v === '1' ? true : v === '0' ? false : undefined } catch { return undefined }
  }, [storageKey])
  const [open, setOpen] = useState<boolean>(persisted ?? !!defaultOpen)
  const regionRef = useRef<HTMLDivElement>(null)
  const [maxH, setMaxH] = useState<number>(0)

  useEffect(() => {
    const el = regionRef.current
    if (!el) return
    setMaxH(el.scrollHeight)
  }, [children])

  useEffect(() => {
    try { localStorage.setItem(storageKey, open ? '1' : '0') } catch {}
  }, [storageKey, open])

  const regionId = `${storageKey.replace(/[^a-z0-9]+/gi,'-')}-region`
  const headerId = `${storageKey.replace(/[^a-z0-9]+/gi,'-')}-header`

  return (
    <section className="rounded-lg border bg-white overflow-hidden">
      <div id={headerId} className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-brand-blue-700">{icon}</span>
          <span className="text-base font-semibold text-brand-blue-800">{title}</span>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          className="inline-flex items-center gap-2 text-brand-blue-700"
          onClick={() => setOpen(v => !v)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
          ><path d="M7 10l5 5 5-5z"/></svg>
        </button>
      </div>
      <div
        id={regionId}
        role="region"
        aria-labelledby={headerId}
        ref={regionRef}
        style={{ maxHeight: open ? maxH : 0, opacity: open ? 1 : 0 }}
        className={`px-4 pb-4 grid sm:grid-cols-2 gap-3 transition-all duration-200 ease-in-out ${open ? '' : 'pointer-events-none'}`}
      >
        {children}
      </div>
    </section>
  )
}

