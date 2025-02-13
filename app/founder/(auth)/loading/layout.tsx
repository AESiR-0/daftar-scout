export default function LoadingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen">
      {children}
    </div>
  )
} 