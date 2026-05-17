import { ExternalLink } from "lucide-react";
import { FadeInView } from "./TextReveal";

const categories = [
  {
    title: "Frontend & Web",
    items: [
      { name: "MDN Web Docs", desc: "The definitive web development reference", url: "https://developer.mozilla.org" },
      { name: "freeCodeCamp", desc: "Interactive coding tutorials and certifications", url: "https://www.freecodecamp.org" },
      { name: "W3Schools", desc: "Beginner-friendly web development tutorials", url: "https://www.w3schools.com" },
      { name: "JavaScript.info", desc: "Modern JavaScript deep dive", url: "https://javascript.info" },
      { name: "CSS-Tricks", desc: "CSS techniques, guides, and inspiration", url: "https://css-tricks.com" },
      { name: "Frontend Mentor", desc: "Real-world frontend challenges", url: "https://www.frontendmentor.io" },
    ],
  },
  {
    title: "Programming & CS",
    items: [
      { name: "Harvard CS50", desc: "World-renowned intro to computer science", url: "https://cs50.harvard.edu" },
      { name: "GeeksforGeeks", desc: "DSA and programming practice", url: "https://www.geeksforgeeks.org" },
      { name: "The Odin Project", desc: "Full-stopen curriculum, free and open source", url: "https://www.theodinproject.com" },
      { name: "Exercism", desc: "Coding exercises in 50+ languages", url: "https://exercism.org" },
      { name: "Codecademy", desc: "Free interactive coding courses", url: "https://www.codecademy.com" },
    ],
  },
  {
    title: "AI & Data",
    items: [
      { name: "Kaggle", desc: "ML competitions, datasets, and notebooks", url: "https://www.kaggle.com" },
      { name: "DeepLearning.AI", desc: "AI specialization courses from Andrew Ng", url: "https://www.deeplearning.ai" },
      { name: "Google AI", desc: "AI research, tools, and educational resources", url: "https://ai.google" },
      { name: "Fast.ai", desc: "Practical deep learning for coders", url: "https://www.fast.ai" },
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      { name: "Microsoft Learn", desc: "Free cloud and developer training", url: "https://learn.microsoft.com" },
      { name: "AWS Skill Builder", desc: "AWS cloud skills and certification prep", url: "https://aws.amazon.com/training" },
      { name: "Google Cloud Skills Boost", desc: "Hands-on GCP labs and courses", url: "https://www.cloudskillsboost.google" },
      { name: "Docker Docs", desc: "Containerization documentation and guides", url: "https://docs.docker.com" },
      { name: "Kubernetes Docs", desc: "Official Kubernetes documentation", url: "https://kubernetes.io/docs" },
    ],
  },
  {
    title: "Design",
    items: [
      { name: "Figma Learn", desc: "Design tutorials and resources", url: "https://www.figma.com/resources/learn-design" },
      { name: "Adobe XD Resources", desc: "UX design tutorials and templates", url: "https://helpx.adobe.com/xd/tutorials.html" },
      { name: "Dribbble", desc: "Design inspiration and community", url: "https://dribbble.com" },
      { name: "Behance", desc: "Creative portfolio showcase", url: "https://www.behance.net" },
    ],
  },
  {
    title: "Career & Growth",
    items: [
      { name: "LinkedIn Learning", desc: "Free professional development courses", url: "https://www.linkedin.com/learning" },
      { name: "GitHub Education", desc: "Student dev pack and learning resources", url: "https://education.github.com" },
      { name: "Roadmap.sh", desc: "Developer roadmaps and guides", url: "https://roadmap.sh" },
      { name: "Dev.to", desc: "Developer community and articles", url: "https://dev.to" },
      { name: "Hashnode", desc: "Blogging platform for developers", url: "https://hashnode.com" },
    ],
  },
];

export default function Resources() {
  return (
    <section id="resources" className="section-padding bg-[hsl(var(--background))]">
      <div className="section-container">
        <FadeInView>
          <div className="section-header">
            <p className="label-sm mb-4">Trusted Resources</p>
            <h2 className="heading-lg">Curated Free Learning Platforms</h2>
            <p className="body-lg mt-3">Hand-picked from the world's best educational platforms. Everything you need, at zero cost.</p>
          </div>
        </FadeInView>

        <div className="mt-14 space-y-14">
          {categories.map((cat) => (
            <div key={cat.title}>
              <FadeInView>
                <h3 className="heading-md mb-6">{cat.title}</h3>
              </FadeInView>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.items.map((item, i) => (
                  <FadeInView key={item.name} delay={i * 0.03}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card card-hover group flex items-start gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.name}</span>
                          <ExternalLink size={10} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{item.desc}</p>
                      </div>
                    </a>
                  </FadeInView>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
