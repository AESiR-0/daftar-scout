import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  type: string;
};

export function NotificationCard({
  notification,
}: {
  notification: NotificationItem;
}) {
  return (
    <Card
      className={cn(
        "border p-3 transition-all",
        !notification.isRead && "bg-muted"
      )}
    >
      <CardContent className="p-0">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{notification.title}</h3>
            <span className="text-xs text-muted-foreground">
              {notification.date}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {notification.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
