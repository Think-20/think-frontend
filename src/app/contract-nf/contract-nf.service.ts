import { Http } from "@angular/http";
import { Injectable } from "@angular/core";
import { API } from "app/app.api";
import { AuthService } from "app/login/auth.service";
import { Task } from "app/schedule/task.model";
import { ErrorHandler } from "app/shared/error-handler.service";
import { FileUploadServiceInterface } from "app/shared/file-upload/file-upload-service.interface";
import { FileUploadInterface } from "app/shared/file-upload/file-upload.interface";
import { Observable } from "rxjs";
import { ContractNfFile } from "./contract-nf-file.model";
import { MatSnackBar } from "@angular/material";

@Injectable()
export class ContractNfService implements FileUploadServiceInterface {
  data: ContractNfFile = new ContractNfFile();
  task: Task = null;

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  create(): FileUploadInterface {
    return new ContractNfFile();
  }

  delete(id: number): Observable<any> {
    let url = `contract-nf-files/remove/${id}`;

    return this.http
      .delete(`${API}/${url}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });
        return ErrorHandler.capture(err);
      });
  }

  saveMultipleUrl(): string {
    return "contract-nf-files/save-multiple";
  }

  downloadUrl(contractNfFile: FileUploadInterface) {
    return `contract-nf-files/download/${contractNfFile.id}`;
  }

  viewUrl(contractNfFile: FileUploadInterface) {
    return `${API}/contract-nf-files/view/${contractNfFile.id}`;
  }

  previewFileUrl(contractNfFile: FileUploadInterface) {
    return `contract-nf-files/download/${
      contractNfFile.id
    }?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`;
  }

  downloadAllUrl(task: Task) {
    return `contract-nf-files/download-all/${
      task.id
    }?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`;
  }
}
