import { FadeIn } from '../animations';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {Icon && (
          <div className="mb-4 p-4 bg-rose-50 rounded-2xl">
            <Icon size={32} className="text-rose-400" strokeWidth={1.5} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">{title}</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
        {actionLabel && onAction && (
          <button onClick={onAction} className="btn-primary">{actionLabel}</button>
        )}
      </div>
    </FadeIn>
  );
}
