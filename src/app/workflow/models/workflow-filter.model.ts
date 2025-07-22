import { Client } from 'app/clients/client.model';
import { Employee } from 'app/employees/employee.model';
import { JobType } from 'app/job-types/job-type.model';

export interface IWorkflowFilter {
    search: string,
    creation: Employee,
    job_type: JobType,
    client: Client | string,
    clientName: Client | string,
    attendance: Employee,
    initial_date: string,
    final_date: string,
  }
