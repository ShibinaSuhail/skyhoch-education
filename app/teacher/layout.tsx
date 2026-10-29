import DashboardBanner from '@/components/DashboardBanner'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardBanner
        title="Teacher area"
        subtitle="Manage your students and class sessions"
        gradient="grad-3"
        links={[{ href: '/teacher', label: 'My courses' }]}
      />
      {children}
    </>
  )
}