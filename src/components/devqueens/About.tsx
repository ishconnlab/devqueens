import { FadeInView } from "./TextReveal";
import DevQueensLogo, { IshConnectLink } from "./DevQueensLogo";

export default function About() {
  return (
    <section className="section-padding bg-[hsl(var(--secondary))]">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <FadeInView>
            <div>
              <p className="label-sm mb-4">About DevQueens</p>
              <h2 className="heading-lg">Empowering Africa's Next Generation of Women in Tech</h2>
              <div className="mt-6 space-y-4">
                <p className="body-md">
                  DevQueens is a free community-driven learning ecosystem built for African women who want to build careers in technology. We provide structured learning paths, trusted resources, mentorship, and real opportunities — all at zero cost.
                </p>
                <p className="body-md">
                  From complete beginners taking their first steps into code to experienced developers advancing into AI, cloud, and leadership roles — DevQueens supports every stage of your journey.
                </p>
                <p className="body-md">
                  We believe that talent is universal, but opportunity is not. DevQueens exists to bridge that gap.
                </p>
              </div>
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-10 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <DevQueensLogo variant="about" />
                <div>
                  <p className="font-display text-lg font-bold text-[hsl(var(--foreground))]">DevQueens</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Learning Ecosystem</p>
                </div>
              </div>

              <div className="divider mb-6" />

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em] font-medium">Founded</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">2020</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em] font-medium">Community</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">2,400+ Members</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em] font-medium">Countries</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">18 African Nations</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-[0.1em] font-medium">Programs</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">6 Learning Domains</p>
                </div>
              </div>

              <div className="divider my-6" />

              <div className="flex items-center gap-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">An Initiative by</p>
                <IshConnectLink className="font-display text-sm font-bold text-[hsl(var(--foreground))] hover:opacity-60 transition-opacity">ISHConnect</IshConnectLink>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
