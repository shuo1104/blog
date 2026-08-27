export interface PostSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface PostContent {
  coverImage?: string;
  title: string;
  readingTime: string;
  excerpt: string;
  sections: PostSection[];
  content: string[];
}

export interface Post {
  slug: string;
  coverImage?: string;
  date: string;
  tags: string[];
  en: PostContent;
  zh: PostContent;
  // Compatibility fallbacks
  title: string;
  readingTime: string;
  excerpt: string;
  sections: PostSection[];
  content: string[];
}

export const posts: Post[] = [
  {
    slug: "on-writing-less",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    date: "2026-06-18",
    tags: ["Writing", "Craft", "Philosophy"],
    title: "On Writing Less",
    readingTime: "4 min",
    excerpt: "The best essays I return to are rarely the longest. Restraint is a form of respect for the reader\x27s attention.",
    en: {
      title: "On Writing Less",
      readingTime: "4 min",
      excerpt: "The best essays I return to are rarely the longest. Restraint is a form of respect for the reader\x27s attention.",
      sections: [
        {
          id: "the-word-count-trap",
          title: "The Word Count Trap",
          paragraphs: [
            "I used to measure a good writing day by word count. A thousand words felt like progress; three thousand felt like an undeniable triumph. It took me years to notice that the essays people actually remembered, bookmarked, and quoted were almost never the long ones.",
            "We live in an attention economy where verbosity is often mistaken for depth. But long-form text is only valuable if every paragraph justifies the reader\x27s cognitive load.",
          ],
        },
        {
          id: "the-physics-of-cutting",
          title: "The Physics of Cutting",
          paragraphs: [
            "Cutting is infinitely harder than adding. When you add, you get the dopamine hit of watching the document scrollbar shrink and the page count swell. When you cut, you must confront the uncomfortable reality that something you labored over for hours simply isn\x27t earning its place.",
            "Every sentence that survives a rigorous edit carries ten times more punch because it isn\x27t suffocating under the weight of decorative filler. Subtraction is where craft reveals itself.",
          ],
        },
        {
          id: "drafting-long-publishing-short",
          title: "Drafting Long, Publishing Short",
          paragraphs: [
            "So now my rule is simple: write long, publish short. The first draft is for the writer — a messy, exploratory sandbox to discover what you actually think. The final draft is for the reader, and it owes them clarity, momentum, and brevity.",
            "If an idea can be distilled into three paragraphs without losing its emotional resonance or intellectual precision, leaving it as a ten-page essay is self-indulgence.",
          ],
        },
        {
          id: "restraint-as-respect",
          title: "Restraint as Respect",
          paragraphs: [
            "Restraint is the highest form of respect you can offer an audience. It signals: I did the heavy lifting of deciding what truly matters, so you don\x27t have to sift through the gravel to find the gold.",
            "When you finish reading something lean and potent, you feel energized rather than exhausted. That is the feeling worth striving for.",
          ],
        },
      ],
      content: [
        "I used to measure a good writing day by word count. A thousand words felt like progress; three thousand felt like an undeniable triumph. It took me years to notice that the essays people actually remembered were almost never the long ones.",
        "Cutting is harder than adding. When you add, you get the small dopamine of watching the document grow. When you cut, you have to admit that something you labored over wasn\x27t earning its place. But every sentence that survives the edit carries more weight because of the ones that didn\x27t.",
        "So now I write long and publish short. The first draft is for me — a way of thinking on the page. The final draft is for you, and it owes you brevity.",
        "Restraint is a form of respect. It says: I did the work of deciding what matters, so you don\x27t have to.",
      ],
    },
    zh: {
      title: "论少写：克制即尊重",
      readingTime: "4 分钟阅读",
      excerpt: "真正值得反复重温的文章往往并不冗长。少写与克制，是对读者注意力最高级的敬意。",
      sections: [
        {
          id: "the-word-count-trap",
          title: "字数陷阱",
          paragraphs: [
            "我曾习惯用字数来衡量写作的成效。一千字意味着充实，三千字则是莫大的胜利。多年后我才幡然醒悟：真正被人铭记、反复咀嚼与引用的文章，几乎从不是那些冗长的篇章。",
            "在注意力极度稀缺的时代，冗长常被误当作深刻。但长篇大论的真正价值，取决于每一段落是否配得上读者付出的心智带宽。",
          ],
        },
        {
          id: "the-physics-of-cutting",
          title: "删减的法则",
          paragraphs: [
            "删减远比堆砌艰难。增加字数能带来即时的多巴胺反馈，看着篇幅膨胀；而删减则需要你直面残酷的现实——那些耗费数小时写下的句子，其实并不值得保留。",
            "每一句在严苛删削后存活下来的文字，都会因摆脱了修饰性赘述的窒息而拥有十倍的力量。减法，才是显露手艺的地方。",
          ],
        },
        {
          id: "drafting-long-publishing-short",
          title: "长写短发",
          paragraphs: [
            "如今我的准则是：初稿写长，终稿发短。第一稿是写给自己的探险沙盒，用以理清思路；终稿则是交予读者的答卷，它必须背负清晰、紧凑与洗练的承诺。",
            "若一个构想用三段话便能淋漓尽致地传达且不失思想锋芒，将其拖沓成万字长文不过是创作者的自我放纵。",
          ],
        },
        {
          id: "restraint-as-respect",
          title: "克制即尊重",
          paragraphs: [
            "克制是创作者能给予读者最高级的敬意。它在无声诉说：我已替你挑起披沙拣金的重担，你无需再在砂砾中苦苦寻觅。",
            "读罢一篇精炼而充满张力的文字，人会感到精神振奋而非筋疲力尽。这才是值得终身追求的表达境界。",
          ],
        },
      ],
      content: [
        "我曾习惯用字数来衡量写作的成效。一千字意味着充实，三千字则是莫大的胜利。多年后我才幡然醒悟：真正被人铭记、反复咀嚼与引用的文章，几乎从不是那些冗长的篇章。",
        "删减远比堆砌艰难。增加字数能带来即时的多巴胺反馈；而删减则需要你直面残酷的现实——那些耗费数小时写下的句子，其实并不值得保留。",
        "如今我的准则是：初稿写长，终稿发短。第一稿是写给自己的探险沙盒；终稿则是交予读者的答卷，它必须背负清晰与洗练的承诺。",
        "克制是对读者最高级的敬意。我替你做了删繁就简的苦功，你便无需在砂砾中苦苦淘金。",
      ],
    },
    sections: [],
    content: [],
  },
  {
    slug: "small-tools-big-leverage",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    date: "2026-05-02",
    tags: ["Software", "Productivity", "Unix"],
    title: "Small Tools, Big Leverage",
    readingTime: "6 min",
    excerpt: "A collection of tiny scripts has quietly reshaped how I work more than any framework ever did.",
    en: {
      title: "Small Tools, Big Leverage",
      readingTime: "6 min",
      excerpt: "A collection of tiny scripts has quietly reshaped how I work more than any framework ever did.",
      sections: [
        {
          id: "single-purpose-scripts",
          title: "Single-Purpose Scripts",
          paragraphs: [
            "There is a particular kind of quiet magic in a script that does exactly one thing and does it without fanfare. Not an enterprise platform, not an over-engineered framework — just a forty-line shell file that permanently eliminates a recurring friction from your day.",
            "Modern software engineering often seduces us into building massive generalized abstractions. But the most durable tools in my workspace have always been narrow, sharp, and tailored to specific edges.",
          ],
        },
        {
          id: "my-everyday-toolkit",
          title: "My Everyday Micro-Toolkit",
          paragraphs: [
            "Over the years I\x27ve accumulated a curated folder of micro-utilities: a 10-line script that batch-optimizes screenshots for the web, a clipboard sanitizer that strips rich-text garbage into spotless markdown, and a single CLI command that boots my local development mesh.",
            "None of them would win an award on Hacker News. But they remove dozens of micro-stalls from my workflow every single afternoon.",
          ],
        },
        {
          id: "compounding-leverage",
          title: "Compounding Leverage",
          paragraphs: [
            "Leverage compounds invisibly. Saving thirty seconds on a repetitive task isn\x27t just about the raw thirty seconds; it\x27s about preserving unbroken mental state. Friction at the boundaries of your workflow is where creative momentum bleeds out.",
            "When tools feel instantaneous and transparent, you stay in the flow state longer, producing deeper and more thoughtful work.",
          ],
        },
        {
          id: "tools-that-fit",
          title: "Tools That Fit Your Hands",
          paragraphs: [
            "The lesson I keep relearning is simple: you don\x27t need shinier, heavier tools nearly as often as you need tools that fit your own hands.",
            "Build small, custom instruments. Treat your daily workflow like a craft workshop where every chisel is honed for the specific wood you carve.",
          ],
        },
      ],
      content: [],
    },
    zh: {
      title: "微型工具，复利杠杆",
      readingTime: "6 分钟阅读",
      excerpt: "一套数十行的小脚本，对我工作流的重塑远胜过任何宏大的软件框架。",
      sections: [
        {
          id: "single-purpose-scripts",
          title: "单一职能的脚本",
          paragraphs: [
            "专注于做好一件事的微小脚本有一种独特的魔法。它不是庞杂的企业级平台，也不是过度设计的框架——仅仅是一段三四十行的脚本，却能彻底抹平日常流程中反复出现的卡顿。",
            "现代软件工程常常诱导我们构建宏大的通用抽象。但在我的实际工作流中，最持久耐用的工具永远是那些专一、锋利且紧贴具体边界的小工具。",
          ],
        },
        {
          id: "my-everyday-toolkit",
          title: "我的日常微型工具箱",
          paragraphs: [
            "多年来我整理了一套个人专用的微型工具集：一行命令完成网页截图批量压缩、自动将剪贴板脏格式洗成纯净 Markdown、一键拉起本地开发服务网格。",
            "它们单独拿出来都不足以登上技术头条，但它们在每个下午为我消除了无数次思路中断的微小阻力。",
          ],
        },
        {
          id: "compounding-leverage",
          title: "复利累积的效能",
          paragraphs: [
            "杠杆效能是在无形中复利增长的。自动化节省三十秒不仅是三十秒时间本身，更重要的是保护了不被打断的心流状态。工作流边界上的摩擦力，正是创造力动能流失的主因。",
            "当工具变得极速且无感，你能更长久地沉浸在深度思考中，产出更有分量的作品。",
          ],
        },
        {
          id: "tools-that-fit",
          title: "合手的才是好工具",
          paragraphs: [
            "我反复得到印证的经验是：你往往不需要更庞大繁复的工具，你真正需要的是贴合你手掌温度与习惯的工具。",
            "打造属于你自己的定制微仪器。像传统手艺人的工作坊一样对待你的数字环境，让每一柄刻刀都只为你雕琢的木料而磨砺。",
          ],
        },
      ],
      content: [],
    },
    sections: [],
    content: [],
  },
  {
    slug: "the-quiet-hours",
    coverImage: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
    date: "2026-03-27",
    tags: ["Life", "Focus", "Rituals"],
    title: "The Quiet Hours",
    readingTime: "3 min",
    excerpt: "Everything worthwhile I\x27ve made happened in the same slot: early morning, before the world woke up.",
    en: {
      title: "The Quiet Hours",
      readingTime: "3 min",
      excerpt: "Everything worthwhile I\x27ve made happened in the same slot: early morning, before the world woke up.",
      sections: [
        {
          id: "unclaimed-hours",
          title: "The Unclaimed Hours",
          paragraphs: [
            "I am not a morning person by romantic temperament. I became one out of sheer defensive necessity, because the hours between 5:00 AM and 8:00 AM are the only ones the modern world hasn\x27t yet figured out how to claim.",
            "Before the notification stream begins its relentless trickle, the digital sky is clear. There are no urgent emails to reply to, no Slack pings to dodge, and no societal expectations pressing against your attention.",
          ],
        },
        {
          id: "architecture-of-silence",
          title: "The Architecture of Silence",
          paragraphs: [
            "In that pre-dawn stillness, the house is cold, the kettle is the only sound, and the mind is unfragmented. High-leverage creative work requires deep cognitive continuity — the ability to hold a complex architecture in your head for ninety uninterrupted minutes.",
            "You cannot buy that continuity in the afternoon between scheduled calls. You have to carve it out of the quiet hours.",
          ],
        },
        {
          id: "circadian-alignment",
          title: "Circadian Energy Alignment",
          paragraphs: [
            "I stopped pretending I could write thoughtful code or essays at 9:00 PM after a full workday. Evening energy is good for reading, administrative cleanup, and rest. Morning energy is for creation.",
            "Protecting your highest-quality hours for your most meaningful ambitions isn\x27t selfish; it\x27s the only way anything of lasting value ever gets built.",
          ],
        },
      ],
      content: [],
    },
    zh: {
      title: "静谧时分：清晨五点的创造力",
      readingTime: "3 分钟阅读",
      excerpt: "我创造过的所有有价值的东西，都诞生于同一个时刻：在世界苏醒之前的清晨。",
      sections: [
        {
          id: "unclaimed-hours",
          title: "未被瓜分的清晨",
          paragraphs: [
            "我并非天生的晨型人。之所以早起，完全是出于自我保护的必要——清晨五点到八点，是这个喧嚣世界尚未学会染指与剥夺的唯一净土。",
            "在通知流开始无休止地涌入之前，数字天空一片澄澈。没有需要即刻回复的邮件，没有突如其来的消息弹窗，更没有任何外界预期在撕扯你的注意力。",
          ],
        },
        {
          id: "architecture-of-silence",
          title: "静默的建筑结构",
          paragraphs: [
            "在黎明前的静谧中，屋子里微凉，烧水壶是唯一的声响，思维保持着纯粹的完整。高杠杆的创造性工作需要极度的心智连贯性——能将复杂的逻辑框架在脑中连续推演九十分钟而不被打断。",
            "在下午零碎会议的夹缝中你买不到这种连贯性。你只能从属于你自己的静谧时分中将它开凿出来。",
          ],
        },
        {
          id: "circadian-alignment",
          title: "顺应昼夜节律的创造",
          paragraphs: [
            "我不再自欺欺人地认为在经历了全天消耗后的晚上九点还能写出精妙的代码或深度的文章。夜晚的精力适合阅读、整理琐碎杂务与安眠，而清晨的清冽才是专属于创造的黄金时刻。",
            "将你最充沛、纯净的精力留给自己最重要的事业，这不是自私，而是让真正有价值的作品得以诞生的唯一途径。",
          ],
        },
      ],
      content: [],
    },
    sections: [],
    content: [],
  },
  {
    slug: "notes-on-taste",
    coverImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80",
    date: "2026-02-11",
    tags: ["Design", "Craft", "Aesthetics"],
    title: "Notes on Taste",
    readingTime: "5 min",
    excerpt: "Taste isn\x27t knowing what\x27s good. It\x27s the gap between what you can recognize and what you can make.",
    en: {
      title: "Notes on Taste",
      readingTime: "5 min",
      excerpt: "Taste isn\x27t knowing what\x27s good. It\x27s the gap between what you can recognize and what you can make.",
      sections: [
        {
          id: "the-ira-glass-gap",
          title: "The Ira Glass Paradox",
          paragraphs: [
            "Ira Glass once gave the definitive explanation of the creative gap: when you start creating, your taste is already exceptional, but your technical execution lags painfully behind. Because of your good taste, you can see clearly that what you\x27ve made is mediocre.",
            "Most beginners quit here because the dissonance between their aspiration and their output is too humiliating to endure.",
          ],
        },
        {
          id: "expensive-to-satisfy",
          title: "Expensive to Satisfy",
          paragraphs: [
            "Taste is relatively cheap to acquire: you can develop an exquisite critical eye in a year of diligent observation and immersion in great work. But closing the chasm between that discerning eye and your own craft takes a decade of volume.",
            "Having high standards is a blessing in your critique, but a brutal burden during the messy middle of creation.",
          ],
        },
        {
          id: "the-bridge-of-volume",
          title: "The Bridge of Volume",
          paragraphs: [
            "The only known bridge across that canyon is high-volume, relentless iteration. You have to write fifty bad essays to write five memorable ones. You have to design a hundred clunky interfaces to build one that feels effortlessly natural.",
            "Do not mistake the acute discomfort of the gap for a signal of inadequacy. The discomfort is proof that your taste is working. Keep building anyway.",
          ],
        },
      ],
      content: [],
    },
    zh: {
      title: "关于品味：眼界与手艺的距离",
      readingTime: "5 分钟阅读",
      excerpt: "品味不仅是辨识美，更是你在能鉴赏之物与能创造之物之间感受到的真实断层。",
      sections: [
        {
          id: "the-ira-glass-gap",
          title: "伊拉·格拉斯悖论",
          paragraphs: [
            "著名制作人伊拉·格拉斯曾精辟剖析过创作中的断层现象：当你踏入创作领域时，你的审美眼界早已达到很高的水准，但手头技艺却远远落后。正因你品味卓越，你才能一眼看出自己做出来的东西有多么平庸。",
            "许多初学者正是在这个阶段放弃的——因为眼界与实际产出之间的巨大落差令人感到无地自容。",
          ],
        },
        {
          id: "expensive-to-satisfy",
          title: "低成本形成，高成本满足",
          paragraphs: [
            "培养品味的成本相对低廉：经过一年的专注观察与顶级作品熏陶，你便能拥有敏锐的批判眼光。然而，要用你自己的双手跨越眼界与手艺之间的鸿沟，需要长达数年的高密度历练。",
            "严苛的审美标准在鉴赏时是一种恩赐，但在创作艰难的前半程，却是一份沉重的心理负荷。",
          ],
        },
        {
          id: "the-bridge-of-volume",
          title: "唯有数量能架起桥梁",
          paragraphs: [
            "跨越这道鸿沟唯一的已知桥梁，就是不计得失的高频迭代。你必须写下五十篇平庸的草稿，才能淘洗出五篇传世之作；你必须设计一百套笨拙的原型，才能凝练出一套浑然天成的交互。",
            "切勿将断层带来的焦虑误判为才能的欠缺。这种痛苦恰恰证明你的品味在发挥作用。坚持创造下去即可。",
          ],
        },
      ],
      content: [],
    },
    sections: [],
    content: [],
  },
];

export function getPost(slug: string) {
  const p = posts.find((item) => item.slug === slug);
  if (!p) return undefined;
  // populate fallbacks
  return {
    ...p,
    title: p.en.title,
    readingTime: p.en.readingTime,
    excerpt: p.en.excerpt,
    sections: p.en.sections,
    content: p.en.content || [],
  };
}

export function formatDate(iso: string, lang: "en" | "zh" = "en") {
  if (lang === "zh") {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
