"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, PlusCircle, XCircle, CheckCircle } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

const CategoryPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.back();
    }
  }, [session, status, router]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('/api/category/read');
      setCategories(res.data.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    if (session) fetchCategories();
  }, [session, fetchCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Name is required');
      return;
    }
    try {
      await axios.post('/api/category/create', { name: newName });
      setNewName('');
      fetchCategories();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setError(null);
  };

  const handleSave = async (id: string) => {
    if (!editingName.trim()) {
      setError('Name is required');
      return;
    }
    try {
      await axios.put(`/api/category/update/${id}`, { name: editingName });
      setEditingId(null);
      setEditingName('');
      fetchCategories();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`/api/category/delete/${id}`);
      fetchCategories();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#1e1e1e] transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Manage Categories
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleAdd} className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="New Category"
            className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {editingId === cat._id ? (
                <div className="flex items-center gap-2 flex-grow">
                  <input
                    type="text"
                    className="flex-grow bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <button
                    onClick={() => handleSave(cat._id)}
                    className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-lg text-gray-700 dark:text-gray-200">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => startEdit(cat)}
                      className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryPage;
