'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Video, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/src/components/ui/button';
import { Input } from '@/app/src/components/ui/input';
import { Gallery } from '@/app/types/gallery';
import { Label } from '@/app/src/components/ui/label';
import toast from 'react-hot-toast';
import DeleteModal from '@/app/src/components/common/modal/delete-modal';

const categories = [
  'Ceremony',
  'Bridal',
  'Portraits',
  'Mehndi',
  'Sangeet',
  'Reception',
  'Decor',
  'Films',
];

const eventTypes = ['Wedding', 'Pre-Wedding', 'Engagement'];

interface Props {
  initialGallery?: Gallery[];
}

export default function ManageGallery({ initialGallery }: Props) {
  const router = useRouter();

  const [gallery, setGallery] = useState<Gallery[]>(initialGallery || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /* ---------------- FILE STATES (NO AUTO UPLOAD) ---------------- */
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------------- FORM DATA ---------------- */
  const [formData, setFormData] = useState({
    type: 'photo' as 'photo' | 'video',
    title: '',
    url: '',
    thumbnail: '',
    category: 'Ceremony',
    eventType: 'Wedding',
  });

  /* ---------------- FETCH GALLERY ---------------- */
  useEffect(() => {
    if (!initialGallery || initialGallery.length === 0) {
      fetchGallery();
    }
  }, []);

  const fetchGallery = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      if (res.ok) setGallery(data.galleries || []);
    } catch {
      toast.error('Failed to fetch gallery items');
    } finally {
      setIsFetching(false);
    }
  };

  /* ---------------- CLEANUP PREVIEWS ---------------- */
  useEffect(() => {
    return () => {
      if (mainPreview) URL.revokeObjectURL(mainPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [mainPreview, thumbnailPreview]);

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  /* ---------------- UPLOAD HELPER ---------------- */
  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalUrl = formData.url;
      let finalThumbnail = formData.thumbnail;

      if (mainFile) {
        setIsUploading(true);
        finalUrl = await uploadImage(mainFile);
      }

      if (thumbnailFile) {
        setIsUploading(true);
        finalThumbnail = await uploadImage(thumbnailFile);
      }

      const payload = {
        type: formData.type,
        title: formData.title,
        url: finalUrl,
        thumbnail: formData.type === 'video' ? finalThumbnail : undefined,
        category: formData.category,
        eventType: formData.eventType,
      };

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setGallery((prev) => [...prev, result.gallery]);
      toast.success('Gallery item added successfully');

      resetForm();
      setIsModalOpen(false);
      router.refresh();
    } catch {
      toast.error('Failed to add gallery item');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/gallery/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery((prev) => prev.filter((item) => item.id !== deleteId));
        router.refresh();
        toast.success('Gallery item deleted successfully');
      } else {
        const result = await res.json();
        toast.error(result.error || 'Failed to delete gallery item');
      }
    } catch {
      toast.error('Failed to delete gallery item');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setFormData({
      type: 'photo',
      title: '',
      url: '',
      thumbnail: '',
      category: 'Ceremony',
      eventType: 'Wedding',
    });
    setMainFile(null);
    setThumbnailFile(null);
    setMainPreview(null);
    setThumbnailPreview(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Gallery</h1>
            <p className="text-muted-foreground">Upload and manage your portfolio</p>
          </div>
          <Button variant="royal" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>

        {/* Gallery Grid */}
        {isFetching ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden bg-card shadow"
              >
                <Image
                  src={item.type === 'video' ? item.thumbnail! : item.url!}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />

                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="text-popover w-10 h-10" />
                  </div>
                )}

                <button
                  onClick={() => openDeleteModal(item.id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                >
                  <Trash2 className="text-popover" />
                </button>

                <div className="p-3">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} • {item.eventType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-card w-full max-w-md rounded-xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Add Gallery Item</h2>
                <X onClick={() => setIsModalOpen(false)} className="cursor-pointer" />
              </div>

              {/* Type */}
              <div className="flex gap-8">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Input
                    type="radio"
                    name="mediaType"
                    checked={formData.type === 'photo'}
                    onChange={() => setFormData({ ...formData, type: 'photo' })}
                    className="w-5 h-5 accent-primary"
                  />

                  <ImageIcon className="w-6 h-6 text-foreground" />

                  <span className="text-base font-medium">Photo</span>
                </Label>

                <Label className="flex items-center gap-3 cursor-pointer">
                  <Input
                    type="radio"
                    name="mediaType"
                    checked={formData.type === 'video'}
                    onChange={() => setFormData({ ...formData, type: 'video' })}
                    className="w-5 h-5 accent-primary"
                  />

                  <Video className="w-6 h-6 text-foreground" />

                  <span className="text-base font-medium">Video</span>
                </Label>
              </div>

              <Label>
                <span className="text-base text-muted-foreground">Title</span>
                <Input
                  placeholder="Title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Label>

              {/* MAIN IMAGE */}
              {mainPreview && (
                <div className="relative h-32 rounded overflow-hidden">
                  <Image src={mainPreview} alt="Preview" fill className="object-cover" />
                </div>
              )}

              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setMainFile(file);
                    if (file) setMainPreview(URL.createObjectURL(file));
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                <div className="h-11 px-3 flex justify-center items-center border border-input rounded-md bg-background text-sm text-muted-foreground">
                  <Upload className="w-4 h-4 mr-2" />
                  {mainFile
                    ? mainFile.name
                    : formData.type === 'photo'
                      ? 'Select Image'
                      : 'Select Video Thumbnail'}
                </div>
              </div>

              {/* VIDEO THUMBNAIL */}
              {formData.type === 'video' && (
                <div className="space-y-3">
                  {/* Thumbnail Preview */}
                  {thumbnailPreview && (
                    <div className="relative h-32 rounded-lg overflow-hidden border">
                      <Image
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* File Input with Text Inside */}
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setThumbnailFile(file);
                        if (file) {
                          setThumbnailPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                    />

                    <div className="h-11 px-3 flex items-center border border-input rounded-md bg-background text-sm text-muted-foreground gap-2">
                      <Upload className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {thumbnailFile ? thumbnailFile.name : 'Select Video Thumbnail'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY + EVENT */}
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-10 border rounded px-3"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="h-10 border rounded px-3"
                >
                  {eventTypes.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>

                <Button type="submit" variant="royal" disabled={loading || isUploading}>
                  {(loading || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <DeleteModal
        open={deleteOpen}
        title="Delete Gallery Item"
        description="Are you sure you want to delete this gallery item? This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
