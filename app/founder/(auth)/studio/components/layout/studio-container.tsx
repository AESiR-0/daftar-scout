interface StudioContainerProps {
  children: React.ReactNode;
}

export function StudioContainer({ children }: StudioContainerProps) {
  return (
    <div className="h-full w-full">
      <div className="flex flex-col h-full max-w-5xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
} 