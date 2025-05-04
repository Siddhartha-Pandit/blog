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
import Image from "next/image"; // ✅ Using Next.js optimized image

import { parseDoc } from "@/lib/parseDocs";

interface Author {
  fullName?: string;
  image?: string;
}

interface Blog {
  _id: string;
  title: string;
  content: BlockNode[];
  featureImage: string;
  tags: string[];
  author?: Author;
  shares: number;
  likes: string[];
  dislikesCount: number;
  commentsCount: number;
  publishDateTime: string | null;
  categoryId: string;
}

interface BlockNode {
  type: string;
  [key: string]: unknown; // Define more specific keys if possible
}

const BlogDetailPage: React.FC = () => {
  const params = useParams<{ blogId: string }>();
  const blogId = params?.blogId;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!blogId) return;

        const res = await axios.get(`/api/blog/read/${blogId}`);
        const raw = res.data.data;

        let nodes: BlockNode[] = [];
        if (typeof raw.content === "string") {
          try {
            const parsed = JSON.parse(raw.content);
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
      } catch (err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Failed to load blog");
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
              <Image
                src={blog.author.image}
                alt={blog.author.fullName || "Author"}
                width={48}
                height={48}
                className="rounded-full"
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

        <div className="flex flex-row flex-wrap justify-between items-center border-t border-b pt-4 gap-4">
          <div className="flex flex-row space-x-6">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5" />
              <span>{blog.likes.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThumbsDown className="w-5 h-5" />
              <span>{blog.dislikesCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquareText className="w-5 h-5" />
              <span>{blog.commentsCount}</span>
            </div>
          </div>

          <div className="flex flex-row space-x-6">
            <div className="flex items-center space-x-2">
              <Share className="w-5 h-5" />
              <span>{blog.shares}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>2.3</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
        </div>

        <article className="prose dark:prose-invert max-w-none mb-8 mt-6">
          {blog.content.length > 0
            ? parseDoc(blog.content)
            : <p>No content to display.</p>}
        </article>
      </div>
    </div>
  );
};

export default BlogDetailPage;
