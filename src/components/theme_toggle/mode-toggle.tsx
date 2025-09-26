import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme_toggle/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="link"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] text-blue-500 dark:hidden transition-all" />
      <Moon className="h-[1.2rem] w-[1.2rem] text-yellow-500 hidden dark:block transition-all" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
