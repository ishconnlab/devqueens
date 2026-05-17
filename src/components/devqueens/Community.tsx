import { MessageCircle, Users, HeartHandshake, Code, ArrowRight } from "lucide-react";
import { FadeInView } from "./TextReveal";

const features = [
  {
    icon: MessageCircle,
    title: "WhatsApp Community",
    desc: "Daily conversations, mentorship, and collaboration with 2,400+ African women in tech.",
    action: "Join on WhatsApp",
    url: "https://chat.whatsapp.com/BIyl1UovWjzLwcGw6vtcUJ",
  },
  {
    icon: HeartHandshake,
    title: "Mentorship Hub",
    desc: "One-on-one guidance from 45+ experienced professionals across all tech fields.",
  },
  {
    icon: Code,
    title: "Coding Challenges",
    desc: "Weekly coding challenges, hackathons, and project-based learning to sharpen your skills.",
  },
  {
    icon: Users,
    title: "Women in Tech Stories",
    desc: "Real stories from African women building successful careers in technology across the continent.",
  },
];

const events = [
  { title: "Code For Impact 2026", date: "April 1–30, 2026", tag: "Hackathon" },
  { title: "Orientation Session", date: "March 21, 2026", tag: "Workshop" },
  { title: "Mentorship Applications", date: "Opening soon", tag: "Mentorship" },
];

export default function Community() {
  return (
    <section id="community" className="section-padding bg-[hsl(var(--secondary))]">
      <div className="section-container">
        <FadeInView>
          <div className="section-header">
            <p className="label-sm mb-4">Community</p>
            <h2 className="heading-lg">Learn Together. Grow Together.</h2>
            <p className="body-lg mt-3">A thriving ecosystem of African women in technology. Connect, collaborate, and build your future.</p>
          </div>
        </FadeInView>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item, i) => (
            <FadeInView key={item.title} delay={i * 0.06}>
              <div className="card card-hover h-full flex flex-col">
                <div className="w-9 h-9 bg-[hsl(var(--foreground))] flex items-center justify-center mb-4">
                  <item.icon size={16} className="text-[hsl(var(--background))]" />
                </div>
                <h3 className="text-base font-display font-semibold text-[hsl(var(--foreground))] mb-1.5">{item.title}</h3>
                <p className="body-md flex-1 mb-4">{item.desc}</p>
                {"url" in item && item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--foreground))] hover:opacity-60 transition-opacity">
                    {item.action} <ArrowRight size={11} />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {item.action || "Coming soon"} <ArrowRight size={11} />
                  </span>
                )}
              </div>
            </FadeInView>
          ))}
        </div>

        <FadeInView delay={0.3}>
          <div className="mt-10 p-8 md:p-10 bg-[hsl(var(--foreground))] text-[hsl(var(--background))]">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="label-sm text-[hsl(var(--background)/0.5)] mb-2">Upcoming Events</p>
                <h3 className="heading-md">Join the Movement</h3>
                <p className="text-sm text-[hsl(var(--background)/0.5)] mt-1 max-w-sm">
                  Ready to start your journey? Join 2,400+ African women already building the future of technology.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {events.map((e) => (
                  <div key={e.title} className="flex items-center justify-between py-2 border-b border-[hsl(var(--background)/0.1)] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--background))]">{e.title}</p>
                      <p className="text-xs text-[hsl(var(--background)/0.4)]">{e.date}</p>
                    </div>
                    <span className="tag text-[10px] bg-[hsl(var(--background)/0.1)] text-[hsl(var(--background)/0.6)]">{e.tag}</span>
                  </div>
                ))}
                <a href="https://chat.whatsapp.com/BIyl1UovWjzLwcGw6vtcUJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm font-medium mt-2 transition-all duration-300 hover:opacity-85">
                  Join Free <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
