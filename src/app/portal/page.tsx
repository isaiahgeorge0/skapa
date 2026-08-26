import { createClient } from '@/lib/supabase/server'
import { logout } from '../login/actions'

export default async function PortalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="min-h-screen p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif">
          skapa <span className="italic text-brand-pink">Creative</span>
        </h1>
        <form action={logout}>
          <button className="text-sm text-neutral-500 hover:text-black">Sign out</button>
        </form>
      </div>

      <p className="text-sm text-neutral-600">
        Signed in as <strong>{user?.email}</strong> — role:{' '}
        <strong>{profile?.role}</strong>
      </p>

      <p className="mt-4 text-sm text-neutral-400">
        Project progress, messages, and documents will render here next.
      </p>
    </div>
  )
}
