import { useEffect } from "react";
import Navbar from "@/components/devqueens/Navbar";
import Hero from "@/components/devqueens/Hero";
import LearningPaths from "@/components/devqueens/LearningPaths";
import Resources from "@/components/devqueens/Resources";
import Community from "@/components/devqueens/Community";
import Opportunities from "@/components/devqueens/Opportunities";
import About from "@/components/devqueens/About";
import Footer from "@/components/devqueens/Footer";
import PublicShowcase from "@/components/devqueens/PublicShowcase";
import FeaturedCourses from "@/components/devqueens/FeaturedCourses";
import JoinCTA from "@/components/devqueens/JoinCTA";
import { updateSeo } from "@/lib/seo";

export default function Index() {
  useEffect(() => {
    updateSeo({
      title: "DevQueens | Learn, Build & Belong in Tech",
      description: "Learn to code, build real projects, and grow with a supportive girls-in-tech community. Explore web development, AI, robotics, and more with DevQueens by IshConnect in Rwanda.",
      path: "/",
    });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <LearningPaths />
        <FeaturedCourses />
        <Community />
        <PublicShowcase />
        <Resources />
        <Opportunities />
        <JoinCTA />
      </main>
      <Footer />
    </>
  );
}
