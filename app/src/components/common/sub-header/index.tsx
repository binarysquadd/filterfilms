interface SubHeaderProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

export default function SubHeader({ title, description, onClick }: SubHeaderProps) {
  return (
    <div
      className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-sm font-bold">{description}</p>}
    </div>
  );
}
