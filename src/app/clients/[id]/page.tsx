"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ClientEditForm } from "@/components/clients/ClientEditForm";
import { ClientDashboard } from "@/components/clients/ClientDashboard";

export default function ClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Safety check for ID
  const clientId = typeof params?.id === 'string' ? params.id : '';
  const mode = searchParams.get('mode');
  const isNew = clientId === 'new';

  // If "new", always show form. If mode is "edit", show form.
  if (isNew || mode === 'edit') {
    return <ClientEditForm clientId={clientId} />;
  }

  // Default: Dashboard View
  return <ClientDashboard clientId={clientId} />;
}