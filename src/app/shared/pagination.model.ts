export class Pagination<T = any> {
  current_page: number;
  data: T[];
  from: number;
  last_page: number;
  next_page_url: number;
  path: string;
  per_page: number;
  prev_page_url: string;
  to: number;
  total: number;
}
