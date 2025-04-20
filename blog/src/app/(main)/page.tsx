"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Share,
  Star,
  MessageSquareText,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from "lucide-react";
import Link from "next/link";

interface Blog {
  _id: string;
  title: string;
  content: string;
  featureImage: string;
  tags: string[];
  author: { fullName: string; image?: string };
  shares: number;
  likes: string[];
  dislikesCount: number;
  commentsCount: number;
  publishDateTime: string | null;
  categoryId: string;
}

interface Category {
  _id: string;
  name: string;
}

const parseContentText = (content: string | null): string => {
  if (!content) return "";
  try {
    const parsed = JSON.parse(content);

    const extractText = (node: any): string => {
      if (node.type === "text" && node.text) {
        return node.text;
      }
      if (Array.isArray(node.content)) {
        return node.content.map(extractText).join(" ");
      }
      return "";
    };

    const fullText = extractText(parsed).trim();
    const words = fullText.split(/\s+/);
    const truncated = words.slice(0, 21).join(" ");
    return words.length > 21 ? `${truncated}...` : truncated;
  } catch {
    return "";
  }
};


const BlogListPage: React.FC = () => {
  const [items, setItems] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = async (pageNum: number, initial = false) => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      initial ? setLoading(true) : setLoadingMore(true);
      
      const [categoriesRes, blogsRes] = await Promise.all([
        axios.get("/api/category/read", { signal }),
        axios.get(`/api/blog/read?page=${pageNum}&limit=10`, { signal })
      ]);

      const { items: fetched, totalPages } = blogsRes.data.data;
      
      setCategories(categoriesRes.data.data);
      setHasMore(pageNum < totalPages);
      
      if (pageNum === 1) {
        setItems(fetched);
      } else {
        setItems(prev => [...prev, ...fetched]);
      }
      
      setError(null);
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.message || "Failed to load data");
      }
    } finally {
      initial ? setLoading(false) : setLoadingMore(false);
    }
  };

  const getCategoryNameById = (id: string): string => {
    const found = categories.find(c => c._id === id);
    return found ? found.name : "";
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 500 && !loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    fetchData(1, true);
  }, []);

  useEffect(() => {
    if (page === 1) return;
    fetchData(page);
  }, [page]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  const renderSkeleton = () => (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e] px-4 py-8 md:px-8 mt-[30px]">
      {/* Featured Skeleton */}
      <div className="flex flex-col sm:flex-row max-w-6xl mx-auto rounded-md overflow-hidden mb-7 bg-[#f0efeb] dark:bg-[#2a2a2a] shadow-sm animate-pulse">
        <div className="w-full sm:w-64 h-48 sm:h-66 bg-[#e0dfdb] dark:bg-[#3a3a3a]" />
        <div className="p-4 sm:p-6 w-full">
          <div className="h-5 bg-[#e0dfdb] dark:bg-[#3a3a3a] mb-4 w-1/4" />
          <div className="h-8 bg-[#e0dfdb] dark:bg-[#3a3a3a] mb-2 w-3/4" />
          <div className="h-4 bg-[#e0dfdb] dark:bg-[#3a3a3a] mb-2 w-full" />
          <div className="h-4 bg-[#e0dfdb] dark:bg-[#3a3a3a] w-5/6" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#f0efeb] dark:bg-[#2a2a2a] rounded-md overflow-hidden flex flex-col shadow-sm animate-pulse">
            <div className="w-full h-32 sm:h-40 bg-[#e0dfdb] dark:bg-[#3a3a3a]" />
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
              <div className="h-4 bg-[#e0dfdb] dark:bg-[#3a3a3a] mb-2 w-1/2" />
              <div className="h-4 bg-[#e0dfdb] dark:bg-[#3a3a3a] mb-2 w-3/4" />
              <div className="mt-auto h-4 bg-[#e0dfdb] dark:bg-[#3a3a3a] w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#1e1e1e]">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#1e1e1e]">
        <p className="text-gray-700 dark:text-gray-300">No blogs found.</p>
      </div>
    );
  }

  const [featured, ...rest] = items;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 mt-[30px] px-4 py-8 md:px-8">
      {/* Featured */}
      {featured && (
        <Link href={`/blog/${featured._id}`}>
          <FeaturedBlog blog={featured} categories={categories} />
        </Link>
      )}

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {rest.map((blog) => (
          <BlogCard 
            key={blog._id} 
            blog={blog} 
            getCategoryName={getCategoryNameById} 
          />
        ))}
      </div>

      {loadingMore && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}

      {!hasMore && (
        <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
          No more blogs to load
        </p>
      )}
    </div>
  );
};

const FeaturedBlog = ({ blog, categories }: { blog: Blog, categories: Category[] }) => {
  const featuredDate = blog.publishDateTime
    ? new Date(blog.publishDateTime).toLocaleDateString()
    : "";
  const featuredText = parseContentText(blog.content);
  const categoryName = categories.find(c => c._id === blog.categoryId)?.name || "";

  return (
    <div className="flex flex-col sm:flex-row max-w-6xl mx-auto rounded-md overflow-hidden mb-7 bg-[#f0efeb] dark:bg-[#2a2a2a] shadow-sm">
      <img
        src={blog.featureImage}
        alt={blog.title}
        className="w-full sm:w-64 h-48 sm:h-66 object-cover"
      />
      <div className="p-4 sm:p-6 w-full flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {categoryName && (
              <span className="px-2 sm:px-3 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded text-xs sm:text-sm">
                {categoryName}
              </span>
            )}
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 sm:px-3 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded text-xs sm:text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">{blog.title}</h2>
          <p className="mb-2 text-sm sm:text-base whitespace-pre-line text-gray-700 dark:text-gray-300">
            {featuredText}
          </p>
        </div>

        <BlogFooter blog={blog} date={featuredDate} />
      </div>
    </div>
  );
};

const BlogCard = ({ blog, getCategoryName }: { blog: Blog, getCategoryName: (id: string) => string }) => {
  const date = blog.publishDateTime
    ? new Date(blog.publishDateTime).toLocaleDateString()
    : "";
  const text = parseContentText(blog.content);
  const categoryName = getCategoryName(blog.categoryId);

  return (
    <div className="bg-[#f0efeb] dark:bg-[#2a2a2a] rounded-md overflow-hidden flex flex-col shadow-sm">
      <Link href={`/blog/${blog._id}`}>
        <img
          src={blog.featureImage}
          alt={blog.title}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <div className="flex flex-wrap gap-2 mb-2">
            {categoryName && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded text-xs">
                {categoryName}
              </span>
            )}
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-semibold text-lg sm:text-xl mb-2 flex-grow">{blog.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base whitespace-pre-line">
            {text}
          </p>
          
          <BlogFooter blog={blog} date={date} compact />
        </div>
      </Link>
    </div>
  );
};

const BlogFooter = ({ blog, date, compact }: { blog: Blog, date: string, compact?: boolean }) => (
  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
    <div className="flex items-center gap-2">
      {blog.author.image ? (
        <img
          src={blog.author.image}
          alt={blog.author.fullName}
          className={`${compact ? 'w-5 h-5' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-full object-cover`}
        />
      ) : (
        <span className={`${compact ? 'w-5 h-5' : 'w-6 h-6 sm:w-8 sm:h-8'} rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs`}>
          {blog.author.fullName.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="flex flex-col">
        <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{blog.author.fullName}</span>
        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          {date}
        </span>
      </div>
    </div>
    <hr className="border-[d1d1d1] dark:border-[#3a3a3a] my-3" />
    
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 text-xs sm:text-sm">
        <StatItem icon={Share} value={blog.shares} />
        <StatItem icon={Star} value={blog.likes.length} />
        <StatItem icon={Bookmark} value={blog.commentsCount} />
      </div>
      <div className="inline-flex items-center space-x-2 text-xs sm:text-sm">
        <ActionButton icon={ThumbsUp} value={blog.likes.length} />
        <ActionButton icon={ThumbsDown} value={blog.dislikesCount} />
        <ActionButton icon={MessageSquareText} value={blog.commentsCount} />
      </div>
    </div>
  </div>
);

const StatItem = ({ icon: Icon, value }: { icon: any, value: number }) => (
  <div className="flex items-center gap-1">
    <Icon className="w-4 h-4" />
    <span>{value}</span>
  </div>
);

const ActionButton = ({ icon: Icon, value }: { icon: any, value: number }) => (
  <button className="flex items-center bg-[#e6e6e6] hover:text-[#faf9f6] dark:bg-[#333333] hover:bg-indigo-500 dark:hover:bg-indigo-400 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 transition">
    <Icon className="w-4 h-4 mr-1" /> {value}
  </button>
);

export default BlogListPage;