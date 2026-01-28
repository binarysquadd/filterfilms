'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/app/src/components/ui/button";
import { User } from "@/app/types/user";
import { useEffect, useState } from "react";
import { Loader2, Plus, X, Upload, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Label } from "@/app/src/components/ui/label";
import { Input } from "@/app/src/components/ui/input";
import DeleteModal from "@/app/src/components/common/modal/delete-modal";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/src/components/ui/select";

interface Props {
  initialTeam?: User[];
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'team', label: 'Team' },
  { value: 'customer', label: 'Customer' },
];

export default function TeamPage({ initialTeam }: Props) {
  const router = useRouter();
  const [team, setTeam] = useState<User[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialization: '',
    photo: '',
    experience: '',
    bio: '',
    instagram: '',
    email: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      specialization: '',
      photo: '',
      experience: '',
      bio: '',
      instagram: '',
      email: '',
    });
    setEditingId(null);
    setSelectedFile(null);
    setLocalPreview(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/users');

        if (res.status === 401 || res.status === 403) {
          setAccessDenied(true);
          return;
        }

        const data = await res.json();
        setTeam(data.users);
      } catch (err) {
        toast.error("Error fetching team members");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const openModal = (member?: User) => {
    if (member) {
      setEditingId(member.id);
      setFormData({
        name: member.name || '',
        role: member.role,
        specialization: member.teamProfile?.specialization || '',
        photo: member.image || '',
        experience: member.teamProfile?.experience || '',
        bio: member.teamProfile?.bio || '',
        instagram: member.teamProfile?.instagram || '',
        email: member.email || '',
      });
      setLocalPreview(member.image || null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  }

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
      toast.error("Image upload failed");
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

      const submitData = { ...formData, photo: photoUrl };

      if (editingId) {
        const response = await fetch(`/api/admin/users/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        const result = await response.json();

        if (response.ok) {
          setTeam(prev =>
            prev.map(m => m.id === editingId ? result.user : m)
          );
          toast.success("Team member updated successfully!");
        } else {
          toast.error(result.error || "Failed to update team member");
          return;
        }
      } else {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        const result = await response.json();

        if (response.ok) {
          setTeam(prev => [...prev, result.user]);
          toast.success("Team member added successfully!");
        } else {
          toast.error(result.error || "Failed to add team member");
          return;
        }
      }

      setIsModalOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error("An error occurred while saving the team member");
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
        setTeam(prev => prev.filter(m => m.id !== deletingId));
        toast.success("Team member removed successfully!");
        router.refresh();
      } else {
        toast.error("Error deleting team member");
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Error deleting team member");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setDeletingId(null);
    }
  };

  if (accessDenied) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Team</h1>
            <p className="text-muted-foreground">Manage your team members and their roles.</p>
          </div>
          <Button variant="royal" size="sm" onClick={() => openModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        <div className="bg-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="h-72">
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                ) : team.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-72">
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No team members found
                      </div>
                    </td>
                  </tr>
                ) : (
                  team.map((member) => (
                    <tr key={member.id ?? member.email} className="hover:bg-muted/30 cursor-pointer">
                      <td className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 relative rounded-full overflow-hidden bg-muted">
                            {member.image ? (
                              <Image
                                src={member.image}
                                alt={member.name || 'Member Photo'}
                                width={100}
                                height={100}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {member.name ? member.name.charAt(0).toUpperCase() : ''}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center text-foreground">{member.role}</td>
                      <td className="p-3 text-center space-x-2">
                        <Button variant="cancel" size="sm" onClick={() => openModal(member)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="cancel" size="sm" onClick={() => openDeleteModal(member.id)}>
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

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
            <div className="bg-card rounded-xl shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Photo Upload */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Profile Photo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                      {localPreview ? (
                        <Image src={localPreview} alt="Preview" className="object-cover w-full h-full" width={100} height={100} />
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
                      <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </Label>
                  </div>
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

                {/* Role */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Specialization */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Specialization</Label>
                  <Input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>

                {/* Experience */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Experience</Label>
                  <Input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 5 years"
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Instagram */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Instagram</Label>
                  <Input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="cancel" onClick={() => { setIsModalOpen(false); resetForm(); }} disabled={loading || isUploading}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="royal" disabled={loading || isUploading}>
                    {loading || isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : editingId ? 'Update Member' : 'Add Member'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        open={deleteOpen}
        title="Delete Team Member"
        description="Are you sure you want to delete this team member? This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
