"use client";

import { useState, useEffect } from "react";
import { posts as defaultPosts, type Post, type PostSection, type PostContent } from "../data/posts";

const STORAGE_KEY = "shuo_blog_custom_posts_v1";

export type { Post, PostSection, PostContent };

export function getStoredPosts(): Post[] {
  if (typeof window === "undefined") return defaultPosts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPosts));
      return defaultPosts;
    }
    const parsed = JSON.parse(raw) as Post[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPosts));
      return defaultPosts;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load posts from storage", e);
    return defaultPosts;
  }
}

export function saveAllPosts(posts: Post[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    // Dispatch custom storage event for same-tab reactivity
    window.dispatchEvent(new Event("blog_posts_updated"));
  } catch (e) {
    console.error("Failed to save posts to localStorage (storage quota might be exceeded):", e);
  }
}

export function getStoredPost(slug: string): Post | undefined {
  const all = getStoredPosts();
  return all.find((p) => p.slug === slug);
}

export function upsertStoredPost(post: Post): Post[] {
  const all = getStoredPosts();
  const index = all.findIndex((p) => p.slug === post.slug);
  let updated: Post[];
  if (index >= 0) {
    updated = [...all];
    updated[index] = post;
  } else {
    updated = [post, ...all];
  }
  saveAllPosts(updated);
  return updated;
}

export function deleteStoredPost(slug: string): Post[] {
  const all = getStoredPosts();
  const updated = all.filter((p) => p.slug !== slug);
  saveAllPosts(updated);
  return updated;
}

export function resetPostsToDefault(): Post[] {
  saveAllPosts(defaultPosts);
  return defaultPosts;
}

// React Hook to listen for reactive post updates across components
export function usePostsStore() {
  const [postsList, setPostsList] = useState<Post[]>(() => getStoredPosts());

  useEffect(() => {
    const handler = () => {
      setPostsList(getStoredPosts());
    };

    window.addEventListener("blog_posts_updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("blog_posts_updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const getPost = (slug: string) => {
    return postsList.find((p) => p.slug === slug) || getStoredPost(slug);
  };

  const savePost = (post: Post) => {
    const updated = upsertStoredPost(post);
    setPostsList(updated);
  };

  const deletePost = (slug: string) => {
    const updated = deleteStoredPost(slug);
    setPostsList(updated);
  };

  const resetDefaults = () => {
    const updated = resetPostsToDefault();
    setPostsList(updated);
  };

  return {
    posts: postsList,
    getPost,
    savePost,
    deletePost,
    resetDefaults,
  };
}

// Generate valid TypeScript source code for posts.ts
export function generatePostsTsExport(posts: Post[]): string {
  return `export interface PostSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface PostContent {
  title: string;
  readingTime: string;
  excerpt: string;
  sections: PostSection[];
  content: string[];
}

export interface Post {
  slug: string;
  date: string;
  tags: string[];
  en: PostContent;
  zh: PostContent;
  title: string;
  readingTime: string;
  excerpt: string;
  sections: PostSection[];
  content: string[];
}

export const posts: Post[] = ${JSON.stringify(posts, null, 2)};

export function getPost(slug: string) {
  const p = posts.find((item) => item.slug === slug);
  if (!p) return undefined;
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
    return \`\${d.getFullYear()}年\${d.getMonth() + 1}月\${d.getDate()}日\`;
  }
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
`;
}
