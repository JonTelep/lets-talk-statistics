import { ReactNode } from 'react';

interface DefinitionCardProps {
  icon: ReactNode;
  term: string;
  definition: string;
  context: string;
  importance: string;
  example?: string;
}

export default function DefinitionCard({
  icon,
  term,
  definition,
  context,
  importance,
  example,
}: DefinitionCardProps) {
  return (
    <div className="card p-8">
      <div className="flex items-center mb-4">
        <div className="mr-4 text-surface-400">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{term}</h3>
      </div>

      <div className="space-y-4 text-surface-400">
        <div>
          <h4 className="font-medium text-surface-300 mb-1">Definition:</h4>
          <p className="text-sm leading-relaxed">{definition}</p>
        </div>

        <div>
          <h4 className="font-medium text-surface-300 mb-1">In This Project:</h4>
          <p className="text-sm leading-relaxed">{context}</p>
        </div>

        <div>
          <h4 className="font-medium text-surface-300 mb-1">Why It Matters:</h4>
          <p className="text-sm leading-relaxed">{importance}</p>
        </div>

        {example && (
          <div className="bg-surface-800 rounded-md p-4 mt-4 border border-border">
            <h4 className="font-medium text-surface-300 mb-2">Example:</h4>
            <p className="text-sm text-surface-400 leading-relaxed">{example}</p>
          </div>
        )}
      </div>
    </div>
  );
}
