"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

// --- NEW IMPORTS ---
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  
  // --- NEW STATES for form handling ---
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  // --- END NEW STATES ---


  // --- NEW: Handle Credentials (Email/Password) Login ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        // This is crucial: 'redirect: false'
        // It tells Next-Auth *not* to reload the page.
        // We will handle the result ourselves.
        redirect: false,
        email: email,
        password: password,
      })

      if (result.error) {
        // Login failed. 'result.error' will contain our
        // backend error message ("Invalid email or password.")
        setError(result.error)
        setIsLoading(false)
      } else {
        // Login was successful!
        // The session is now active. We can redirect.
        // We'll reload the page to refresh the session state everywhere.
        // You can also use router.push('/dashboard') or router.push('/')
        router.refresh()
        router.push('/') // Redirect to homepage
      }
    } catch (err) {
      setIsLoading(false)
      setError("An unexpected error occurred. Please try again.")
    }
  }
  // --- END NEW FUNCTION ---

  // --- NEW: Handle OAuth (Google/Facebook) Login ---
  const handleOAuthSignIn = (provider) => {
    setIsLoading(true)
    // We *want* a redirect for OAuth, so we don't set 'redirect: false'
    signIn(provider)
  }
  // --- END NEW FUNCTION ---


  return (
    <div className={cn("flex flex-col gap-6 p-10 rounded-4xl bg-neutral-100 border-3", className)} {...props}>
      {/* --- MODIFIED: Added form submission handler --- */}
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-bold font-[ClashDisplay-Regular]">Urban Veins</h1>
            <FieldDescription>
              Welcome back! Login to your account.
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            {/* --- MODIFIED: Connected input to state --- */}
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              {/* --- MODIFIED: Connected input to state --- */}
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          
          {/* --- NEW: Show error message if login fails --- */}
          {error && (
            <FieldDescription className="text-red-600 text-center">
              {error}
            </FieldDescription>
          )}
          {/* --- END NEW --- */}

          <Field>
            {/* --- MODIFIED: Added loading state to button --- */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Field>
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            {/* --- MODIFIED: Added onClick handlers --- */}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <Image src="/Google-Icon.svg" alt="Google logo" width={20} height={20} />
              Google
            </Button>
            <Button 
              variant="outline" 
              type="button"
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={isLoading}
            >
              <Image src="/Facebook-Icon.svg" alt="Facebook logo" width={20} height={20} />
              Facebook
            </Button>
            {/* --- END MODIFIED --- */}
          </Field>
          <FieldDescription className='items-center text-center'>
            Don&apos;t have an account? <a href="/signup">Sign up</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}