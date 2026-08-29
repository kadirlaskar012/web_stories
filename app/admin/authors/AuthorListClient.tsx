"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormFields";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { Plus, Edit2, Trash2, Globe } from "lucide-react";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  _count: { stories: number };
}

export default function AuthorListClient({ initialAuthors }: { initialAuthors: Author[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingAuthor(null);
    setName("");
    setSlug("");
    setBio("");
    setAvatar("");
    setWebsite("");
    setTwitter("");
    setInstagram("");
    setLinkedin("");
    setModalOpen(true);
  };

  const openEditModal = (a: Author) => {
    setEditingAuthor(a);
    setName(a.name);
    setSlug(a.slug);
    setBio(a.bio || "");
    setAvatar(a.avatar || "");
    setWebsite(a.website || "");
    setTwitter(a.twitter || "");
    setInstagram(a.instagram || "");
    setLinkedin(a.linkedin || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Author name is required");
    setLoading(true);
    try {
      const payload = { name, slug, bio, avatar, website, twitter, instagram, linkedin };
      if (editingAuthor) {
        const res = await fetch(`/api/authors/${editingAuthor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update author");
        toast.success("Author updated");
      } else {
        const res = await fetch("/api/authors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create author");
        toast.success("Author created");
      }
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/authors/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Author deleted");
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage content creators and story bylines</p>
        </div>
        <Button onClick={openCreateModal} variant="secondary" size="md">
          <Plus className="w-4 h-4" /> Add Author
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bio</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Social Links</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stories</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {authors.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs text-gray-600">
                      {a.avatar ? (
                        <Image src={a.avatar} alt={a.name} width={36} height={36} className="w-full h-full object-cover" />
                      ) : (
                        a.name[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-400 font-mono">@{a.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{a.bio || "—"}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 text-gray-400">
                    {a.website && <Globe className="w-3.5 h-3.5 hover:text-gray-700" />}
                    {a.twitter && <TwitterIcon className="w-3.5 h-3.5 hover:text-blue-400" />}
                    {a.instagram && <InstagramIcon className="w-3.5 h-3.5 hover:text-pink-500" />}
                    {a.linkedin && <LinkedinIcon className="w-3.5 h-3.5 hover:text-blue-600" />}
                    {!a.website && !a.twitter && !a.instagram && !a.linkedin && "—"}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center font-medium text-gray-700">{a._count?.stories || 0}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(a)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={`Edit ${a.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Delete ${a.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                  No authors found. Click &quot;Add Author&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAuthor ? "Edit Author" : "New Author"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          <Input label="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input label="Avatar Image URL" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
          <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            <Input label="Twitter URL" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/..." />
            <Input label="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
            <Input label="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={loading}>{editingAuthor ? "Update Author" : "Create Author"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Author"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={loading}
      />
    </div>
  );
}
