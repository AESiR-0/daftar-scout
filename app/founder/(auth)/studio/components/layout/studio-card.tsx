import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StudioCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function StudioCard({ title, description, children }: StudioCardProps) {
  return (
    <Card className="w-full border-none my-0 p-0 bg-[#0e0e0e]  mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title ? title : ''}</CardTitle>
        {description && (
          <CardDescription>
            <p className="text-sm text-gray-500">{description}</p>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="border-none">
        {children}
      </CardContent>
    </Card>
  );
} 