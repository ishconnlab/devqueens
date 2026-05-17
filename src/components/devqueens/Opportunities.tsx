import { Briefcase, GraduationCap, Award, ExternalLink } from "lucide-react";
import { FadeInView } from "./TextReveal";

const opportunities = [
  {
    icon: Briefcase,
    title: "Software Engineering Intern",
    company: "IshConnect",
    type: "Internship",
    desc: "Gain hands-on experience building real products used across Africa.",
    url: "https://ishconnect.rw",
  },
  {
    icon: GraduationCap,
    title: "Women in Tech Scholarship",
    company: "ALX Africa",
    type: "Scholarship",
    desc: "Fully funded scholarship for African women pursuing tech education.",
  },
  {
    icon: Award,
    title: "Open Source Contributor",
    company: "Various",
    type: "Program",
    desc: "Contribute to impactful open source projects with mentorship support.",
  },
  {
    icon: Briefcase,
    title: "Tech Fellowship Program",
    company: "Various Partners",
    type: "Fellowship",
    desc: "Paid fellowship for African women to gain industry experience.",
  },
];

export default function Opportunities() {
  return (
    <section id="opportunities" className="section-padding bg-[hsl(var(--background))]">
      <div className="section-container">
        <FadeInView>
          <div className="section-header">
            <p className="label-sm mb-4">Opportunities</p>
            <h2 className="heading-lg">Launch Your Career</h2>
            <p className="body-lg mt-3">Internships, scholarships, and programs designed to accelerate your growth in tech.</p>
          </div>
        </FadeInView>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {opportunities.map((opp, i) => (
            <FadeInView key={opp.title} delay={i * 0.08}>
              <div className="card card-hover h-full flex flex-col group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-[hsl(var(--secondary))] flex items-center justify-center group-hover:bg-[hsl(var(--foreground))] transition-colors duration-300">
                    <opp.icon size={16} className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--background))] transition-colors duration-300" />
                  </div>
                  <span className="tag text-[10px]">{opp.type}</span>
                </div>
                <h3 className="text-base font-display font-semibold text-[hsl(var(--foreground))] mb-0.5">{opp.title}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{opp.company}</p>
                <p className="body-md flex-1 mb-4">{opp.desc}</p>
                {"url" in opp && opp.url ? (
                  <a href={opp.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--foreground))] hover:opacity-60 transition-opacity">
                    Learn more <ExternalLink size={10} />
                  </a>
                ) : (
                  <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Coming soon</span>
                )}
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
