'use client';

import { personalities, PersonalityProfile } from '@/config/personalities';
import { Card } from './ui/Card';

interface TutorSelectorProps {
  selectedTutor: string | null;
  onSelect: (tutorId: string) => void;
}

export function TutorSelector({ selectedTutor, onSelect }: TutorSelectorProps) {
  const tutorList = Object.values(personalities);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tutorList.map((tutor) => (
        <button
          key={tutor.id}
          onClick={() => onSelect(tutor.id)}
          className={`text-left transition-all ${
            selectedTutor === tutor.id
              ? 'ring-2 ring-primary'
              : 'hover:shadow-lg'
          }`}
        >
          <Card className="h-full">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {tutor.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tutor.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {tutor.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {selectedTutor === tutor.id && (
                <div className="rounded-md bg-primary/10 p-3 text-sm">
                  <p className="font-medium text-primary">Example phrases:</p>
                  <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                    {tutor.examplePhrases.slice(0, 2).map((phrase, idx) => (
                      <li key={idx} className="text-xs">
                        &quot;{phrase}&quot;
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
