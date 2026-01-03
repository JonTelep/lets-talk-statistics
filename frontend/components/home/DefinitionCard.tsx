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
    <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-500 hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-4">
        <div className="mr-4">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900">{term}</h3>
      </div>

      <div className="space-y-4 text-gray-700">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Definition:</h4>
          <p className="text-base leading-relaxed">{definition}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-1">In This Project:</h4>
          <p className="text-base leading-relaxed">{context}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Why It Matters:</h4>
          <p className="text-base leading-relaxed">{importance}</p>
        </div>

        {example && (
          <div className="bg-primary-50 rounded-md p-4 mt-4">
            <h4 className="font-semibold text-primary-900 mb-2">Example:</h4>
            <p className="text-sm text-primary-800 leading-relaxed">{example}</p>
          </div>
        )}
      </div>
    </div>
  );
}
