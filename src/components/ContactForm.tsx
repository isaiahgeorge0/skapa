'use client'

import { useState } from 'react'
import type { SubmitLeadResult } from '@/lib/submit-lead-core'
import { withTimeout } from '@/lib/with-timeout'

const SUBMIT_TIMEOUT_MS = 15_000

async function postLead(body: unknown): Promise<SubmitLeadResult> {
  const response = await fetch('/api/submit-lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const result = (await response.json()) as SubmitLeadResult
  return result
}

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage(null)

    const form = e.currentTarget
    try {
      const result = await withTimeout(
        postLead({
          source: 'contact_form',
          name: (form.elements.namedItem('name') as HTMLInputElement).value,
          email: (form.elements.namedItem('email') as HTMLInputElement).value,
          message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
        }),
        SUBMIT_TIMEOUT_MS,
      )

      if (!result.success) {
        setErrorMessage(result.error)
        setStatus('error')
        return
      }

      setStatus('success')
      form.reset()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-neutral-700">
        Thanks. Got your message. We&apos;ll be in touch shortly.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm mb-1">Name</label>
        <input id="name" name="name" required className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm mb-1">Email</label>
        <input id="email" name="email" type="email" required className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm mb-1">Message</label>
        <textarea id="message" name="message" rows={4} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-black text-white text-sm px-5 py-2 rounded hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending...' : 'Send message'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-red-600">
          {errorMessage ?? 'Something went wrong. Please try again.'}
        </p>
      )}
    </form>
  )
}
