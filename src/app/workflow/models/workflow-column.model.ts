import { ECreationStatus } from 'app/shared/enums/creation-status.enum';
import { EJobStatus } from 'app/shared/enums/job-status.enum';
import { EProductionStatus } from 'app/shared/enums/production-status.enum';

export interface IWorkflowColumn {
    id: EJobStatus | ECreationStatus | EProductionStatus;
    title: string;
    disabled: () => boolean;
}