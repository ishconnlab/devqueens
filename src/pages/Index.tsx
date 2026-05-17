import Navbar from "@/components/devqueens/Navbar";
import Hero from "@/components/devqueens/Hero";
import LearningPaths from "@/components/devqueens/LearningPaths";
import Resources from "@/components/devqueens/Resources";
import Community from "@/components/devqueens/Community";
import Opportunities from "@/components/devqueens/Opportunities";
import About from "@/components/devqueens/About";
import Footer from "@/components/devqueens/Footer";

export default function Index() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LearningPaths />
        <Resources />
        <Community />
        <Opportunities />
        <About />
      </main>
      <Footer />
    </>
  );
}
