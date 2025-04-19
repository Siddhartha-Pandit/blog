"use client";
import React from "react";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

interface BlogActionsProps {
  likesCount: number;
  commentsCount?: number;
  onLike?: () => void;
  onDislike?: () => void;
  onComment?: () => void;
}

export const BlogActions: React.FC<BlogActionsProps> = ({
  likesCount,
  commentsCount = 0,
  onLike,
  onDislike,
  onComment,
}) => (
  <div className="inline-flex items-center divide-x divide-gray-600 bg-gray-700 dark:bg-gray-800 rounded-full">
    <button
      onClick={onLike}
      className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors rounded-l-full"
    >
      <ThumbsUp className="w-4 h-4" />
      <span>Like ({likesCount})</span>
    </button>
    <button
      onClick={onDislike}
      className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
    >
      <ThumbsDown className="w-4 h-4" />
      <span>Dislike</span>
    </button>
    <button
      onClick={onComment}
      className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-r-full"
    >
      <MessageCircle className="w-4 h-4" />
      <span>Comment ({commentsCount})</span>
    </button>
  </div>
);
