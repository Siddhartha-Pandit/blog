// blog\src\app\(main)\blog\[blogId]\page.tsx
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Eye,
  MessageSquareText,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  content: string;
  featureImage: string;
  tags: string[];
  author?: { fullName?: string; image?: string }; // Make author optional
  shares: number;
  likes: string[];
  dislikesCount: number;
  commentsCount: number;
  publishDateTime: string | null;
  categoryId: string;
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
          .join(" ");
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

const BlogDetailPage = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/blog/read/${blogId}`);
        setBlog(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  if (!blog) {
    return <div className="min-h-screen flex items-center justify-center">Blog not found</div>;
  }

  const publishDate = blog.publishDateTime 
    ? new Date(blog.publishDateTime).toLocaleDateString()
    : "";
  const contentText = parseContentText(blog.content);

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <img
          src={blog.featureImage}
          alt={blog.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{blog.title}</h1>
        
        {blog.author && (
          <div className="flex items-center gap-4 mb-8">
            {blog.author.image ? (
              <img
                src={blog.author.image}
                alt={blog.author.fullName || 'Author'}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                {(blog.author.fullName?.charAt(0) || 'A').toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{blog.author.fullName || 'Anonymous Author'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{publishDate}</p>
            </div>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none mb-8">
          {contentText.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="flex gap-4 items-center border-t pt-4">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            <span>{blog.likes.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-5 h-5" />
            <span>{blog.dislikesCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5" />
            <span>{blog.commentsCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span>{blog.shares}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;