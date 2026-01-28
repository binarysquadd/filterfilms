'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/app/src/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2, Eye, Trash2, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import DeleteModal from "@/app/src/components/common/modal/delete-modal";
import { ContactMessage } from "@/app/types/contact-message";

export default function ContactMessagesPage() {
    const router = useRouter();

    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    /* ------------------------------ Fetch ------------------------------ */
    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/contact');
            if (res.status === 401 || res.status === 403) {
                setAccessDenied(true);
                return;
            }
            const data = await res.json();
            setMessages(data.messages || []);
        } catch {
            toast.error("Error fetching contact messages");
        } finally {
            setLoading(false);
        }
    };

    /* ------------------------------ View ------------------------------ */
    const openViewModal = (message: ContactMessage) => {
        setSelectedMessage(message);
        setViewModalOpen(true);
    };

    /* ------------------------------ Delete ------------------------------ */
    const openDeleteModal = (id: string) => {
        setDeletingId(id);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/contact/${deletingId}`, { method: 'DELETE' });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== deletingId));
                toast.success("Message deleted!");
                router.refresh();
            } else {
                toast.error("Error deleting message");
            }
        } catch {
            toast.error("Error deleting message");
        } finally {
            setIsDeleting(false);
            setDeleteOpen(false);
            setDeletingId(null);
        }
    };

    const handleDeleteAll = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin/contact', { method: 'DELETE' });
            if (res.ok) {
                setMessages([]);
                toast.success("All messages deleted!");
                router.refresh();
            } else {
                toast.error("Error deleting messages");
            }
        } catch {
            toast.error("Error deleting messages");
        } finally {
            setIsDeleting(false);
            setDeleteAllOpen(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Contact Messages</h1>
                        <p className="text-muted-foreground">Manage all contact submissions.</p>
                    </div>
                    {messages.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={() => setDeleteAllOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete All
                        </Button>
                    )}
                </div>

                {/* Search */}
                <input
                    placeholder="Search by name, email, message..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border p-2 rounded flex-1"
                />

                {/* Table */}
                <div className="bg-card rounded-xl shadow-card overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="p-3 text-left">Contact</th>
                                <th className="p-3">Message</th>
                                <th className="p-3">Event</th>
                                <th className="p-3">Received</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-4">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                    </td>
                                </tr>
                            ) : filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-muted-foreground">
                                        No messages found
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map(msg => (
                                    <tr key={msg.id}>
                                        <td className="p-3">
                                            <div>{msg.name}</div>
                                            <div className="text-sm text-muted-foreground flex gap-1 items-center">
                                                <Mail className="w-3 h-3" /> {msg.email}
                                            </div>
                                            {msg.phone && (
                                                <div className="text-sm text-muted-foreground flex gap-1 items-center">
                                                    <Phone className="w-3 h-3" /> {msg.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 truncate max-w-xs">{msg.message}</td>
                                        <td className="p-3 text-center">{msg.eventDate ?? 'N/A'}</td>
                                        <td className="p-3 text-center">{new Date(msg.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-center space-x-2">
                                            <Button size="sm" variant="ghost" onClick={() => openViewModal(msg)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => openDeleteModal(msg.id)}>
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

            {/* View Modal */}
            {viewModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-xl max-w-2xl w-full p-6 space-y-4">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold">Message Details</h2>
                            <Button size="sm" variant="ghost" onClick={() => setViewModalOpen(false)}>✕</Button>
                        </div>

                        <div className="space-y-2">
                            <p><strong>Name:</strong> {selectedMessage.name}</p>
                            <p><strong>Email:</strong> {selectedMessage.email}</p>
                            {selectedMessage.phone && <p><strong>Phone:</strong> {selectedMessage.phone}</p>}
                            <p><strong>Event Date:</strong> {selectedMessage.eventDate ?? 'N/A'}</p>
                            <p><strong>Message:</strong></p>
                            <p className="bg-muted p-3 rounded">{selectedMessage.message}</p>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modals */}
            <DeleteModal
                open={deleteOpen}
                title="Delete Message"
                description="Are you sure you want to delete this message?"
                onCancel={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
            />
            <DeleteModal
                open={deleteAllOpen}
                title="Delete All Messages"
                description="This action cannot be undone."
                onCancel={() => setDeleteAllOpen(false)}
                onConfirm={handleDeleteAll}
                loading={isDeleting}
            />
        </>
    );
}
