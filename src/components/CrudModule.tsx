"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  supabaseDelete,
  supabaseFetch,
  supabaseInsert,
  supabaseUpdate,
  type SupabaseSession,
} from "@/lib/supabase";
import {
  getSupabaseClient,
  hydrateRealtimeSession,
} from "@/lib/supabaseClient";

type FieldType =
  | "text"
  | "number"
  | "date"
  | "datetime-local"
  | "select"
  | "textarea";

type FieldOption = { label: string; value: string };

type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
};

type CrudModuleProps = {
  title: string;
  description?: string;
  table: string;
  fields: Field[];
  session: SupabaseSession | null;
  gymId: string | null;
  select?: string;
  order?: string;
  useModal?: boolean;
  modalColumns?: 2 | 3;
};

const defaultSelect = "id,created_at";

function coerceValue(type: FieldType | undefined, value: string) {
  if (type === "number") {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }
  return value;
}

const defaultUpiId = "fitsutra@upi";

function buildUpiPayload(upiId: string) {
  const cleaned = upiId.trim() || defaultUpiId;
  return `upi://pay?pa=${encodeURIComponent(cleaned)}&pn=FitSutra&cu=INR`;
}

export default function CrudModule({
  title,
  description,
  table,
  fields,
  session,
  gymId,
  select,
  order = "created_at.desc",
  useModal = false,
  modalColumns = 2,
}: CrudModuleProps) {
  const [rows, setRows] = useState<Record<string, string | number | null>[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  const selectFields = useMemo(() => {
    const fieldNames = fields.map((field) => field.name).join(",");
    return select ?? `${defaultSelect},${fieldNames}`;
  }, [fields, select]);

  useEffect(() => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.name] = "";
    });
    setForm(initial);
  }, [fields]);

  useEffect(() => {
    if (form.payment_method !== "upi") return;
    if (form.upi_id) return;
    setForm((prev) => ({ ...prev, upi_id: defaultUpiId }));
  }, [form.payment_method, form.upi_id]);

  const loadRows = useCallback(async () => {
    if (!session?.access_token || !gymId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseFetch<Record<string, string | number | null>[]>(
        `${table}?select=${selectFields}&gym_id=eq.${gymId}&order=${order}`,
        session.access_token
      );
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [gymId, order, selectFields, session?.access_token, table]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    if (!session?.access_token) return;
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      await hydrateRealtimeSession(session);
      if (cancelled) return;
      const supabase = getSupabaseClient();
      channel = supabase.channel(`realtime-${table}-${session.user.id}`);
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          loadRows();
        }
      );
      channel.subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) {
        getSupabaseClient().removeChannel(channel);
      }
    };
  }, [loadRows, session?.access_token, session?.refresh_token, session?.user?.id, table]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.access_token || !gymId) return;

    const payload: Record<string, string | number | null> = {
      gym_id: gymId,
    };
    fields.forEach((field) => {
      payload[field.name] = coerceValue(field.type, form[field.name]);
    });

    try {
      if (editingId) {
        await supabaseUpdate(
          `${table}?id=eq.${editingId}`,
          session.access_token,
          payload
        );
      } else {
        await supabaseInsert(table, session.access_token, [payload]);
      }
      handleReset();
      if (useModal) {
        setIsModalOpen(false);
      }
      loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  function handleReset() {
    setEditingId(null);
    const reset: Record<string, string> = {};
    fields.forEach((field) => {
      reset[field.name] = "";
    });
    setForm(reset);
  }

  function handleOpenCreate() {
    handleReset();
    setModalMode("create");
    setIsModalOpen(true);
  }

  function startEdit(row: Record<string, string | number | null>) {
    setEditingId(row.id as string);
    setModalMode("edit");
    const updated: Record<string, string> = {};
    fields.forEach((field) => {
      const value = row[field.name];
      updated[field.name] = value == null ? "" : String(value);
    });
    setForm(updated);
    if (useModal) {
      setIsModalOpen(true);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    handleReset();
  }

  async function handleDelete(id: string) {
    if (!session?.access_token) return;
    if (!window.confirm("Delete this record?")) return;
    try {
      await supabaseDelete(`${table}?id=eq.${id}`, session.access_token);
      loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-100">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-slate-300">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {useModal && (
            <button
              onClick={handleOpenCreate}
              disabled={!session?.access_token || !gymId}
              className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add
            </button>
          )}
          <button
            onClick={loadRows}
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
          className="w-full max-w-xs rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 outline-none focus:border-amber-400/70"
        />
        <select
          value={filterField}
          onChange={(event) => {
            setFilterField(event.target.value);
            setFilterValue("");
          }}
          className="rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 outline-none focus:border-amber-400/70"
        >
          <option value="">Filter field</option>
          {fields
            .filter((field) => field.type === "select")
            .map((field) => (
              <option key={field.name} value={field.name}>
                {field.label}
              </option>
            ))}
        </select>
        {filterField && (
          <select
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
            className="rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 outline-none focus:border-amber-400/70"
          >
            <option value="">All</option>
            {fields
              .find((field) => field.name === filterField)
              ?.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        )}
      </div>

      {!useModal && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={form[field.name] ?? ""}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={form[field.name] ?? ""}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                    required={field.required}
                  >
                    <option value="">Select</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.name === "upi_id" ? (
                  form.payment_method === "upi" && (
                    <div>
                      <input
                        type="text"
                        value={form[field.name] ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.name]: event.target.value,
                          }))
                        }
                        placeholder={defaultUpiId}
                        className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                        required={field.required}
                      />
                      <div className="mt-3 rounded-2xl border border-slate-800/70 bg-slate-950/50 p-3 text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                          UPI QR ({form[field.name] || defaultUpiId})
                        </p>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            buildUpiPayload(form[field.name])
                          )}`}
                          alt="UPI QR"
                          className="mx-auto mt-2 h-36 w-36 rounded-xl border border-slate-800/70 bg-slate-900/60 object-contain"
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <input
                    type={field.type ?? "text"}
                    value={form[field.name] ?? ""}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!session?.access_token || !gymId}
              className="rounded-full bg-amber-400 px-6 py-3 text-xs font-semibold text-slate-900 shadow-lg shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-700/60 px-6 py-3 text-xs font-semibold text-slate-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {useModal && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="glass max-h-[80vh] w-full max-w-[1100px] overflow-hidden rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl text-slate-100">
                {modalMode === "edit" ? "Edit" : "Add"} {title}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full border border-slate-700/60 px-4 py-2 text-xs text-slate-200"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              <div
                className={`grid gap-3 ${
                  modalColumns === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
                }`}
              >
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={form[field.name] ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.name]: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={form[field.name] ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.name]: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                        required={field.required}
                      >
                        <option value="">Select</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.name === "upi_id" ? (
                      form.payment_method === "upi" && (
                        <div>
                          <input
                            type="text"
                            value={form[field.name] ?? ""}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                [field.name]: event.target.value,
                              }))
                            }
                            placeholder={defaultUpiId}
                            className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                            required={field.required}
                          />
                          <div className="mt-3 rounded-2xl border border-slate-800/70 bg-slate-950/50 p-3 text-center">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                              UPI QR ({form[field.name] || defaultUpiId})
                            </p>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                                buildUpiPayload(form[field.name])
                              )}`}
                              alt="UPI QR"
                              className="mx-auto mt-2 h-36 w-36 rounded-xl border border-slate-800/70 bg-slate-900/60 object-contain"
                            />
                          </div>
                        </div>
                      )
                    ) : (
                      <input
                        type={field.type ?? "text"}
                        value={form[field.name] ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.name]: event.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400/70"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!session?.access_token || !gymId}
                  className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {modalMode === "edit" ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-700/60 px-5 py-2 text-xs font-semibold text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-400">Loading...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-slate-400">No records yet.</p>
        )}
        {rows
          .filter((row) => {
            if (!search) return true;
            const needle = search.toLowerCase();
            return fields.some((field) => {
              const value = row[field.name];
              return value != null && String(value).toLowerCase().includes(needle);
            });
          })
          .filter((row) => {
            if (!filterField || !filterValue) return true;
            return String(row[filterField]) === filterValue;
          })
          .map((row) => (
          <div
            key={row.id as string}
            className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3"
          >
            <div className="space-y-1">
              {fields.map((field) => (
                <p key={field.name} className="text-xs text-slate-400">
                  <span className="text-slate-500">{field.label}:</span>{" "}
                  <span className="text-slate-200">
                    {row[field.name] == null || row[field.name] === ""
                      ? "—"
                      : String(row[field.name])}
                  </span>
                </p>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(row)}
                className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold text-slate-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(row.id as string)}
                className="rounded-full border border-red-400/60 px-4 py-2 text-xs font-semibold text-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
