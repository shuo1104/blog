"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type StudioLang = "en" | "zh";

const STUDIO_LANG_KEY = "blog_studio_ui_lang";

export const DICTIONARY = {
  en: {
    // Nav
    studio: "Studio",
    authorCms: "AUTHOR CMS",
    allEssays: "All Essays",
    newEssay: "New Essay",
    settings: "Settings",
    viewPublic: "View Public Blog",
    signOut: "Sign Out",

    // Post List
    archiveTitle: "Essay Archive",
    archiveSubtitle: "Create, edit, preview and publish blog essays across English & Chinese",
    exportCode: "Export posts.ts",
    resetDefaults: "Reset",
    resetConfirm: "Are you sure you want to reset all posts to default demo articles?",
    writeNew: "Write New Essay",
    searchPlaceholder: "Search essays by title, tag, or slug...",
    all: "All",
    sections: "sections",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    cancel: "Cancel",
    noEssaysFound: "No essays match your search query.",
    exportModalTitle: "Exported posts.ts Source Code",
    exportModalDesc: "Copy and overwrite src/app/data/posts.ts for Git versioning.",
    copyCode: "Copy Full Code",
    copied: "Copied to Clipboard!",
    close: "Close",

    // Post Editor
    writeNewEssayTitle: "New Markdown Essay",
    editEssayTitle: "Edit Essay",
    publishBtn: "Publish Essay",
    publishedBtn: "Published!",
    writeMode: "Write",
    splitMode: "Split",
    previewMode: "Preview",
    pubMetadata: "Publication Metadata",
    urlSlug: "URL Slug",
    autoFromTitle: "Auto from Title",
    publishDate: "Publish Date",
    readingTime: "Estimated Reading Time",
    tagsLabel: "Tags & Categories",
    addTagPlaceholder: "Add tag + Enter...",
    coverImageLabel: "Cover Image & Banner (16:9)",
    uploadImageBtn: "Upload Image",
    replaceImageBtn: "Replace Image",
    removeImageBtn: "Remove",
    pasteUrlPlaceholder: "Or paste image URL (https://...)",
    dragDropImage: "Click or drag an image here to upload",
    sectionsDetected: "Sections detected",
    chars: "chars",
    markdownSource: "Markdown Source",
    livePreview: "Live Typography Preview",
    slugRequired: "Please enter a URL slug (e.g. on-writing-less)",

    // Settings & Analytics
    settingsTitle: "Studio & Analytics",
    settingsSubtitle: "Live readership metrics, article engagement, and security configuration",
    tabAnalytics: "Traffic & Analytics",
    tabSecurity: "Account Security",
    totalViews: "Total Page Views",
    vsLastMonth: "+14.8% vs last month",
    uniqueReaders: "Unique Readers",
    avgReadStat: "Avg. Read: 3m 48s (79% rate)",
    readerLikes: "Reader Likes",
    likesGrowth: "+22.3% this week (8.3% rate)",
    sharesFeeds: "Shares & Feeds",
    activeRss: "1,280 active RSS readers",
    velocityTitle: "Traffic & Engagement Velocity",
    velocitySubtitle: "Daily page views, unique readers, and reader interaction pulses",
    last14d: "Last 14 Days",
    last7d: "Last 7 Days",
    daySummary: "Day Summary:",
    pageViewsUnit: "Page Views",
    readersUnit: "Readers",
    likesUnit: "Likes",
    articleTableTitle: "Article-by-Article Performance",
    articleTableSubtitle: "Individual readership, likes count, and reading completion rates",
    publishedEssaysCount: "PUBLISHED ESSAYS",
    tableColTitle: "Essay Title",
    tableColViews: "Views (PV)",
    tableColReaders: "Readers (UV)",
    tableColLikes: "Likes (点赞)",
    tableColTime: "Avg Time",
    tableColCompletion: "Completion Rate",
    topChannelsTitle: "Top Traffic Channels",
    directAccess: "Direct Access / Bookmarks",
    twitterFeed: "Twitter / X Feed Links",
    githubProfile: "GitHub Repos & Profiles",
    searchEngines: "Search Engines (Google/Bing)",
    deviceTitle: "Reader Device Distribution",
    macDesktop: "Mac & Desktop Browsers",
    iosMobile: "iOS Safari & Mobile Devices",
    tabletsRss: "Tablets & RSS Feed Readers",
    accountSecurityHeading: "Author Account Security",
    studioUsername: "Studio Username",
    studioPassword: "Studio Password",
    saveNewCreds: "Save New Credentials",
    credsSuccess: "Credentials updated successfully! Use these next time you log in.",
    credsError: "Username and password cannot be empty.",
    studioLangLabel: "Studio Interface Language",
  },
  zh: {
    // Nav
    studio: "工作室",
    authorCms: "作者后台",
    allEssays: "全部文章",
    newEssay: "写文章",
    settings: "数据与设置",
    viewPublic: "查看前台博客",
    signOut: "退出登录",

    // Post List
    archiveTitle: "文章归档与管理",
    archiveSubtitle: "创建、编辑、预览与发布中英文博客文章",
    exportCode: "导出 posts.ts",
    resetDefaults: "重置",
    resetConfirm: "确定要将所有文章重置回默认的演示文章吗？",
    writeNew: "撰写新文章",
    searchPlaceholder: "搜索文章标题、标签或网址...",
    all: "全部",
    sections: "个章节",
    edit: "编辑",
    delete: "删除",
    confirm: "确认删除",
    cancel: "取消",
    noEssaysFound: "没有找到符合搜索条件的文章。",
    exportModalTitle: "导出的 posts.ts 源码",
    exportModalDesc: "复制并覆盖 src/app/data/posts.ts 进行 Git 版本归档。",
    copyCode: "复制全部代码",
    copied: "已复制到剪贴板！",
    close: "关闭",

    // Post Editor
    writeNewEssayTitle: "新建 Markdown 文章",
    editEssayTitle: "编辑文章",
    publishBtn: "发布文章",
    publishedBtn: "已发布！",
    writeMode: "编辑源码",
    splitMode: "双栏分屏",
    previewMode: "实时预览",
    pubMetadata: "文章发布元数据",
    urlSlug: "URL 网址后缀",
    autoFromTitle: "根据标题自动生成",
    publishDate: "发布日期",
    readingTime: "预计阅读时长",
    tagsLabel: "分类标签",
    addTagPlaceholder: "添加标签 + 回车...",
    coverImageLabel: "文章封面与头图 (16:9 比例)",
    uploadImageBtn: "上传图片",
    replaceImageBtn: "更换图片",
    removeImageBtn: "移除图片",
    pasteUrlPlaceholder: "或粘贴外部图片链接 (https://...)",
    dragDropImage: "点击或拖拽本地图片至此上传 (支持 JPG, PNG, WebP)",
    sectionsDetected: "个已识别章节",
    chars: "字符",
    markdownSource: "Markdown 源码",
    livePreview: "实时排版预览",
    slugRequired: "请输入文章 URL 网址后缀 (如 on-writing-less)",

    // Settings & Analytics
    settingsTitle: "Studio 设置与数据看板",
    settingsSubtitle: "实时读者数据、文章互动概览与安全设置",
    tabAnalytics: "流量与数据看板",
    tabSecurity: "账号与安全管理",
    totalViews: "全站总浏览量 (PV)",
    vsLastMonth: "+14.8% 本月增长",
    uniqueReaders: "独立阅读人数 (UV)",
    avgReadStat: "平均阅读: 3分48秒 (79% 完读率)",
    readerLikes: "读者点赞总数",
    likesGrowth: "+22.3% 本周点赞增速 (8.3% 互动率)",
    sharesFeeds: "转发与订阅人数",
    activeRss: "1,280 位活跃 RSS 订阅读者",
    velocityTitle: "访问与互动趋势图",
    velocitySubtitle: "每日独立浏览量、阅读人数与点赞脉冲",
    last14d: "近 14 天",
    last7d: "近 7 天",
    daySummary: "当日数据概览:",
    pageViewsUnit: "浏览量 (PV)",
    readersUnit: "阅读人数 (UV)",
    likesUnit: "点赞数",
    articleTableTitle: "每篇文章深度数据明细",
    articleTableSubtitle: "单篇阅读人数、点赞数及完读率统计",
    publishedEssaysCount: "篇已发布文章",
    tableColTitle: "文章标题",
    tableColViews: "浏览量 (PV)",
    tableColReaders: "读者数 (UV)",
    tableColLikes: "点赞 (Likes)",
    tableColTime: "平均时长",
    tableColCompletion: "完读率",
    topChannelsTitle: "主要流量来源渠道",
    directAccess: "直接访问 / 书签保存",
    twitterFeed: "Twitter / X 社交推文外链",
    githubProfile: "GitHub 仓库与个人主页",
    searchEngines: "搜索引擎 (Google/Bing)",
    deviceTitle: "读者终端设备分布",
    macDesktop: "Mac & 桌面端浏览器",
    iosMobile: "iOS Safari & 移动端设备",
    tabletsRss: "平板 & RSS 专有阅读器",
    accountSecurityHeading: "作者后台账号安全",
    studioUsername: "Studio 管理员账号",
    studioPassword: "Studio 管理员密码",
    saveNewCreds: "保存新凭证",
    credsSuccess: "账号密码已更新成功！下次登录时生效。",
    credsError: "账号和密码不能为空。",
    studioLangLabel: "Studio 界面语言设置",
  },
};

interface StudioI18nContextType {
  lang: StudioLang;
  setLang: (lang: StudioLang) => void;
  t: (key: keyof typeof DICTIONARY.en) => string;
}

const StudioI18nContext = createContext<StudioI18nContextType>({
  lang: "zh",
  setLang: () => {},
  t: (key) => DICTIONARY.zh[key] || key,
});

export function StudioI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<StudioLang>(() => {
    if (typeof window === "undefined") return "zh";
    return (localStorage.getItem(STUDIO_LANG_KEY) as StudioLang) || "zh";
  });

  const setLang = (newLang: StudioLang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STUDIO_LANG_KEY, newLang);
    }
  };

  const t = (key: keyof typeof DICTIONARY.en): string => {
    return DICTIONARY[lang][key] || DICTIONARY.en[key] || key;
  };

  return (
    <StudioI18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </StudioI18nContext.Provider>
  );
}

export function useStudioI18n() {
  return useContext(StudioI18nContext);
}
