"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Eye,
  Star,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  metaDescription: string;
  featureImage: string;
  tags: string[];
  author: { fullName: string; image?: string };
  shares: number;
  likes: string[];
  publishDateTime: string;
}

const BlogListPage: React.FC = () => {
  const [items, setItems] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/blog/read?page=${pageNum}&limit=6`
      );
      const {
        items: fetched,
        page: current,
        totalPages: totalP,
      } = res.data.data;
      setItems(fetched);
      setPage(current);
      setTotalPages(totalP);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

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
        <p className="text-gray-700 dark:text-gray-200">No blogs found.</p>
      </div>
    );
  }

  const [featured, ...rest] = items;
  const featuredDate = new Date(featured.publishDateTime).toLocaleDateString();

  return (
    <div className="min-h-screen bg-[#faf9f6] mt-[120px] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 px-4 py-8 md:px-8">
      {/* Featured */}
      <div className="flex flex-row max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg mb-12 bg-white dark:bg-gray-800">
        <img
          src={featured.featureImage}
          alt={featured.title}
          className="w-64 h-64 object-cover"
        />
        <div className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {featured.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-indigo-100 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
              {featured.title}
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              {featured.metaDescription}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {featured.author.image ? (
                <img
                  src={featured.author.image}
                  alt={featured.author.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm">
                  {featured.author.fullName.charAt(0).toUpperCase()}
                </span>
              )}
              <span>{featured.author.fullName}</span>
              <span>•</span>
              <span>{featuredDate}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Eye className="w-5 h-5" />
                <span>{featured.shares}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5" />
                <span>{featured.likes.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5" />
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {rest.map((blog) => {
          const date = new Date(blog.publishDateTime).toLocaleDateString();
          return (
            <div
              key={blog._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden flex flex-col"
            >
              <img
                src={blog.featureImage}
                alt={blog.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-blue-100 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-semibold text-xl mb-2 flex-grow">
                  {blog.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                  {blog.metaDescription}
                </p>

                {/* Author & Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    {blog.author.image ? (
                      <img
                        src={blog.author.image}
                        alt={blog.author.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        {blog.author.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span>{blog.author.fullName}</span>
                    <span>•</span>
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{blog.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>0</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{blog.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {[...Array(totalPages)].map((_, idx) => {
          const num = idx + 1;
          return (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                page === num
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {num}
            </button>
          );
        })}
        <button
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BlogListPage;