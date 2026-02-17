"use client";

import CrudModule from "@/components/CrudModule";
import KpiGrid from "@/components/KpiGrid";
import ContextNotice from "@/components/ContextNotice";
import ModuleShell from "@/components/ModuleShell";
import useGymContext from "@/lib/useGymContext";
import { supabaseCount } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function PaymentsPage() {
  const { session, gymId, profile, loading, error } = useGymContext();
  const [kpis, setKpis] = useState([
    { label: "Payments", value: "0" },
    { label: "Pending", value: "0" },
    { label: "Products", value: "0" },
    { label: "Orders", value: "0" },
  ]);

  useEffect(() => {
    async function loadKpis() {
      if (!session?.access_token || !gymId) return;
      const [payments, pending, products, orders] = await Promise.all([
        supabaseCount(`payments?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(
          `payments?gym_id=eq.${gymId}&status=eq.pending`,
          session.access_token
        ),
        supabaseCount(`products?gym_id=eq.${gymId}`, session.access_token),
        supabaseCount(`orders?gym_id=eq.${gymId}`, session.access_token),
      ]);
      setKpis([
        { label: "Payments", value: payments.toString() },
        { label: "Pending", value: pending.toString() },
        { label: "Products", value: products.toString() },
        { label: "Orders", value: orders.toString() },
      ]);
    }

    loadKpis();
  }, [gymId, session?.access_token]);

  return (
    <ModuleShell title="Payments & POS" subtitle={profile?.gym?.name ?? "FitSutra"}>
      <ContextNotice
        session={session}
        gymId={gymId}
        loading={loading}
        error={error}
      />

      <KpiGrid items={kpis} />

      <CrudModule
        title="Payments"
        description="Track invoices, billing status, and methods."
        table="payments"
        session={session}
        gymId={gymId}
        fields={[
          { name: "member_id", label: "Member ID", required: true },
          { name: "amount", label: "Amount", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Paid", value: "paid" },
              { label: "Pending", value: "pending" },
              { label: "Failed", value: "failed" },
            ],
          },
          { name: "paid_on", label: "Paid On", type: "date" },
          { name: "method", label: "Method" },
          { name: "invoice_no", label: "Invoice" },
        ]}
      />

      <CrudModule
        title="Products"
        description="Retail inventory for gym store."
        table="products"
        session={session}
        gymId={gymId}
        fields={[
          { name: "name", label: "Product Name", required: true },
          { name: "sku", label: "SKU" },
          { name: "price", label: "Price", type: "number" },
          { name: "stock", label: "Stock", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Orders"
        description="POS orders and receipts."
        table="orders"
        session={session}
        gymId={gymId}
        fields={[
          { name: "member_id", label: "Member ID" },
          { name: "total", label: "Total", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Paid", value: "paid" },
              { label: "Pending", value: "pending" },
              { label: "Refunded", value: "refunded" },
            ],
          },
        ]}
      />

      <CrudModule
        title="Order Items"
        description="Line items per order."
        table="order_items"
        session={session}
        gymId={gymId}
        fields={[
          { name: "order_id", label: "Order ID", required: true },
          { name: "product_id", label: "Product ID" },
          { name: "quantity", label: "Quantity", type: "number" },
          { name: "price", label: "Price", type: "number" },
        ]}
      />
    </ModuleShell>
  );
}
