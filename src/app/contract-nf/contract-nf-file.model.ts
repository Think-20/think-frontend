import { Employee } from "app/employees/employee.model";
import { Task } from "app/schedule/task.model";
import { FileUploadInterface } from "app/shared/file-upload/file-upload.interface";

export class ContractNfFile implements FileUploadInterface {
  id: number;
  responsible_id?: number;
  responsible?: Employee;
  task_id?: number;
  task?: Task;
  name: string;
  original_name: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}
