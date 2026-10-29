import Link from 'next/link'

type Props = {
  title: string
  subtitle: string
  gradient: string
  links: { href: string; label: string }[]
}

export default function DashboardBanner({ title, subtitle, gradient, links }: Props) {
  return (
    <div className={`${gradient} text-white`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6">
        <div>
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="text-sm text-white/80">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}