import { Component, OnInit } from '@angular/core';
import { FeedbackModel } from 'app/shared/models/feedback.model';
import { ExternalFeedbackService } from './external-feedback.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';

@Component({
  selector: 'cb-external-feedback',
  templateUrl: './external-feedback.component.html',
  styleUrls: ['./external-feedback.component.scss']
})
export class ExternalFeedbackComponent implements OnInit {
  id: number;
  hash: string;
  readonly = false;
  success = false;
  loading = false;

  constructor(
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private externalFeedbackService: ExternalFeedbackService,
  ) {}

  ngOnInit(): void {
    this.id = Number(this.activatedRoute.snapshot.paramMap.get('id') || 0);

    this.hash = this.activatedRoute.snapshot.paramMap.get('hash') || '';
  }

  submit(feedback: FeedbackModel): void {
    const snackBarLoading = this.snackBar.open('Carregando...');
    
    this.loading = true;
    
    this.externalFeedbackService.post(1, 'hash', feedback).subscribe({
      next: (response) => {
        if (response && response.error && JSON.parse(response.error)) {
          this.error(snackBarLoading);
          
          return;
        }

        snackBarLoading.dismiss();

        this.snackBar.open('Feedback enviado com sucesso!', '', {
          duration: 3000,
        });

        this.loading = false;
        this.readonly = true;
        this.success = true;
      },
      error: () => this.error(snackBarLoading)
    });
  }

  private error(snackBarLoading: MatSnackBarRef<SimpleSnackBar>): void {
    snackBarLoading.dismiss();

    this.loading = false;
    this.readonly = false;
    this.success = false;

    this.snackBar.open('Não foi possível enviar o feedback.');
  }
}
