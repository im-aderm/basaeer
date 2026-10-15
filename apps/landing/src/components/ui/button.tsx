import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        const variants = {
            default: "bg-[#2563EB] text-white shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
            outline: "border border-primary bg-background hover:bg-[#F9FAFB] hover:text-accent-foreground",
            secondary: "bg-white text-[#111827] border border-primary shadow-sm hover:bg-[#F9FAFB] hover:border-primary/50",
            ghost: "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]",
            link: "text-[#2563EB] underline-offset-4 hover:underline",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
