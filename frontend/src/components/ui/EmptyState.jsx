export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="mb-4 h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-[#e2e8f0] dark:border-gray-700 flex items-center justify-center">
          <Icon className="h-6 w-6 text-[#94a3b8]" />
        </div>
      )}
      <h3 className="font-semibold text-[#0f172a] dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#64748b] dark:text-gray-400 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
