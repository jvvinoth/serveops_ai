"use client";
import { useEffect, useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  RefreshCw,
  User,
  Calendar,
  ClipboardList,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  body: string | null;
  assignee: string | null;
  dueAt: string | null;
  status: string;
  createdAt: string;
};

type Filter = "all" | "open" | "done";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formAssignee, setFormAssignee] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?status=${filter}`);
      const data = await res.json();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(id: string, status: string) {
    const newStatus = status === "open" ? "done" : "open";
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          body: formBody || null,
          assignee: formAssignee || null,
        }),
      });
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setFormTitle("");
      setFormBody("");
      setFormAssignee("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  const openCount = tasks.filter((t) => t.status === "open").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tasks</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {openCount} open · {doneCount} done
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* New Task Form */}
      {showForm && (
        <form
          onSubmit={createTask}
          className="mx-6 mt-4 bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3"
        >
          <div>
            <input
              type="text"
              placeholder="Task title *"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500/60"
            />
          </div>
          <div>
            <textarea
              placeholder="Details (optional)"
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500/60 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Assignee (optional)"
              value={formAssignee}
              onChange={(e) => setFormAssignee(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500/60"
            />
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg transition-colors"
            >
              {saving ? "Saving…" : "Add Task"}
            </button>
          </div>
        </form>
      )}

      {/* Filter + refresh */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-800 bg-slate-900/40">
        {(["all", "open", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={fetchTasks}
          className="ml-auto p-2 text-slate-500 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
            <div className="text-sm">No tasks found</div>
            <div className="text-xs mt-1 text-slate-600">
              Click &quot;New Task&quot; to create one
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-2">
            {tasks.map((task) => {
              const done = task.status === "done";
              return (
                <div
                  key={task.id}
                  className={`group flex items-start gap-3 bg-slate-900 border rounded-xl px-4 py-3 transition-all ${
                    done
                      ? "border-slate-800/60 opacity-60"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id, task.status)}
                    className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-green-400 transition-colors"
                  >
                    {done ? (
                      <CheckSquare className="w-5 h-5 text-green-500" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        done ? "line-through text-slate-500" : "text-white"
                      }`}
                    >
                      {task.title}
                    </div>
                    {!!task.body && (
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {task.body}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {!!task.assignee && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <User className="w-3 h-3" />
                          {task.assignee}
                        </span>
                      )}
                      {!!task.dueAt && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueAt).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs text-slate-600">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
