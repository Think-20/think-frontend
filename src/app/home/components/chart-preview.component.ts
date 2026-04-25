import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ChartOptions, LineChartOptions } from '../home.component';
import { HomeData } from '../models/home-data.model';

@Component({
  selector: 'cb-chart-preview',
  templateUrl: './chart-preview.component.html',
  styleUrls: ['./chart-preview.component.css']
})
export class ChartPreviewComponent {
  @Input() homeData: HomeData;
  @Input() chartType: number;
  @Input() title: string;
  EChartType = EChartType;
  chartOptions:Partial<LineChartOptions> = {
    series: [],
    chart: { height: 270, type: "line", toolbar: { show: false }},
    grid: { borderColor: "#fff", position: "back", xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } } },
    colors: [],
    dataLabels: { enabled: false },
    stroke: { curve: "straight", width: [2, 4] },
    markers: { size: 1 },
    xaxis: { categories: [] },
    yaxis: { show: false },
    legend: { show: false },
  };

  chartOptionsPieJobs: Partial<ChartOptions> = {
    series: [],
    chart: { width: 500, type: "donut" },
    stroke: { width: 0 },
    legend: { position: "left", markers: { radius: 0, height: 10 } },
    plotOptions: { pie: { donut: { size: "80%", labels: { show: true, total: { showAlways: true, show: true, fontSize: "80px", fontFamily: "-apple-system,BlinkMacSystemFont, Segoe UI ,Roboto, Helvetica Neue,Arial,sans-serif", color: "#57585a", fontWeight: "300" }, value: { fontFamily: "-apple-system,BlinkMacSystemFont, Segoe UI ,Roboto, Helvetica Neue,Arial,sans-serif", color: "#57585a", fontWeight: "100", fontSize: "20px", offsetY: 25 }, name : { offsetY: 10 } } } } },
    labels: [],
    dataLabels: { enabled: false },
    colors: [],
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }],
    tooltip: { y: {} }
  };

  chartOptionsPie: Partial<ChartOptions> = {
    series: [],
    chart: { width: 500, type: "donut" },
    stroke: { width: 0 },
    legend: { position: "left", markers: { radius: 0, height: 10 } },
    plotOptions: { pie: { donut: { size: "80%", labels: { show: true, total: { showAlways: true, show: true, fontSize: "80px", fontFamily: "-apple-system,BlinkMacSystemFont, Segoe UI ,Roboto, Helvetica Neue,Arial,sans-serif", color: "#57585a", fontWeight: "300" }, value: { fontFamily: "-apple-system,BlinkMacSystemFont, Segoe UI ,Roboto, Helvetica Neue,Arial,sans-serif", color: "#57585a", fontWeight: "100", fontSize: "20px", offsetY: 25 }, name : { offsetY: 10 } } } } },
    labels: [],
    colors: [],
    dataLabels: { enabled: false },
    responsive: [ { breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } } ],
    tooltip: { y: {} }
  };

  constructor(public dialog: MatDialog) { }

  configureChartOptionsPieJobs() {
    this.chartOptionsPieJobs.series = this.homeData.jobs.series;
    this.chartOptionsPieJobs.plotOptions.pie.donut.labels.total.formatter = () => this.homeData.jobs.meta_jobs.toLocaleString(undefined, { minimumFractionDigits: 0 }),
    this.chartOptionsPieJobs.plotOptions.pie.donut.labels.total.label = this.homeData.jobs.total.toLocaleString(undefined, { minimumFractionDigits: 0 });
    this.chartOptionsPieJobs.labels = this.homeData.jobs.labels;
    this.chartOptionsPieJobs.colors = this.homeData.jobs.colors;
    this.chartOptionsPieJobs.tooltip = { y: { formatter: (val) => this.getValue(val) } }

    if (this.homeData.jobs.total > 99999) {
      this.chartOptionsPieJobs.plotOptions.pie.donut.labels.total.fontSize = "45px";
    }
  }

  getValue(val: number) {
    const jobTypes = ['aprovados', 'avancados', 'ajustes', 'stand_by', 'reprovados'];
  
    for (const type of jobTypes) {
      if (this.homeData.jobs[type].total === val) {
        return `${this.homeData.jobs[type].porcentagem}%`;
      }
    }
  
    return '0%';
  }

  configureChartOptionsPie() {
    this.chartOptionsPie.series = this.homeData.jobs2.series.map(x => Number(x));
    this.chartOptionsPie.tooltip = { y: { formatter: (val) => `${val}%` } };
    this.chartOptionsPie.plotOptions.pie.donut.labels.total.formatter = () => this.homeData.jobs2.meta_jobs.toLocaleString(undefined, { minimumFractionDigits: 0 }),
    this.chartOptionsPie.plotOptions.pie.donut.labels.total.label = this.homeData.jobs2.total.toLocaleString(undefined, { minimumFractionDigits: 0 });
    this.chartOptionsPie.labels = this.homeData.jobs2.labels;
    this.chartOptionsPie.colors = this.homeData.jobs2.colors;
    

    if (this.homeData.jobs2.total > 99999) {
      this.chartOptionsPieJobs.plotOptions.pie.donut.labels.total.fontSize = "45px";
    }
  }

  configureChartLine() {
    this.chartOptions.series = this.homeData.tendencia.series;
    this.chartOptions.colors = this.homeData.tendencia.colors;
    this.chartOptions.xaxis.categories = this.homeData.tendencia.meses_ano;

    this.chartOptions.tooltip = {
      y: {
          formatter: (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      },
    };
  }
}

export enum EChartType {
  JOBS = 1,
  JOBS2 = 2,
  TENDENCIA = 3,
}