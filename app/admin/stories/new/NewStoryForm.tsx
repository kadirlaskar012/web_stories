"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/FormFields";
import { toast } from "@/components/ui/Toast";
import { ToastContainer } from "@/components/ui/Toast";

interface Props {
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
}

export default function NewStoryForm({ categories, authors }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [authorId, setAuthorId] = useState(authors[0]?.id || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (!categoryId) { setError("Category is required"); return; }
    if (!authorId) { setError("Author is required"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, categoryId, authorId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create story");
        return;
      }

      const story = await res.json();
      router.push(`/admin/stories/${story.id}/edit`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg" noValidate>
      <Input
        label="Story Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a compelling title"
        required
        autoFocus
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of the story"
        rows={3}
      />
      <Select
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Select a category"
      />
      <Select
        label="Author"
        value={authorId}
        onChange={(e) => setAuthorId(e.target.value)}
        options={authors.map((a) => ({ value: a.id, label: a.name }))}
        placeholder="Select an author"
      />

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} variant="secondary">
          Create Story & Open Editor
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
      <ToastContainer />
    </form>
  );
}
