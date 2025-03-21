"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
})

export default function LandingPage() {
  const [showForm, setShowForm] = useState(false)
  const [registered, setRegistered] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Here you would typically send the data to your backend
    console.log(values)
    setRegistered(true)
  }

  return (
    <div className="flex flex-col items-start justify-center h-[60%] px-4">
      <div className="w-full">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-medium text-muted-foreground mt-[4rem] mb-[16rem]">
            Daftar OS Technology
          </h2>
          <h1 className="text-4xl font-bold tracking-tight mb-8">
          Helping investors to scout the next meaningful startup. 
          </h1>
          <Button 
            size="lg" 
            className="text-lg px-8"
            onClick={() => setShowForm(true)}
          >
            Register Me for Early Access
          </Button>
        </div>

        {/* Registration Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {registered ? "Registration Successful!" : "Pre-registration Form"}
              </DialogTitle>
            </DialogHeader>

            {registered ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-green-600 font-medium">You're in!</p>
                <p className="text-muted-foreground">
                  Thanks for signing up for early access. You'll receive an email invite as soon as the software is live.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="in">India</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                            {/* Add more countries as needed */}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
