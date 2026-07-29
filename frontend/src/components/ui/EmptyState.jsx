export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="mb-4 h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
