import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[36px] w-full rounded-[20px] border border-border-subtle bg-accent px-4 py-2 text-[13px] ring-offset-main file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-gray focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 text-text-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
