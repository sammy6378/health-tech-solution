export const InfoRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label?: string
  children: React.ReactNode
}) => (
  <div className="flex items-start gap-3">
    {icon}
    <div>
      {label && (
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </p>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  </div>
)
