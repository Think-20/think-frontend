import { Employee } from "../employees/employee.model";
import { JobActivity } from "../job-activities/job-activity.model";
import { Job } from "../jobs/job.model";
import { TaskItem } from "./task-item.model";

export class Task {
  id: number
  available_date: string
  responsible_id: number
  responsible?: Employee
  duration: number
  job_activity_id: number
  job_activity?: JobActivity
  job_id: number
  job?: Job
  items?: TaskItem[]
}