"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { Box, Flex, Separator } from "@radix-ui/themes";
import { useSession } from "next-auth/react"; // ✅ get user info from NextAuth
import LeftNav from "@/components/common/LeftNav";
import AppHeader from "@/components/common/AppHeader";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusCircle, X, Eye, SquarePen,Trash2 } from "lucide-react";
import { useToast } from "@/provider/ToastContext";
import { useAlert } from "@/provider/AlertContext";
import { useRouter } from "next/navigation";


function ProjectCard({ project, onView, onDelete }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* Header (actions) */}


      {/* Body */}
      <div className="relative w-full h-40 bg-gray-100">
        {project.project_thumbnail && (
          <Image
            src={project.project_thumbnail}
            alt={project.project_name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">
          {project.project_name}
        </h3>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(project.registration_time).toLocaleDateString("en-GB")}
        </p>
      </div>

      <div className="absolute right-2 bottom-2 flex space-x-2">
        <button
          onClick={() => onView(project)}
          title="View chat"
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <SquarePen className="h-5 w-5 text-blue-600" />
        </button>
        <button
          onClick={() => onDelete(project)}
          title="Delete chat"
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <Trash2 className="h-5 w-5 text-red-600" />
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession(); // ✅ get user from NextAuth
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const token = session?.user?.token; // your NextAuth provider should expose token



  const { showToast } = useToast();
  const { confirmAlert } = useAlert();
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/get-projects/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setProjects(res.data.projects || res.data.data || []); // 🔧 handle both
    } catch (err) {
      console.error("Error fetching chats:", err);
      showToast("Failed to fetch chats.");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    if (token) fetchProjects();
  }, [token, fetchProjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  const handleCreate = async () => {
    if (!form.name.trim()) {
      showToast("Please enter a title.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("project_name", form.name.trim());

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/add-project/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success || res.status === 200) {
        showToast("New Chat created successfully!");
        setProjects((prev) => [...prev, res.data.data]);
        setForm({ name: "" });
        setOpen(false);
        fetchProjects();
      } else {
        showToast(res.data.message || "Failed to create chat.");
      }
    } catch (err) {
      console.error("Error creating chat:", err);
      showToast("Error creating chat.");
    } finally {
      setSubmitting(false);
    }
  };


  const handleDelete = async (project) => {
    confirmAlert(`Delete chat "${project.project_name}"?`, async () => {
      setLoading(true);
      try {
        const res = await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/delete-project/${project.id}/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        if (res.status === 200 || res.data.success) {
          showToast("Chat deleted successfully!");
          setProjects((prev) => prev.filter((p) => p.id !== project.id));
        } else {
          showToast(res.data.message || "Failed to delete chat.");
        }
      } catch (err) {
        console.error("Error deleting chat:", err);
        showToast("Error deleting chat.");
      } finally {
        setLoading(false);
      }
    });




  };

  // ✅ View project
  const handleView = (project) => {
    router.push(`/wagen/${project.id}`); // dynamic page
  };


  // Loading/unauthenticated state
  if (status === "loading") return <p>Loading session...</p>;


  return (
    <>
      <AppHeader />
      <Flex height="100vh" pt="49px" align="stretch">
        <Box>
          <LeftNav />
        </Box>
        <Separator orientation="vertical" size="4" />

        {/* ===== Main Content ===== */}
        <Box className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Chats {projects.length > 0 && `(${projects.length})`}
            </h1>

            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition">
                  <PlusCircle className="h-5 w-5" /> New Chat
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <Dialog.Title className="text-lg font-semibold">
                      Create New Chat
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button>
                        <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                       Chat Title
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <button className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleCreate}
                      disabled={submitting}
                      className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? "Creating..." : "Create"}
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading chats...</p>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...projects].reverse().map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No chat yet.</div>
          )}
        </Box>
      </Flex>
    </>
  );
}
