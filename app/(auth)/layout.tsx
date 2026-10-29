export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grad-hero flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="auth-card w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-5 text-center">
          <p className="grad-text text-xl font-extrabold">Skyhoch Education</p>
          <p className="text-sm text-slate-500">Learn German. Build your future.</p>
        </div>
        {children}
      </div>
    </div>
  )
}