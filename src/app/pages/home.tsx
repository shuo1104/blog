import { motion } from "framer-motion";
import { usePostsStore } from "../services/posts-store";
import { ArticleCard } from "../components/ui/article-card";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function Home() {
  const { posts } = usePostsStore();

  return (
    <div className="pb-32 w-full max-w-4xl mx-auto">
      {/* Hero Intro Header */}
      <section className="mb-14 pt-2">
        <h1
          className="mb-5 tracking-tight text-4xl sm:text-5xl lg:text-[3.2rem] font-medium text-foreground"
          style={{ fontFamily: "Fraunces, serif", lineHeight: 1.14 }}
        >
          Creating everything with AI.
        </h1>
        <p
          className="text-muted-foreground text-base sm:text-lg font-normal max-w-2xl"
          style={{ lineHeight: 1.7 }}
        >
          Hi, I'm Shuo — an AI engineer who loves creating everything with artificial intelligence. Nice to meet you. This is where I share my thoughts on AI engineering, agent systems, and independent craft.
        </p>
      </section>


      {/* Compact 2-Column Article Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
      >
        {posts.map((post) => (
          <motion.div key={post.slug} variants={itemVariants}>
            <ArticleCard post={post} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Home;





