"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Eye,
  Star,
  MessageSquareText,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
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
    const extract = (node: any): string => {
      if (node.type === "paragraph" && Array.isArray(node.content)) {
        return node.content
          .filter((child: any) => child.type === "text" && child.text)
          .map((child: any) => child.text)
          .join("");
      }
      if (Array.isArray(node.content)) {
        return node.content.map(extract).join(" ");
      }
      return "";
    };
    return extract(parsed).trim();
  } catch {
    return "";
  }
};

const BlogListPage: React.FC = () => {
  const [items, setItems] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchData = async (pageNum: number) => {
    setLoading(true);
    try {
      // Fetch categories and blogs simultaneously
      const [categoriesRes, blogsRes] = await Promise.all([
        axios.get("/api/category/read"),
        axios.get(`/api/blog/read?page=${pageNum}&limit=10`)
      ]);
      const { items: fetched, page: current, totalPages: totalP } = blogsRes.data.data;
      setItems(fetched);
      setPage(current);
      setTotalPages(totalP);
      setCategories(categoriesRes.data.data);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  function getCategoryNameById(id: string, cats: Category[]): string {
    const found = cats.find((c) => c._id === id);
    return found ? found.name : "";
  }

  useEffect(() => {
    fetchData(page);
  }, [page]);
  useEffect(()=>{
    console.log(categories)
  },[categories])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#1e1e1e]">
        Loading...
      </div>
    );
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
  const featuredDate = featured.publishDateTime
    ? new Date(featured.publishDateTime).toLocaleDateString()
    : "";
  const featuredText = parseContentText(featured.content);
  const categoryName = getCategoryNameById(featured.categoryId, categories);

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 mt-[30px] px-4 py-8 md:px-8">
      {/* Featured */}
      <Link href={`/blog/${featured._id}`}>
      <div className="flex flex-col sm:flex-row max-w-6xl mx-auto rounded-md overflow-hidden mb-7 bg-[#f0efeb] dark:bg-[#2a2a2a] shadow-sm">
        <img
          src={featured.featureImage}
          alt={featured.title}
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
              {featured.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 sm:px-3 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded text-xs sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">{featured.title}</h3>
            <p className="mb-2 text-sm sm:text-base whitespace-pre-line text-gray-700 dark:text-gray-300">
              {featuredText}
            </p>
          </div>

          <div className="flex flex-col justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">

            <div className="flex items-center gap-2">
              {featured.author.image ? (
                <img
                  src={featured.author.image}
                  alt={featured.author.fullName}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              ) : (
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs sm:text-sm">
                  {featured.author.fullName.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{featured.author.fullName}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  {featuredDate}
                </span>
              </div>
            </div>
            <hr className="border-[d1d1d1] dark:border-[#3a3a3a] mb-3 mt-2" />
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{featured.shares}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{featured.likes.length}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" fill="currentColor" />
                  <span>{featured.commentsCount}</span>
                </div>
              </div>
              <div className="inline-flex items-center space-x-2 text-xs sm:text-sm">
                <button className="flex items-center bg-[#e6e6e6] hover:text-[#faf9f6] dark:bg-[#333333] hover:bg-indigo-500 dark:hover:bg-indigo-400 text-gray-800 dark:text-gray-200 rounded-md px-3 py-1 transition">
                  <ThumbsUp className="w-4 h-4 mr-1" /> {featured.likes.length}
                </button>
                <button className="flex items-center bg-[#e6e6e6] hover:text-[#faf9f6] dark:bg-[#333333] hover:bg-red-500 dark:hover:bg-red-400 text-gray-800 dark:text-gray-200 rounded-md px-3 py-1 transition">
                  <ThumbsDown className="w-4 h-4 mr-1" /> {featured.dislikesCount}
                </button>
                <button className="flex items-center bg-[#e6e6e6] hover:text-[#faf9f6] dark:bg-[#333333] hover:bg-blue-500 dark:hover:bg-blue-400 text-gray-800 dark:text-gray-200 rounded-md px-3 py-1 transition">
                  <MessageSquareText className="w-4 h-4 mr-1" /> {featured.commentsCount}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Link>
      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {rest.map((blog) => {
          const date = blog.publishDateTime
            ? new Date(blog.publishDateTime).toLocaleDateString()
            : "";
          const text = parseContentText(blog.content);
          return (
            <div
              key={blog._id}
              className="bg-[#f0efeb] dark:bg-[#2a2a2a] rounded-md overflow-hidden flex flex-col shadow-sm"
            >
            <Link href={`/blog/${blog._id}`}>

              <img
                src={blog.featureImage}
                alt={blog.title}
                className="w-full h-32 sm:h-40 object-cover"
              />
              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded text-xs">
                    category
                  </span>
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

                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-2">
                    {blog.author.image ? (
                      <img
                        src={blog.author.image}
                        alt={blog.author.fullName}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                        {blog.author.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-xs sm:text-sm">{blog.author.fullName}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {date}
                      </span>
                    </div>
                  </div>
                </div>
                <hr className="border-[d1d1d1] dark:border-[#3a3a3a] mb-3" />

                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{blog.likes.length}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Bookmark className="w-4 h-4" />
                      <span>{blog.commentsCount}</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 text-xs sm:text-sm">
                    <button className="flex items-center bg-[#e6e6e6] dark:bg-[#333333] hover:text-[#faf9f6] hover:bg-indigo-500 dark:hover:bg-indigo-400 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 transition">
                      <ThumbsUp className="w-4 h-4 mr-1" /> {blog.likes.length}
                    </button>
                    <button className="flex items-center bg-[#e6e6e6] dark:bg-[#333333] hover:bg-red-500 hover:text-[#faf9f6] dark:hover:bg-red-400 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 transition">
                      <ThumbsDown className="w-4 h-4 mr-1" /> {blog.dislikesCount}
                    </button>
                    <button className="flex items-center bg-[#e6e6e6] dark:bg-[#333333] hover:bg-blue-500 hover:text-[#faf9f6] dark:hover:bg-blue-400 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 transition">
                      <MessageSquareText className="w-4 h-4 mr-1" /> {blog.commentsCount}
                    </button>
                  </div>
                </div>
              </div>
              </Link>
            </div>
            
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mt-8 text-gray-900 dark:text-gray-100">
        <button
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-md bg-[#faf9f6] dark:bg-[#1e1e1e] hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {[...Array(totalPages)].map((_, idx) => {
          const num = idx + 1;
          return (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 rounded-md transition-colors text-xs sm:text-sm ${
                page === num
                  ? "bg-indigo-600 text-white"
                  : "bg-[#faf9f6] dark:bg-[#1e1e1e] hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {num}
            </button>
          );
        })}
        <button
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-md bg-[#faf9f6] dark:bg-[#1e1e1e] hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1e1e1e] dark:hover:text-white transition disabled:opacity-50"

        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BlogListPage;