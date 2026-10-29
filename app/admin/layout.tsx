import DashboardBanner from '@/components/DashboardBanner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardBanner
        title="Admin area"
        subtitle="Manage courses, users and platform stats"
        gradient="grad-2"
        links={[
          { href: '/admin', label: 'Overview' },
          { href: '/admin/courses', label: 'Courses' },
          { href: '/admin/users', label: 'Users' },
        ]}
      />
      {children}
    </>
  )
}