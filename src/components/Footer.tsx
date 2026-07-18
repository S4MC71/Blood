import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-red-100/60 bg-white/50 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/50 py-6">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <Heart className="h-4 w-4 fill-red-500 text-red-500 drop-shadow-sm" />
          <span>Made with love in Bangladesh</span>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          &copy; {new Date().getFullYear()} Roktodan.online
        </p>
      </div>
    </footer>
  )
}
