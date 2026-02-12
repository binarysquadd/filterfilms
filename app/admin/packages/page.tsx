'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Upload, Loader2, Package as PackageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/app/src/components/ui/button';
import { Packages, Category, CATEGORY } from '@/app/types/package';
import { Input } from '@/app/src/components/ui/input';
import { Textarea } from '@/app/src/components/ui/textarea';
import toast from 'react-hot-toast';
import DeleteModal from '@/app/src/components/common/modal/delete-modal';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/app/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/src/components/ui/select';

interface Props {
  initialPackages?: Packages[];
}

export default function PackageManagement({ initialPackages }: Props) {
  const router = useRouter();
  const [packages, setPackages] = useState<Packages[]>(initialPackages || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageGroupId, setEditingPackageGroupId] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingPackages, setIsFetchingPackages] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePackageGroupId, setDeletePackageGroupId] = useState<string | null>(null);
  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    deliverables: '',
    duration: '',
    preview: '',
    popular: false,
    category: 'wedding' as Category,
  });

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const fetchPackages = useCallback(async () => {
    setIsFetchingPackages(true);
    try {
      const response = await fetch('/api/admin/package', {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.packages) {
        setPackages(Array.isArray(data.packages) ? data.packages : []);
      } else {
        toast.error(data.error || 'Failed to load packages');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load packages');
    } finally {
      setIsFetchingPackages(false);
    }
  }, []);

  useEffect(() => {
    if (!initialPackages || initialPackages.length === 0) {
      fetchPackages();
    }
  }, [initialPackages, fetchPackages]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      price: '',
      description: '',
      deliverables: '',
      duration: '',
      preview: '',
      popular: false,
      category: 'wedding',
    });
    setEditingPackageGroupId(null);
    setEditingPackageId(null);
    setSelectedFile(null);
    setLocalPreview(null);
  };

  const openModal = (packageGroup?: Packages, packageId?: string) => {
    if (packageGroup && packageId !== undefined) {
      const pkg = packageGroup.packages.find((p) => p.id === packageId);
      if (!pkg) return;
      setEditingPackageGroupId(packageGroup.id);
      setEditingPackageId(pkg.id);
      setFormData({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price.toString(),
        description: pkg.description,
        deliverables: pkg.deliverables.join('\n'),
        duration: pkg.duration,
        preview: pkg.preview,
        popular: pkg.popular || false,
        category: packageGroup.category,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const openDeleteModal = (packageGroupId: string, packageId: string) => {
    setDeletePackageGroupId(packageGroupId);
    setDeletePackageId(packageId);
    setDeleteOpen(true);
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) {
      throw new Error('No file selected');
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', selectedFile);

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formDataUpload,
      credentials: 'include',
    });

    if (!response.ok) {
      toast.error('Image upload failed');
      throw new Error('Image upload failed');
    }

    const { url } = await response.json();
    return url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.preview;

      if (selectedFile) {
        setIsUploading(true);
        imageUrl = await uploadImage();
        setIsUploading(false);
      }

      const packageData = {
        id: uuidv4(),
        name: formData.name,
        price: parseInt(formData.price),
        description: formData.description,
        deliverables: formData.deliverables.split('\n').filter((d) => d.trim()),
        duration: formData.duration,
        preview: imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        popular: formData.popular,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if we're editing or creating
      if (editingPackageGroupId !== null && editingPackageId !== null) {
        // Editing existing package
        const response = await fetch(`/api/admin/package/${editingPackageGroupId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: editingPackageId,
            packageData: packageData,
          }),
          credentials: 'include',
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update package');
        }

        setPackages((prev) =>
          prev.map((pg) => (pg.id === editingPackageGroupId ? result.package : pg))
        );

        toast.success('Package updated successfully');
      } else {
        // Creating new package - need to find or create package group
        const existingGroup = packages.find((pg) => pg.category === formData.category);

        if (existingGroup) {
          // Add to existing group
          const response = await fetch(`/api/admin/package/${existingGroup.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              packageData: packageData,
              addNew: true,
            }),
            credentials: 'include',
          });

          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || 'Failed to create package');
          }

          setPackages((prev) =>
            prev.map((pg) => (pg.id === existingGroup.id ? result.package : pg))
          );
        } else {
          // Create new group
          const response = await fetch('/api/admin/package', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: formData.category,
              packages: [packageData],
            }),
            credentials: 'include',
          });

          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || 'Failed to create package');
          }

          setPackages((prev) => [...prev, result.package]);
        }

        toast.success('Package created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (deletePackageGroupId === null || deletePackageId === null) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/package/${deletePackageGroupId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: deletePackageId }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();

        if (result.deletedGroup) {
          // Entire group was deleted
          setPackages((prev) => prev.filter((pg) => pg.id !== deletePackageGroupId));
        } else {
          // Just one package was removed
          setPackages((prev) =>
            prev.map((pg) => (pg.id === deletePackageGroupId ? result.package : pg))
          );
        }

        router.refresh();
        toast.success('Package deleted successfully');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete package');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete package');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeletePackageGroupId(null);
      setDeletePackageId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Packages</h1>
            <p className="text-muted-foreground mt-1">Create and manage your service packages</p>
          </div>
          <Button variant="royal" onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-1" />
            Add Package
          </Button>
        </div>

        <div className="grid gap-6">
          {isFetchingPackages ? (
            <div className="h-72 flex flex-col items-center justify-center bg-card rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              Loading packages...
            </div>
          ) : packages.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center bg-card rounded-xl">
              <PackageIcon className="w-24 h-24 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No packages found.</p>
              <Button variant="royal" className="mt-4" onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-1" />
                Create your first package
              </Button>
            </div>
          ) : (
            packages.map((packageGroup) => (
              <div key={packageGroup.id}>
                <h2 className="text-xl font-semibold mb-3 capitalize">{packageGroup.category}</h2>
                <div className="grid gap-4">
                  {packageGroup?.packages?.map((pkg) => (
                    <div key={pkg.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <Image
                          src={pkg.preview}
                          alt={pkg.name}
                          width={192}
                          height={192}
                          className="w-full md:w-48 h-48 object-cover"
                        />
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                                {pkg.name}
                                {pkg.popular && (
                                  <span className="text-xs px-2 py-1 bg-gold text-maroon-dark rounded-full">
                                    Popular
                                  </span>
                                )}
                              </h3>
                              <p className="text-gold font-bold">{formatPrice(pkg.price)}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="cancel"
                                size="icon"
                                onClick={() => openModal(packageGroup, pkg.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="cancel"
                                size="icon"
                                className="text-destructive"
                                onClick={() => openDeleteModal(packageGroup.id, pkg.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{pkg.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {pkg.deliverables.slice(0, 3).map((d, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                              >
                                {d}
                              </span>
                            ))}
                            {pkg.deliverables.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                +{pkg.deliverables.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl">
              <div className="flex justify-between items-center border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {editingPackageGroupId ? 'Edit Package' : 'Create Package'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {editingPackageGroupId ? 'Update package details' : 'Add a new package'}
                  </p>
                </div>
                <Button variant="close" size={'icon'} onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium block mb-2">Package Preview Image</Label>
                  <div className="flex gap-4 items-center">
                    {(localPreview || formData.preview) && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                        <Image
                          src={localPreview || formData.preview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    )}
                    <Label className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg px-4 py-5 cursor-pointer">
                      <Upload className="w-6 h-6" />
                      Upload image
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSelectedFile(file);
                          if (file) {
                            setLocalPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </Label>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">Category</Label>
                  <Select
                    required
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as Category })
                    }
                    disabled={!!editingPackageGroupId}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border rounded-md">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      {CATEGORY.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {editingPackageGroupId && (
                    <p className="text-xs text-destructive mt-1">
                      Category cannot be changed when editing
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Package Name</label>
                  <Input
                    required
                    wordLimit={20}
                    showWordCount
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Royal Heritage"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                    <Input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <Input
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="3 Days"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    required
                    wordLimit={100}
                    showWordCount
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Package description..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deliverables (one per line)
                  </label>
                  <Textarea
                    required
                    wordLimit={50}
                    showWordCount
                    value={formData.deliverables}
                    onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                    placeholder="3 Days Full Coverage&#10;Cinematic Wedding Film&#10;500+ Edited Photos"
                    rows={4}
                  />
                </div>

                <label className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  />
                  Mark as Popular
                </label>

                <div className="flex justify-end gap-3">
                  <Button variant="cancel" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="royal" type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {editingPackageGroupId ? 'Update Package' : 'Create Package'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        open={deleteOpen}
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Package"
        description="Are you sure you want to delete this package? This action cannot be undone."
      />
    </>
  );
}
