'use client';

import { SCENARIOS, SCENARIO_LIST, Scenario } from '@/config/scenarios';
import { Card } from './ui/Card';
import { Clock, Award } from 'lucide-react';

interface ScenarioSelectorProps {
  selectedScenario: string | null;
  onSelect: (scenarioId: string) => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export function ScenarioSelector({ selectedScenario, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {SCENARIO_LIST.map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => onSelect(scenario.id)}
          className={`text-left transition-all ${
            selectedScenario === scenario.id
              ? 'ring-2 ring-primary'
              : 'hover:shadow-lg'
          }`}
        >
          <Card className="h-full">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {scenario.name}
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    difficultyColors[scenario.difficulty]
                  }`}
                >
                  {scenario.difficulty}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scenario.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {scenario.estimatedTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Award size={14} />
                  {scenario.minExchanges}+ exchanges
                </span>
              </div>

              {selectedScenario === scenario.id && (
                <div className="rounded-md bg-primary/10 p-3 text-sm">
                  <p className="font-medium text-primary">Setting:</p>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {scenario.setting}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
