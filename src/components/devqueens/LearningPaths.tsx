import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Code, Brain, Briefcase } from "lucide-react";
import { FadeInView } from "./TextReveal";

const paths = [
  {
    id: "beginner",
    icon: BookOpen,
    title: "Beginner Path",
    subtitle: "Start your tech journey from zero",
    description: "No experience needed. Learn the fundamentals of computing, web basics, and build your first website.",
    skills: ["Computer Basics", "Internet Fundamentals", "Digital Literacy", "Introduction to Coding", "HTML", "CSS", "JavaScript Basics", "Git & GitHub", "UI/UX Basics"],
  },
  {
    id: "intermediate",
    icon: Code,
    title: "Intermediate Path",
    subtitle: "Build real-world applications",
    description: "Master modern frameworks, databases, and professional development tools used by top engineering teams.",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "APIs & REST", "Databases", "Responsive Design", "Figma", "Tailwind CSS", "Firebase", "Supabase"],
  },
  {
    id: "advanced",
    icon: Brain,
    title: "Advanced Path",
    subtitle: "Specialize and go deeper",
    description: "Dive into AI, cybersecurity, cloud infrastructure, and system design at a professional level.",
    skills: ["AI & Machine Learning", "Cybersecurity", "DevOps", "Cloud Computing", "System Design", "Mobile Development", "Data Structures & Algorithms", "Docker", "Kubernetes", "AWS", "Software Architecture"],
  },
  {
    id: "career",
    icon: Briefcase,
    title: "Career & Professional Growth",
    subtitle: "Launch and grow your tech career",
    description: "Build your portfolio, ace interviews, and navigate the tech industry with confidence.",
    skills: ["CV/Resume Building", "Portfolio Creation", "LinkedIn Optimization", "Freelancing", "Interview Preparation", "Open Source Contribution", "Startup Building", "Remote Work", "Personal Branding", "Entrepreneurship"],
  },
];

function PathCard({ path, index }: { path: typeof paths[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <FadeInView delay={index * 0.08}>
      <div className="border border-[hsl(var(--border))]">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-[hsl(var(--secondary))] transition-colors duration-300"
        >
          <div className="flex items-start gap-5">
            <div className="w-10 h-10 bg-[hsl(var(--secondary))] flex items-center justify-center shrink-0 mt-0.5">
              <path.icon size={18} className="text-[hsl(var(--muted-foreground))]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="label-sm">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="heading-md">{path.title}</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{path.subtitle}</p>
              <p className="body-md mt-2 max-w-xl">{path.description}</p>
            </div>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown size={18} className="text-[hsl(var(--muted-foreground))] shrink-0" />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <div className="divider mb-6" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {path.skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-3 px-4 py-3 bg-[hsl(var(--secondary))]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--foreground))]/30" />
                      <span className="text-sm text-[hsl(var(--foreground))]">{skill}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <a href="https://chat.whatsapp.com/BIyl1UovWjzLwcGw6vtcUJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))] hover:opacity-60 transition-opacity">
                    Start this path →
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeInView>
  );
}

export default function LearningPaths() {
  return (
    <section id="paths" className="section-padding bg-[hsl(var(--secondary))]">
      <div className="section-container">
        <FadeInView>
          <div className="section-header">
            <p className="label-sm mb-4">Learning Paths</p>
            <h2 className="heading-lg">Four Paths. One Destination.</h2>
            <p className="body-lg mt-3">Structured learning journeys designed to take you from complete beginner to industry-ready professional.</p>
          </div>
        </FadeInView>

        <div className="mt-12 space-y-4">
          {paths.map((path, i) => (
            <PathCard key={path.id} path={path} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
