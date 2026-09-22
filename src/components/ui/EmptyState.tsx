import React from "react";
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center py-24 text-center">
    <h3 className="text-2xl font-bold text-primary mb-2">{title}</h3>
    <p className="text-muted mb-8 max-w-sm">{description}</p>
    {action}
  </div>;
}