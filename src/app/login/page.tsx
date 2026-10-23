import type { Metadata } from "next";
import { login } from "./actions";
import { noindexNofollow } from "@/lib/seo";
import { SkapaSignature } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Sign in",
  ...noindexNofollow,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm">
        <h1 className="mb-1">
          <SkapaSignature tone="ink" className="h-7" />
        </h1>
        <p className="text-sm text-neutral-500 mb-8">Sign in to your project</p>

        {error && (
          <p className="text-sm text-red-600 mb-4 border border-red-200 bg-red-50 px-3 py-2 rounded">
            {error}
          </p>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white text-sm py-2 rounded hover:bg-neutral-800 transition"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
