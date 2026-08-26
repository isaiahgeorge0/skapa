'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')

    const form = e.currentTarget
    const supabase = createClient()

    const { error } = await supabase.from('leads').insert({
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    })

    if (error) {
      console.error(error)
      setStatus('error')
      return
    }

    setStatus('success')
    form.reset()
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-neutral-700">
        Thanks — got your message. We'll be in touch shortly.
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
        <p className="text-sm text-red-600">Something went wrong — try again.</p>
      )}
    </form>
  )
}
