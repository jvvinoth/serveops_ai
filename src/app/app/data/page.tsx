"use client";
import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  Package,
  Users,
  Truck,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  priceSgd: number;
  available: boolean;
};
type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
};
type StaffShift = {
  id: string;
  staffName: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
};
type Supplier = {
  id: string;
  name: string;
  contact: string;
  items: string;
  notes: string;
};

const TABS = [
  { key: "menu", label: "Menu", icon: UtensilsCrossed },
  { key: "inventory", label: "Inventory", icon: Package },
  { key: "staff", label: "Staff Roster", icon: Users },
  { key: "suppliers", label: "Suppliers", icon: Truck },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function DataPage() {
  const [tab, setTab] = useState<Tab>("menu");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<StaffShift[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTab(tab);
  }, [tab]);

  async function fetchTab(t: Tab) {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/${t}`);
      const data = await res.json();
      if (t === "menu") setMenu(data);
      else if (t === "inventory") setInventory(data);
      else if (t === "staff") setStaff(data);
      else if (t === "suppliers") setSuppliers(data);
    } finally {
      setLoading(false);
    }
  }

  async function toggleMenuItem(id: string, available: boolean) {
    await fetch("/api/data/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, available: !available }),
    });
    setMenu((prev) =>
      prev.map((m) => (m.id === id ? { ...m, available: !available } : m))
    );
  }

  const menuByCategory = menu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const lowStock = inventory.filter((i) => i.quantity <= i.reorderLevel);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Business Data</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Menu, inventory, staff and suppliers for Kopi &amp; Bowl Cafe
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 border-b border-slate-800 bg-slate-900/40">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {key === "inventory" && lowStock.length > 0 && (
              <span className="ml-1 bg-amber-500/20 text-amber-400 text-xs px-1.5 py-0.5 rounded-full border border-amber-500/30">
                {lowStock.length} low
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => fetchTab(tab)}
          className="ml-auto p-2 text-slate-500 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        )}

        {/* MENU TAB */}
        {!loading && tab === "menu" && (
          <div className="space-y-6">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-xs">
                        <th className="text-left px-4 py-2.5 font-medium">Item</th>
                        <th className="text-right px-4 py-2.5 font-medium">Price</th>
                        <th className="text-center px-4 py-2.5 font-medium">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr
                          key={item.id}
                          className={`${
                            i < items.length - 1 ? "border-b border-slate-800/60" : ""
                          } ${!item.available ? "opacity-50" : ""}`}
                        >
                          <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-right text-green-400 font-semibold">
                            SGD {item.priceSgd.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleMenuItem(item.id, item.available)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                item.available
                                  ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                                  : "bg-slate-700/50 text-slate-500 border-slate-600/50 hover:bg-slate-700"
                              }`}
                            >
                              {item.available ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {item.available ? "On" : "Off"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {menu.length === 0 && (
              <div className="text-center text-slate-500 py-16">No menu items found</div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {!loading && tab === "inventory" && (
          <div>
            {lowStock.length > 0 && (
              <div className="mb-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>{lowStock.length} items</strong> are at or below reorder level
                </span>
              </div>
            )}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs">
                    <th className="text-left px-4 py-2.5 font-medium">Item</th>
                    <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                    <th className="text-right px-4 py-2.5 font-medium">Unit</th>
                    <th className="text-right px-4 py-2.5 font-medium">Reorder At</th>
                    <th className="text-center px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, i) => {
                    const low = item.quantity <= item.reorderLevel;
                    const critical = item.quantity <= item.reorderLevel * 0.5;
                    return (
                      <tr
                        key={item.id}
                        className={`${i < inventory.length - 1 ? "border-b border-slate-800/60" : ""}`}
                      >
                        <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${
                            critical
                              ? "text-red-400"
                              : low
                              ? "text-amber-400"
                              : "text-white"
                          }`}
                        >
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400">{item.unit}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{item.reorderLevel}</td>
                        <td className="px-4 py-3 text-center">
                          {critical ? (
                            <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Critical
                            </span>
                          ) : low ? (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Low
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/30 text-xs px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {inventory.length === 0 && (
              <div className="text-center text-slate-500 py-16">No inventory found</div>
            )}
          </div>
        )}

        {/* STAFF TAB */}
        {!loading && tab === "staff" && (
          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs">
                    <th className="text-left px-4 py-2.5 font-medium">Name</th>
                    <th className="text-left px-4 py-2.5 font-medium">Role</th>
                    <th className="text-left px-4 py-2.5 font-medium">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium">Shift</th>
                    <th className="text-center px-4 py-2.5 font-medium">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`${i < staff.length - 1 ? "border-b border-slate-800/60" : ""} ${!s.available ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 py-3 text-white font-medium">{s.staffName}</td>
                      <td className="px-4 py-3 text-slate-400">{s.role}</td>
                      <td className="px-4 py-3 text-slate-400">{s.date}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {s.startTime} – {s.endTime}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.available ? (
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                            <CheckCircle className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-700/50 text-slate-500 text-xs px-2 py-0.5 rounded-full border border-slate-600/50">
                            <XCircle className="w-3 h-3" /> Off
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {staff.length === 0 && (
              <div className="text-center text-slate-500 py-16">No shifts found</div>
            )}
          </div>
        )}

        {/* SUPPLIERS TAB */}
        {!loading && tab === "suppliers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold">{s.name}</div>
                    {!!s.contact && (
                      <div className="text-slate-400 text-sm mt-0.5">{s.contact}</div>
                    )}
                  </div>
                  <Truck className="w-4 h-4 text-slate-600 mt-0.5" />
                </div>
                <div className="text-xs text-slate-500">
                  <span className="text-slate-400 font-medium">Supplies: </span>
                  {s.items}
                </div>
                {!!s.notes && (
                  <div className="text-xs text-slate-500 bg-slate-800/60 rounded-lg px-3 py-2">
                    {s.notes}
                  </div>
                )}
              </div>
            ))}
            {suppliers.length === 0 && (
              <div className="col-span-2 text-center text-slate-500 py-16">No suppliers found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
