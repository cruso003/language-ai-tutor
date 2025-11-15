/**
 * Components Barrel Export
 *
 * Central export point for all reusable components
 */

// 3D Avatar Components (archived - keeping for reference)
export { Avatar3DCanvas } from './Avatar3DCanvas';
export { Avatar3DScene } from './Avatar3DScene';
export { AvatarDisplay } from './AvatarDisplay';

// 2D Tutor Components (current system)
export { TutorAvatar } from './TutorAvatar';
export { TutorSelector } from './TutorSelector';

// Fluency System
export { FluencyGate } from './FluencyGate';
export { FluencyMetrics } from './FluencyMetrics';
export type { SessionMetrics } from './FluencyMetrics';

// Scenario System
export { ScenarioCard } from './ScenarioCard';
export { ScenarioSelector } from './ScenarioSelector';
export { ScenarioProgress } from './ScenarioProgress';

// Corrections System
export { CorrectionCard } from './CorrectionCard';
export { CorrectionsPanel } from './CorrectionsPanel';

// UI Components
export { Button } from './ui/Button';
export { Card } from './ui/Card';
export { Input } from './ui/Input';
