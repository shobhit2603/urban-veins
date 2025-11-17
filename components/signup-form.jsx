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
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

// --- NEW IMPORTS ---
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function SignupForm({
    className,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false)
    
    // --- NEW STATES for form handling ---
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("") // For success or error messages
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    // --- END NEW STATES ---


    // --- NEW: Handle OAuth (Google/Facebook) Sign In ---
    // Note: This will create an account OR log them in
    const handleOAuthSignIn = (provider) => {
        setIsLoading(true)
        signIn(provider)
    }
    // --- END NEW FUNCTION ---

    // --- NEW: Handle Custom Email/Password Signup ---
    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage("")
        setIsLoading(true)

        const formData = { name, email, password, mobile }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (res.ok) {
                // Success!
                setMessage("Registration successful! Redirecting to login...")
                // Redirect to the login page after a short delay
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                // Handle backend errors
                // 'data.message' will be "User already exists." etc.
                setMessage(data.message || "Registration failed.")
                setIsLoading(false)
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error)
            setMessage('An unexpected error occurred. Please try again.')
            setIsLoading(false)
        }
    }
    // --- END NEW FUNCTION ---

    return (
        <div className={cn("flex flex-col gap-6 py-6 px-10 rounded-4xl bg-neutral-100 border-3", className)} {...props}>
            {/* --- MODIFIED: Added form submission handler --- */}
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-4xl font-bold font-[ClashDisplay-Regular]">Urban Veins</h1>
                        <FieldDescription>
                            Welcome! Create a new account.
                        </FieldDescription>
                    </div>
                    <Field className="grid gap-4 sm:grid-cols-2">
                        {/* --- MODIFIED: Added onClick handlers and disabled state --- */}
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
                    </Field>
                    <FieldSeparator>Or continue with</FieldSeparator>
                    <Field>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        {/* --- MODIFIED: Connected input to state --- */}
                        <Input 
                            id="name" 
                            type="text" 
                            placeholder="Enter your full name" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </Field>
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
                        <FieldLabel htmlFor="number">Phone Number</FieldLabel>
                        {/* --- MODIFIED: Connected input to state --- */}
                        <Input 
                            id="number" 
                            type="tel" 
                            placeholder="Enter phone number" 
                            required 
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
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

                    {/* --- NEW: Show success/error message --- */}
                    {message && (
                        <FieldDescription className={message.includes("successful") ? "text-green-600 text-center" : "text-red-600 text-center"}>
                            {message}
                        </FieldDescription>
                    )}
                    {/* --- END NEW --- */}

                    <Field>
                        {/* --- MODIFIED: Added loading state to button --- */}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </Field>
                    
                    <FieldDescription className='items-center text-center'>
                        Already have an account? <a href="/login">Login</a>
                    </FieldDescription>
                </FieldGroup>
            </form>
        </div>
    );
}