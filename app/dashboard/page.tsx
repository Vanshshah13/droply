"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Search,
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  Star,
  Trash2,
  Home,
  Folder,
  FileText,
  FileImage,
  File,
  Cloud,
  Download,
  Eye,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Loader2,
  Plus,
} from "lucide-react";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "image" | "pdf" | "doc" | "other";
  size?: string;
  modified: string;
  stared: boolean;
  deleted: boolean;
  parentId: string | null;
  thumbnail?: string;
  url?: string;
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [section, setSection] = useState<"files" | "stared" | "trash">(
    "files"
  );

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "All Files" }]);

  const [storage, setStorage] = useState({
    used: 0,
    limit: 0,
    remaining: 0,
  });

  const userId = user?.id;

  const displayName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "User";

  useEffect(() => {
    if (userId) {
      fetchFiles();
      fetchStorage();
    }
  }, [userId]);

  const fetchStorage = async () => {
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      if (res.ok) setStorage(data);
    } catch { }
  };
  const goBack = () => {
    if (breadcrumbs.length <= 1) return;

    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    const last = newBreadcrumbs[newBreadcrumbs.length - 1];

    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(last?.id ?? null);
    fetchFiles(last?.id ?? null);
  };
  const fetchFiles = async (folderId: string | null = null) => {
    try {
      setLoading(true);

      const url = new URL("/api/files", window.location.origin);

      url.searchParams.append("userId", userId || "");

      // IMPORTANT FIX
      if (folderId) {
        url.searchParams.append("parentId", folderId ?? "null");
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response");
      }
      if (!res.ok) throw new Error();

      const mapped = data.map((f: any) => ({
        id: f.id,
        name: f.name,
        type: f.isFolder ? "folder" : "file",
        fileType: f.type?.startsWith("image")
          ? "image"
          : f.type?.includes("pdf")
            ? "pdf"
            : "other",
        size: f.size ? `${(f.size / 1024).toFixed(1)} KB` : undefined,
        modified: new Date(f.createdAt).toLocaleDateString(),
        stared: f.stared,
        deleted: f.isTrash,
        parentId: f.parentId,
        thumbnail: f.thumbnailUrl,
        url: f.fileUrl,
      }));

      setFiles(mapped);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };
  const createFolder = async () => {
    const name = prompt("Folder name");
    if (!name) return;

    try {
      const res = await fetch("/api/folders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          userId,
          parentId: currentFolderId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.folder) {
        throw new Error(data?.error || "Failed to create folder");
      }

      setFiles((prev) => [
        {
          id: data.folder.id,
          name: data.folder.name,
          type: "folder",
          modified: "Just now",
          stared: false,
          deleted: false,
          parentId: currentFolderId,
        },
        ...prev,
      ]);

      toast.success("Folder created successfully");
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();

      // IMPORTANT: must match backend key
      formData.append("file", file);

      // backend expects THIS name
      formData.append("userId", userId || "");

      // IMPORTANT: must match backend (parentId, NOT parent_id)
      if (currentFolderId) {
        formData.append("parentId", currentFolderId);
      }

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      setFiles((prev) => [
        {
          id: data.id,
          name: data.name,
          type: "file",
          fileType: data.type?.startsWith("image")
            ? "image"
            : data.type?.includes("pdf")
              ? "pdf"
              : "other",
          size: data.size ? `${(data.size / 1024).toFixed(1)} KB` : "",
          modified: "Just now",
          stared: false,
          deleted: false,
          parentId: data.parentId || null,
          url: data.fileUrl,
        },
        ...prev,
      ]);

      toast.success("Uploaded successfully 🚀");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleStar = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, stared: !f.stared } : f
      )
    );

    await fetch(`/api/files/${id}/star`, {
      method: "PATCH",
    });
  };

  const toggleTrash = async (id: string) => {
    try {
      const res = await fetch(`/api/files/${id}/trash`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error();

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, deleted: !f.deleted } : f
        )
      );

      toast.success("Updated successfully");
    } catch {
      toast.error("Action failed");
    }
  };
  const permanentDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/files/${id}/delete`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      setFiles((prev) => prev.filter((f) => f.id !== id));

      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };
  const emptyTrash = async () => {
    try {
      const res = await fetch("/api/files/empty-trash", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      // refresh UI after delete
      await fetchFiles(currentFolderId);

      toast.success(data.message || "Trash emptied successfully");
    } catch (err) {
      toast.error("Failed to empty trash");
    }
  };
  const openFolder = (file: FileItem) => {
    if (file.type !== "folder") return;

    setCurrentFolderId(file.id);

    setBreadcrumbs((prev) => [
      ...prev,
      { id: file.id, name: file.name },
    ]);

    // 🔥 CRITICAL FIX
    fetchFiles(file.id);
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matches = file.name
        .toLowerCase()
        .includes(search.toLowerCase());

      if (section === "trash") return file.deleted && matches;
      if (section === "stared")
        return file.stared && !file.deleted && matches;

      return (
        !file.deleted &&
        file.parentId === currentFolderId &&
        matches
      );
    });
  }, [files, section, search, currentFolderId]);

  const storagePercent =
    storage.limit > 0 ? (storage.used / storage.limit) * 100 : 0;

  const getIcon = (file: FileItem) => {
    if (file.type === "folder")
      return <Folder className="w-6 h-6 text-violet-400" />;

    if (file.fileType === "image")
      return <FileImage className="w-6 h-6 text-pink-400" />;

    if (file.fileType === "pdf")
      return <FileText className="w-6 h-6 text-rose-400" />;

    return <File className="w-6 h-6 text-slate-400" />;
  };

  const logout = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded) return null;


  return (
    <div className="min-h-screen bg-[#050816] text-cyan-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 top-0 left-0 h-screen w-72 
    bg-[#0b1120] border-r border-cyan-500/20 flex flex-col
    transition-transform duration-300 ${mobileMenu
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,.6)]"
          >
            Droply
          </Link>

          <button
            onClick={() => setMobileMenu(false)}
            className="lg:hidden text-cyan-300"
          >
            <X />
          </button>
        </div>

        {/* User */}
        <div className="p-5">
          <Link href="/profile">
            <div
              className="rounded-xl p-4 border border-cyan-400/20
          bg-cyan-500/5 hover:bg-cyan-500/10 transition
          shadow-[0_0_20px_rgba(34,211,238,.08)]"
            >
              <p className="text-xs text-cyan-400/70">
                Signed in as
              </p>

              <p className="text-sm mt-1 truncate font-medium text-cyan-100">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <div className="px-4 flex-1">
          <nav className="space-y-2">
            {[
              { id: "files", icon: Home, label: "All Files" },
              { id: "stared", icon: Star, label: "Starred" },
              { id: "trash", icon: Trash2, label: "Trash" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${section === item.id
                    ? `
                bg-cyan-500/10 text-cyan-300 border border-cyan-400/30
                shadow-[0_0_18px_rgba(34,211,238,.2)]
                `
                    : `
                text-cyan-100/70 hover:bg-cyan-500/5 hover:text-cyan-300
                `
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-cyan-500/20">
          <button
            onClick={logout}
            className="w-full h-11 rounded-xl
        bg-cyan-500/5 border border-cyan-400/20
        hover:bg-cyan-500/10
        shadow-[0_0_15px_rgba(34,211,238,.08)]
        transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header
          className="h-20 px-4 lg:px-8 flex items-center justify-between
      border-b border-cyan-500/20 bg-[#050816]"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenu(true)}
              className="lg:hidden text-cyan-300"
            >
              <Menu />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-cyan-500">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <ChevronRight className="w-3 h-3" />
                    )}

                    <button
                      onClick={() => {
                        const newPath = breadcrumbs.slice(0, i + 1);
                        setBreadcrumbs(newPath);
                        setCurrentFolderId(crumb.id);
                        fetchFiles(crumb.id);
                      }}
                      className="hover:text-cyan-300"
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </div>

              <h1 className="text-2xl font-semibold text-cyan-100 mt-1">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-cyan-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="
            w-72 h-10 pl-10 rounded-xl
            bg-cyan-500/5 border border-cyan-400/20
            focus:border-cyan-300
            outline-none"
              />
            </div>

            {/* Create Folder */}
            <button
              onClick={createFolder}
              className="
          h-10 px-4 rounded-xl
          bg-cyan-500/5 border border-cyan-400/20
          hover:bg-cyan-500/10
          shadow-[0_0_12px_rgba(34,211,238,.08)]
          flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>

            {/* Upload */}

          </div>
        </header>

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-4 p-4 lg:p-8 pb-0">
          {[
            ["Total Items", filteredFiles.length],
            ["Folders", filteredFiles.filter(f => f.type === "folder").length],
            ["Files", filteredFiles.filter(f => f.type === "file").length]
          ].map(([label, value]) => (
            <div
              key={label}
              className="
          rounded-2xl p-5
          border border-cyan-500/20
          bg-cyan-500/5
          shadow-[0_0_20px_rgba(34,211,238,.08)]"
            >
              <p className="text-sm text-cyan-400">
                {label}
              </p>

              <h2 className="text-3xl font-bold mt-2 text-cyan-100">
                {value}
              </h2>
            </div>
          ))}
        </section>

        {/* Files */}
        <main className="flex-1 p-4 lg:p-8">

          {loading ? (
            <div className="grid md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-cyan-500/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (

            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
              <Sparkles className="w-14 h-14 text-cyan-300 mb-5" />

              <h3 className="text-3xl font-semibold text-cyan-100">
                Nothing here yet
              </h3>

              <p className="text-cyan-500 mt-3 max-w-md">
                Upload files or create a folder to get started.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">

                {/* Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="
        h-12 px-6 rounded-xl
        bg-cyan-400 text-black font-semibold
        flex items-center gap-2
        hover:scale-105
        transition-all
        shadow-[0_0_20px_rgba(34,211,238,.35)]
      "
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload File
                </button>

                {/* Create Folder */}
                <button
                  onClick={createFolder}
                  className="
        h-12 px-6 rounded-xl
        border border-cyan-400/30
        bg-cyan-500/5
        hover:bg-cyan-500/10
        text-cyan-200
        flex items-center gap-2
        transition-all
      "
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>

              </div>
            </div>

          ) : (

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">

              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="
              group rounded-2xl p-4
              border border-cyan-500/20
              bg-cyan-500/5
              hover:border-cyan-300/40
              hover:shadow-[0_0_25px_rgba(34,211,238,.15)]
              transition"
                >

                  <div
                    onClick={() => openFolder(file)}
                    className="cursor-pointer"
                  >
                    <div
                      className="
                  w-14 h-14 rounded-xl
                  bg-cyan-500/10
                  flex items-center justify-center mb-4"
                    >
                      {getIcon(file)}
                    </div>

                    <h3 className="font-medium truncate">
                      {file.name}
                    </h3>

                    <p className="text-xs text-cyan-500 mt-1">
                      {file.size || "Folder"} • {file.modified}
                    </p>
                  </div>

                  {file.type === "file" && (
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">

                      <button
                        onClick={() => toggleStar(file.id)}
                        className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20"
                      >
                        <Star
                          className={`w-4 h-4 ${file.stared
                              ? "fill-cyan-300 text-cyan-300"
                              : ""
                            }`}
                        />
                      </button>

                      <button
                        onClick={() =>
                          file.url && window.open(file.url, "_blank")
                        }
                        className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          file.url &&
                          window.open(
                            `${file.url}?ik-attachment=true`,
                            "_blank"
                          )
                        }
                        className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleTrash(file.id)}
                        className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20"
                      >
                        {section === "trash"
                          ? <Plus className="w-4 h-4" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>

                    </div>
                  )}

                </div>
              ))}

            </div>

          )}

        </main>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleUpload(e.target.files[0]);
            }
          }}
        />

        {section === "trash" && (
          <button
            onClick={emptyTrash}
            className="
      fixed bottom-24 right-6 z-50
      h-12 px-5 rounded-full
      bg-rose-500 text-white font-semibold
      flex items-center gap-3
      shadow-[0_0_30px_rgba(244,63,94,.35)]
      hover:scale-105
      active:scale-95
      transition-all duration-300
    "
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:block">
              Empty Trash
            </span>
          </button>
        )}

        {/* Floating Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="
    fixed bottom-6 right-6 z-50 h-12 px-5 rounded-full bg-cyan-400 text-black font-semibold flex items-center gap-3 shadow-[0_0_35px_rgba(34,211,238,.55)] hover:scale-105 hover:shadow-[0_0_45px_rgba(34,211,238,.7)] active:scale-95 transition-all duration-300
  "
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}

          <span className="hidden sm:block">
            Upload
          </span>
        </button>

      </div>
    </div>
  );
}