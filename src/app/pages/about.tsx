import { PersonalCard } from "../components/personal-card";
import { GitHubActivity } from "../components/github-activity";
import { motion } from "framer-motion";

export function About() {

  return (
    <div className="pb-32 w-full">
      {/* Top Hero Section: 3D Titanium Card + Bio Story */}
      <div className="mb-24 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-12 lg:gap-16 items-center pt-2">
        {/* 3D Titanium Personal Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:justify-start"
        >
          <PersonalCard
            name="Shuo"
            title="AI Development Engineer"
            tagline="Creating everything with AI · Nice to meet you"
            email="shuode9131@gmail.com"
            handle="@shuo"
            website="shuo.dev"
            edition="AI EDITION · SER. 0913"
            year="EST. 2026"
            monogram="S"
            className="w-full max-w-[440px]"
          />
        </motion.div>

        {/* Bio Story */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <h1
            className="mb-6 tracking-tight text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-foreground"
            style={{ fontFamily: "Fraunces, serif", lineHeight: 1.18 }}
          >
            Creating everything with AI, exploring the edges of possibility.
          </h1>

          <div className="flex flex-col gap-5 text-muted-foreground text-base sm:text-lg" style={{ lineHeight: 1.8 }}>
            <p className="text-foreground/90 font-medium">
              Hi, I'm Shuo — an AI engineer who loves creating everything with artificial intelligence. Nice to meet you.
            </p>
            <p>
              I believe artificial intelligence is not just a lever for productivity, but a new canvas for human creativity. From large language model architectures and collaborative agent systems to handcrafted micro-utilities, I build instruments that bring ambitious ideas to life.
            </p>
            <p>
              This blog is a quiet space to document what I learn along the way. If you're building with AI or just want to connect, feel free to reach out at shuode9131@gmail.com. I'd love to hear from you.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Activity Heatmaps Section: Direct Standalone Cards (No nesting, no extra headers) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
          {/* Left: Real GitHub Contributions Heatmap */}
          <GitHubActivity username="shuo1104" showMonths accent="#10b981" />

          {/* Right: Real AgentsView Coding Agent Usage Heatmap */}
          <GitHubActivity username="agentsview" showMonths accent="#8b5cf6" label="Top AI Models used:" />
        </div>
      </motion.section>
    </div>
  );
}

export default About;





