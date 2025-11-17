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
import { signIn } from "next-auth/react"

export function LoginForm({
  className,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      // This is crucial: 'redirect: false'
      // It tells Next-Auth not to reload the page.
      // We will handle the result ourselves.
      redirect: false,
      email: email,
      password: password,
    });

    if (result.error) {
      // Login failed. 'result.error' will contain our
      // backend error message ("Invalid email or password.")
      setError(result.error);
      console.error(result.error);
    } else {
      // Login was successful!
      // The session is now active, and useSession() will update.
      // You can now redirect the user.
      router.push('/');

      // For our test, we just reloaded the page
      window.location.reload();
    }
  };


  return (
    <div className={cn("flex flex-col gap-6 p-10 rounded-4xl bg-neutral-100 border-3", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-bold font-[ClashDisplay-Regular]">Urban Veins</h1>
            <FieldDescription>
              Welcome back! Login to your account.
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="Enter your email" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          <Field>
            <Button type="submit" onClick={handleSubmit}>Login</Button>
          </Field>
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <Image src="/Google-Icon.svg" alt="Google logo" width={20} height={20} />
              Google
            </Button>
            <Button variant="outline" type="button">
              <Image src="/Facebook-Icon.svg" alt="Facebook logo" width={20} height={20} />
              Facebook
            </Button>
          </Field>
          <FieldDescription className='items-center text-center'>
            Don&apos;t have an account? <a href="/signup">Sign up</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
