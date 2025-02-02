import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  "Access to exclusive investment opportunities",
  "Priority customer support",
  "Advanced analytics and reporting",
  "Personalized investment strategy",
  "Dedicated relationship manager",
]

export default function PremiumPage() {
  return (
    <div className="space-y-4 container mx-auto px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Go Premium</h1>
        <p className="text-muted-foreground">
          Unlock exclusive features and investment opportunities
        </p>
      </div>
      <div className="flex justify-center pt-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Premium Membership</CardTitle>
            <CardDescription>
              Take your investment journey to the next level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upgrade Now</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 