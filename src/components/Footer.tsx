import { Github, Linkedin, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/sheikhmuhammadzain/sheikhblog",
      icon: <Github className="h-4 w-4" />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/muhammad-zain-afzal-649209227/",
      icon: <Linkedin className="h-4 w-4" />,
    },
    {
      name: "Portfolio",
      url: "https://zain-sheikh.vercel.app",
      icon: <Globe className="h-4 w-4" />,
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border-t border-zinc-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-zinc-400">
            <span>Developed with</span>
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                color: ["#ef4444", "#ec4899", "#ef4444"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-red-500 mx-1"
            >
              ❤️
            </motion.span>
            <span>by</span>
            <a
              href="https://zainsheikh.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-100 hover:text-zinc-300 transition-colors ml-1"
            >
              Zain Sheikh
            </a>
          </div>
          <div className="flex items-center space-x-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
