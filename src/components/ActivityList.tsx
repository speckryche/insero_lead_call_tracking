import { Activity } from '@/db/schema';

interface ActivityListProps {
  activities: Activity[];
}

const methodIcons: Record<string, string> = {
  call: '📞',
  email: '✉️',
  text: '💬',
};

const methodLabels: Record<string, string> = {
  call: 'Call',
  email: 'Email',
  text: 'Text',
};

export function ActivityList({ activities }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No activity recorded yet. Log your first interaction above.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="border-l-2 border-blue-200 pl-4 py-2"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>{methodIcons[activity.contactMethod] || '📝'}</span>
            <span className="font-medium text-gray-700">
              {methodLabels[activity.contactMethod] || activity.contactMethod}
            </span>
            <span>•</span>
            <span>
              {activity.createdAt
                ? new Date(activity.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Unknown date'}
            </span>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{activity.notes}</p>
        </div>
      ))}
    </div>
  );
}
