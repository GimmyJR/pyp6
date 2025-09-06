import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { Suspense } from "react"
import ContactForm from "../_components/contact-form"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-3xl rounded-3xl border-2 border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>
            {"Have a question or feedback? We'd love to hear from you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <ContactForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
