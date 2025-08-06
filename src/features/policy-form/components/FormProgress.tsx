import { usePolicyFormContext } from '../PolicyFormProvider';
import { Progress } from '@/components/ui/progress';

export function FormProgress() {
  const { progress } = usePolicyFormContext();

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">
          {progress.overall}%
        </div>
        <div className="text-xs text-gray-500">
          Completado
        </div>
      </div>
      <div className="w-32">
        <Progress 
          value={progress.overall} 
          className="h-2"
        />
      </div>
    </div>
  );
}