'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/src/components/ui/button';
import { User } from '@/app/types/user';
import { useEffect, useState } from 'react';
import { Loader2, Eye, Trash2, Search, Edit, Upload, X } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Input } from '@/app/src/components/ui/input';
import { Label } from '@/app/src/components/ui/label';
import DeleteModal from '@/app/src/components/common/modal/delete-modal';
import { Textarea } from '@/app/src/components/ui/textarea';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<User[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    photo: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      photo: '',
    });
    setEditingId(null);
    setSelectedFile(null);
    setLocalPreview(null);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search query
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(query) ||
          customer.email?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');

      if (res.status === 401 || res.status === 403) {
        setAccessDenied(true);
        return;
      }

      const data = await res.json();
      setCustomers(data.customers || []);
      setFilteredCustomers(data.customers || []);
    } catch (err) {
      toast.error('Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (customer: User) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const openEditModal = (customer: User) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phoneNumber: customer.customerProfile?.phoneNumber || '',
      address: customer.customerProfile?.address || '',
      photo: customer.image || '',
    });
    setLocalPreview(customer.image || null);
    setEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) throw new Error('No file selected');

    const formDataUpload = new FormData();
    formDataUpload.append('file', selectedFile);

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formDataUpload,
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
      let photoUrl = formData.photo;

      if (selectedFile) {
        setIsUploading(true);
        photoUrl = await uploadImage();
        setIsUploading(false);
      }

      const submitData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        photo: photoUrl,
        role: 'customer', // Keep role as customer
      };

      const response = await fetch(`/api/admin/users/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        setCustomers((prev) => prev.map((c) => (c.id === editingId ? result.user : c)));
        toast.success('Customer updated successfully!');
        setEditModalOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update customer');
      }
    } catch (error) {
      toast.error('An error occurred while updating the customer');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${deletingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== deletingId));
        toast.success('Customer removed successfully!');
        router.refresh();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Error deleting customer');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting customer');
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setDeletingId(null);
    }
  };

  if (accessDenied) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">View and manage all registered customers.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="h-72">
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-72">
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        {searchQuery
                          ? 'No customers found matching your search'
                          : 'No customers found'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id ?? customer.email} className="hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 relative rounded-full overflow-hidden bg-muted">
                            {customer.image ? (
                              <Image
                                src={customer.image}
                                alt={customer.name || 'Customer Photo'}
                                width={100}
                                height={100}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{customer.name || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center text-foreground">{customer.email}</td>
                      <td className="p-3 text-center text-foreground">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <Button variant="close" size="sm" onClick={() => openViewModal(customer)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="close" size="sm" onClick={() => openEditModal(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="close"
                          size="sm"
                          onClick={() => openDeleteModal(customer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Customer Details Modal */}
        {viewModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
            <div className="bg-card rounded-xl shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Customer Details</h2>
                  <Button variant="close" size="icon" onClick={() => setViewModalOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                    {selectedCustomer.image ? (
                      <Image
                        src={selectedCustomer.image}
                        alt={selectedCustomer.name || 'Customer'}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">
                        {selectedCustomer.name
                          ? selectedCustomer.name.charAt(0).toUpperCase()
                          : 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {selectedCustomer.name || 'N/A'}
                    </h3>
                    <p className="text-muted-foreground">{selectedCustomer.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-foreground font-medium capitalize">
                      {selectedCustomer.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined Date</p>
                    <p className="text-foreground font-medium">
                      {selectedCustomer.createdAt
                        ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedCustomer.customerProfile?.phoneNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground font-medium">
                      {selectedCustomer.customerProfile.phoneNumber}
                    </p>
                  </div>
                )}

                {selectedCustomer.customerProfile?.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground font-medium">
                      {selectedCustomer.customerProfile.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
            <div className="bg-card rounded-xl shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Edit Customer</h2>
                  <Button
                    type="button"
                    variant="close"
                    size="icon"
                    onClick={() => {
                      setEditModalOpen(false);
                      resetForm();
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Photo Upload */}
                <div>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                      {localPreview ? (
                        <Image
                          src={localPreview}
                          alt="Preview"
                          className="object-cover w-full h-full"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                          {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <Label className="cursor-pointer">
                      <div className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Upload Photo</span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </Label>
                  </div>
                  <Label className="block text-sm font-medium text-foreground mt-1">
                    Profile Photo
                  </Label>
                </div>

                {/* Name */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Name *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </Label>
                  <Input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                {/* Address */}
                <div>
                  <Label className="block text-sm font-medium mb-2">Address</Label>
                  <Textarea
                    showWordCount
                    wordLimit={30}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    placeholder="Customer address"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditModalOpen(false);
                      resetForm();
                    }}
                    disabled={loading || isUploading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="royal" disabled={loading || isUploading}>
                    {loading || isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      'Update Customer'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        open={deleteOpen}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
