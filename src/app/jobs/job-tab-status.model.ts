import { EJobTabStatus } from './job-tab-status.enum';

export class JobTabStatus {
    constructor(
        public info_check?: EJobTabStatus,
        public briefing_check?: EJobTabStatus,
        public project_check?: EJobTabStatus,
        public descriptive_memorial_check?: EJobTabStatus,
        public checkin_check?: EJobTabStatus,
        public budget_check?: EJobTabStatus,
    ) {}
}
