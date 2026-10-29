import DashboardBanner from '@/components/DashboardBanner'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardBanner
        title="Student area"
        subtitle="Your courses, lessons and live sessions"
        gradient="grad-hero"
        links={[
          { href: '/student', label: 'My courses' },
          { href: '/courses', label: 'Browse courses' },
        ]}
      />
      {children}
    </>
  )
}