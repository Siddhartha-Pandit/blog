"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Share,
  MessageSquareText,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Star
} from "lucide-react";

import { parseDoc } from "@/lib/parseDocs";

interface Blog {
  _id: string;
  title: string;
  content: any[];
  featureImage: string;
  tags: string[];
  author?: { fullName?: string; image?: string };
  shares: number;
  likes: string[];
  dislikesCount: number;
  commentsCount: number;
  publishDateTime: string | null;
  categoryId: string;
}

const BlogDetailPage: React.FC = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`/api/blog/read/${blogId}`);
        const raw = res.data.data;
        console.log(raw)
        // Parse out the ProseMirror "doc" JSON string:
        let nodes: any[] = [];
        if (typeof raw.content === "string") {
          try {
            const parsed = JSON.parse(raw.content);
            // If your JSON is { type: "doc", content: [...] }
            nodes = Array.isArray(parsed.content) ? parsed.content : [];
          } catch {
            console.warn("Failed to JSON.parse blog.content");
          }
        } else if (Array.isArray(raw.content)) {
          nodes = raw.content;
        }

        setBlog({
          ...raw,
          content: nodes,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Blog not found
      </div>
    );
  }

  const publishDate = blog.publishDateTime
    ? new Date(blog.publishDateTime).toLocaleDateString()
    : "";

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e] py-12 px-4 sm:px-6 lg:px-8 mt-[30px]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          {blog.title}
        </h1>

        {blog.author && (
          <div className="flex items-center gap-4 mb-8">
            {blog.author.image ? (
              <img
                src={blog.author.image}
                alt={blog.author.fullName || "Author"}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                {(blog.author.fullName?.charAt(0) || "A").toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">
                {blog.author.fullName || "Anonymous Author"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {publishDate}
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-row sm:flex-row flex-wrap justify-between items-center border-t border-b pt-4 gap-4 sm:gap-6 md:gap-8">
          <div className="flex flex-row">
            {/* Likes */}
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>{blog.likes.length}</span>
            </div>

            {/* Dislikes */}
            <div className="flex items-center space-x-2">
              <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>{blog.dislikesCount}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-2">
              <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>{blog.commentsCount}</span>
            </div>
          </div>
          <div className="flex flex-row">
           
            <div className="flex items-center space-x-2">
              <Share className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>0</span>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span>2.3</span>
            </div>

            {/* Shares */}
            
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>

        </div>
        <article className="prose dark:prose-invert max-w-none mb-8">
          {blog.content.length > 0
            ? parseDoc(blog.content)
            : <p>No content to display.</p>}
        </article>


      </div>
    </div>
  );
};

export default BlogDetailPage;
