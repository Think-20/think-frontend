import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UploadFileService } from '../../shared/upload-file.service';
import { ProjectFile } from '../project-file.model';
import { ProjectFileService } from '../project-file.service';
import { forEach } from '@angular/router/src/utils/collection';
import { MatSnackBar } from '@angular/material';
import { Task } from '../../schedule/task.model';
import { API } from '../../app.api';

@Component({
  selector: 'cb-project-file-form',
  templateUrl: './project-file-form.component.html',
  styleUrls: ['./project-file-form.component.css']
})
export class ProjectFileFormComponent implements OnInit {
  @Input() typeForm: string
  @Input() task: Task
  projectFileForm: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private projectFileService: ProjectFileService,
    private snackbar: MatSnackBar,
    private uploadFileService: UploadFileService
  ) { }

  ngOnInit() {
    this.projectFileForm = this.formBuilder.group({
      files: this.formBuilder.array([]),
    })

    this.task.project_files.forEach((projectFile) => {
      this.addFile(projectFile)
    })
  }

  getFilesControls() {
    return (<FormArray>this.projectFileForm.controls.files).controls
  }

  baseName(str)
  {
     var base = new String(str).substring(str.lastIndexOf('/') + 1);
      if(base.lastIndexOf(".") != -1)
          base = base.substring(0, base.lastIndexOf("."));
     return base;
  }

  downloadAll() {
    this.projectFileService.downloadAll(this.task)
  }

  uploadFile(inputFile: HTMLInputElement) {
    let snackbar = this.snackbar.open('Aguarde enquanto carregamos os arquivos...')
    let filenames: string[] = []

    this.uploadFileService.uploadFile(inputFile).subscribe((data) => {
      let projectFiles: ProjectFile[] = []

      for(let i = 0; i < inputFile.files.length; i++) {
        let projectFile = new ProjectFile;
        projectFile.original_name = inputFile.files[i].name
        projectFile.task = this.task
        projectFiles.push(projectFile)
      }

      this.projectFileService.saveMultiple(projectFiles).subscribe((data) => {
        snackbar.dismiss()
        if(data.status == false) {
          this.snackbar.open(data.message, '', { duration: 3000 })
          return
        }

        let projectFiles = <ProjectFile[]> data.project_files
        projectFiles.forEach((projectFile) => {
          this.addFile(projectFile)
        })
      })
    })
  }

  previewFile(projectFile: ProjectFile) {
    this.projectFileService.previewFile(projectFile)
  }

  download(projectFile: ProjectFile, filename: string, type: String) {
    this.projectFileService.download(projectFile).subscribe((blob) => {
      let fileUrl = URL.createObjectURL(blob)
      //window.open(fileUrl, '_blank')
      let anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = fileUrl;
      anchor.target = '_blank'
      anchor.click();
    })
  }

  addFile(projectFile: ProjectFile) {
    const files = <FormArray>this.projectFileForm.controls.files
    let image

    if(projectFile.type == 'pdf') {
      image = '/assets/images/icons/pdf.png'
    } else {
      image = `${API}/project-files/view/${projectFile.id}`
    }

    files.push(this.formBuilder.group({
      id: this.formBuilder.control(projectFile.id),
      original_name: this.formBuilder.control({ value: (projectFile ? projectFile.original_name : ''), disabled: (this.typeForm === 'show' ? true : false) }),
      task_id: this.formBuilder.control(projectFile.task_id),
      image: this.formBuilder.control(image)
    }))
  }

  getImageUrl(group: FormGroup) {
    return group.controls.image.value
  }

  save() {

  }

  deleteFile(i) {
    let snackbar = this.snackbar.open('Aguarde, estamos removendo...')
    const files = <FormArray>this.projectFileForm.controls.files
    let projectFile = <ProjectFile> files.at(i).value

    this.projectFileService.delete(projectFile.id).subscribe((data) => {
      snackbar.dismiss()
      if(data.status == false) {
        this.snackbar.open(data.message, '', { duration: 3000 })
        return
      }

      files.removeAt(i)
    })
  }

}