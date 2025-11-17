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

export function LoginForm({
  className,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
            <Input id="password" type="password" placeholder="Enter your password" required />
          </Field>
          <Field>
            <Button type="submit">Login</Button>
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
