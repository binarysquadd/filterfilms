'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, X, Video, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/src/components/ui/button';
import { Input } from '@/app/src/components/ui/input';
import { eventTypes, Gallery, EventType, CategoryValue } from '@/app/types/gallery';
import { Label } from '@/app/src/components/ui/label';
import toast from 'react-hot-toast';
import DeleteModal from '@/app/src/components/common/modal/delete-modal';

interface Props {
  initialGallery?: Gallery[];
}

export default function ManageGallery({ initialGallery }: Props) {
  const router = useRouter();

  /* ----------------------------------------
     STATE
  ----------------------------------------- */
  const [gallery, setGallery] = useState<Gallery[]>(initialGallery || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  /* FILE STATES */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  /* DELETE */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* FORM DATA */
  const [formData, setFormData] = useState({
    type: 'photo' as 'photo' | 'video',
    videoSource: 'external' as 'external' | 'upload',
    title: '',
    url: '',
    eventType: 'Wedding' as EventType,
    category: eventTypes.Wedding.categories[0].value,
  });

  const fetchGallery = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      if (res.ok) setGallery(data.galleries || []);
    } catch {
      toast.error('Failed to fetch gallery');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!initialGallery || initialGallery.length === 0) {
      fetchGallery();
    }
  }, [initialGallery, fetchGallery]);

  /* CLEAN PREVIEWS */
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [imagePreview, thumbnailPreview]);

  /* ----------------------------------------
     UPLOAD
  ----------------------------------------- */
  const uploadFile = async (file: File): Promise<string> => {
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

  /* ----------------------------------------
     SUBMIT
  ----------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalUrl = formData.url;
      let finalThumbnail = '';

      if (formData.type === 'photo' && imageFile) {
        finalUrl = await uploadFile(imageFile);
      }

      if (formData.type === 'video' && formData.videoSource === 'upload' && videoFile) {
        finalUrl = await uploadFile(videoFile);
      }

      if (formData.type === 'video' && thumbnailFile) {
        finalThumbnail = await uploadFile(thumbnailFile);
      }

      const payload = {
        type: formData.type,
        title: formData.title,
        url: finalUrl,
        thumbnail: formData.type === 'video' ? finalThumbnail : undefined,
        videoSource: formData.type === 'video' ? formData.videoSource : undefined,
        eventType: formData.eventType,
        category: formData.category,
      };

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setGallery((prev) => [...prev, result.gallery]);
      toast.success('Gallery item added');
      closeModal();
      router.refresh();
    } catch {
      toast.error('Failed to add gallery item');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------
     DELETE
  ----------------------------------------- */
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/gallery/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setGallery((prev) => prev.filter((g) => g.id !== deleteId));
        toast.success('Deleted');
        router.refresh();
      }
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'photo',
      videoSource: 'external',
      title: '',
      url: '',
      eventType: 'Wedding',
      category: eventTypes.Wedding.categories[0].value,
    });
    setImageFile(null);
    setVideoFile(null);
    setThumbnailFile(null);
    setImagePreview(null);
    setThumbnailPreview(null);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  /* ----------------------------------------
     UI
  ----------------------------------------- */
  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Gallery</h1>
          <p className="text-muted-foreground">Upload photos & videos</p>
        </div>
        <Button variant="royal" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {/* GRID */}
      {isFetching ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="relative group rounded overflow-hidden">
              <Image
                src={item.type === 'video' ? item.thumbnail! : item.url}
                alt={item.title}
                width={400}
                height={300}
                className="object-cover h-48 w-full"
              />
              <button
                onClick={() => {
                  setDeleteId(item.id);
                  setDeleteOpen(true);
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex justify-center items-center"
              >
                <Trash2 className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-xl max-h-[70vh] overflow-y-auto rounded-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div className="flex justify-between border-b pb-2 mb-4">
                <h2 className="text-xl font-bold">Add Gallery Item</h2>
                <X onClick={closeModal} className="cursor-pointer" />
              </div>
              {/* TYPE */}
              <div className="flex gap-6">
                <Label className="flex items-center gap-2">
                  <Input
                    type="radio"
                    checked={formData.type === 'photo'}
                    onChange={() => setFormData({ ...formData, type: 'photo' })}
                  />
                  <ImageIcon className="w-4 h-4" /> Photo
                </Label>

                <Label className="flex items-center gap-2">
                  <Input
                    type="radio"
                    checked={formData.type === 'video'}
                    onChange={() => setFormData({ ...formData, type: 'video' })}
                  />
                  <Video className="w-4 h-4" /> Video
                </Label>
              </div>

              {/* VIDEO SOURCE */}
              {formData.type === 'video' && (
                <div className="flex gap-6">
                  <Label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      checked={formData.videoSource === 'external'}
                      onChange={() =>
                        setFormData({ ...formData, videoSource: 'external', url: '' })
                      }
                    />
                    Video URL
                  </Label>

                  <Label className="flex items-center gap-2">
                    <Input
                      type="radio"
                      checked={formData.videoSource === 'upload'}
                      onChange={() => setFormData({ ...formData, videoSource: 'upload', url: '' })}
                    />
                    Upload Video
                  </Label>
                </div>
              )}
              {/* TITLE */}
              <div className="">
                <Label className="">Event Title</Label>
                <Input
                  placeholder="Title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* ================= MEDIA INPUTS ================= */}
              <div className="space-y-4">
                {/* PHOTO UPLOAD */}
                {formData.type === 'photo' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Photo</Label>

                    {imagePreview && (
                      <div className="relative h-32 rounded-lg overflow-hidden border">
                        <Image
                          src={imagePreview}
                          alt="Photo preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Input
                        key="photo"
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImageFile(file);
                          if (file) setImagePreview(URL.createObjectURL(file));
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />

                      <div className="h-11 px-3 flex items-center border rounded-md justify-center text-sm gap-2">
                        <UploadCloud className="w-4 h-4" />
                        <span className="truncate">
                          {imageFile ? imageFile.name : 'Select Photo'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIDEO URL */}
                {formData.type === 'video' && formData.videoSource === 'external' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Video URL</Label>

                    <Input
                      placeholder="https://youtube.com/..."
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                )}

                {/* VIDEO UPLOAD */}
                {formData.type === 'video' && formData.videoSource === 'upload' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Video File</Label>

                    <div className="relative">
                      <Input
                        key="video"
                        type="file"
                        accept="video/*"
                        required
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />

                      <div className="h-11 px-3 flex items-center justify-center border rounded-md text-sm gap-2">
                        <UploadCloud className="w-4 h-4" />
                        <span className="truncate">
                          {videoFile ? videoFile.name : 'Select Video File'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIDEO THUMBNAIL */}
                {formData.type === 'video' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Video Thumbnail</Label>

                    {thumbnailPreview && (
                      <div className="relative h-32 rounded-lg overflow-hidden border">
                        <Image
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Input
                        key="thumb"
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setThumbnailFile(file);
                          if (file) setThumbnailPreview(URL.createObjectURL(file));
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />

                      <div className="h-11 px-3 flex items-center justify-center border rounded-md text-sm gap-2">
                        <UploadCloud className="w-4 h-4" />
                        <span className="truncate">
                          {thumbnailFile ? thumbnailFile.name : 'Select Thumbnail'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= EVENT & CATEGORY ================= */}
              <div className="space-y-4">
                {/* EVENT TYPE */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Event Type</Label>

                  <select
                    value={formData.eventType}
                    onChange={(e) => {
                      const event = e.target.value as EventType;

                      setFormData({
                        ...formData,
                        eventType: event,
                        category: eventTypes[event].categories[0].value,
                      });
                    }}
                    className="h-11 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.keys(eventTypes).map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CATEGORY */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Category</Label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as CategoryValue,
                      })
                    }
                    className="h-11 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {eventTypes[formData.eventType].categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-row mt-6">
                <Button variant="cancel" size={'sm'} onClick={closeModal} className="mr-2 w-full">
                  Cancel
                </Button>
                <Button type="submit" size={'sm'} disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 animate-spin" />}
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        open={deleteOpen}
        title="Delete Item"
        description="This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
