// File: src/app/blog/mystory/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Share,
  Star,
  MessageSquareText,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Trash2
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

const MyStoryListPage: React.FC = () => {
  const [items, setItems] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch categories & blogs
  const fetchData = async (pageNum: number, initial = false) => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      initial ? setLoading(true) : setLoadingMore(true);

      const [categoriesRes, blogsRes] = await Promise.all([
        axios.get("/api/category/read", { signal }),
        axios.get(`/api/blog/mystory/read?page=${pageNum}&limit=10`, { signal })
      ]);

      const { items: fetched, totalPages } = blogsRes.data.data;
      setCategories(categoriesRes.data.data);
      setHasMore(pageNum < totalPages);
      setItems(prev => (pageNum === 1 ? fetched : [...prev, ...fetched]));
      setError(null);
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.message || "Failed to load data");
      }
    } finally {
      initial ? setLoading(false) : setLoadingMore(false);
    }
  };

  // Delete handler
  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await axios.delete(`/api/blog/mystory/delete/${blogId}`);
      // Remove from UI
      setItems(prev => prev.filter(item => item._id !== blogId));
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err.response?.data?.error || "Failed to delete story");
    }
  };

  const getCategoryNameById = (id: string): string => {
    const found = categories.find(c => c._id === id);
    return found ? found.name : "";
  };

  const handleScroll = useCallback(() => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 500 && !loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => { fetchData(1, true); }, []);
  useEffect(() => { if (page !== 1) fetchData(page); }, [page]);
  useEffect(() => { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, [handleScroll]);

  const renderSkeleton = () => (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e] px-4 py-8 md:px-8 mt-[30px]">
      {/* ... skeleton code unchanged ... */}
    </div>
  );

  if (loading) return renderSkeleton();
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;
  if (items.length === 0) return <div className="min-h-screen flex items-center justify-center"><p>No stories found.</p></div>;

  const [featured, ...rest] = items;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 mt-[30px] px-4 py-8 md:px-8">
      {/* Featured */}
      {featured && (
        <div className="relative mb-7">
          <Link href={`/story/edit/${featured._id}`}>
            <div className="flex flex-col sm:flex-row max-w-6xl mx-auto rounded-md overflow-hidden bg-[#f0efeb] dark:bg-[#2a2a2a] shadow-sm">
              <img src={featured.featureImage} alt={featured.title} className="w-full sm:w-64 h-48 object-cover" />
              <div className="p-4 sm:p-6 w-full">
                <h2 className="text-xl font-bold mb-2">{featured.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">{parseContentText(featured.content)}</p>
              </div>
            </div>
          </Link>
          {/* Delete button */}
          <button onClick={() => handleDelete(featured._id)} className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {rest.map(blog => (
          <div key={blog._id} className="relative bg-[#f0efeb] dark:bg-[#2a2a2a] rounded-md overflow-hidden shadow-sm">
            <Link href={`/story/edit/${blog._id}`}>
              <img src={blog.featureImage} alt={blog.title} className="w-full h-32 object-cover" />
            </Link>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{parseContentText(blog.content)}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                <Share className="w-4 h-4" /><span>{blog.shares}</span>
                <Star className="w-4 h-4" /><span>{blog.likes.length}</span>
                <MessageSquareText className="w-4 h-4" /><span>{blog.commentsCount}</span>
              </div>
            </div>
            {/* Delete button */}
            <button onClick={() => handleDelete(blog._id)} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {loadingMore && <p className="text-center mt-6">Loading more...</p>}
      {!hasMore && <p className="text-center mt-6">No more stories to load</p>}
    </div>
  );
};

export default MyStoryListPage;
