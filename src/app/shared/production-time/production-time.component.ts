import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'cb-production-time',
  templateUrl: './production-time.component.html',
  styleUrls: ['./production-time.component.css']
})
export class ProductionTimeComponent implements OnInit {

  @Input('label') label: string = ''
  @Input('readonly') readonly: boolean = false
  rates: number[] = []
  @Input('max') max: number
  @Input('min') min: number
  @Input('rate') rate: number = 0
  @Input('input') input: FormControl = new FormControl()
  temp: number

  constructor() { }

  ngOnInit() {
    for(var i = 0.5; i <= this.max; i += 0.5) {
      this.rates.push(i);
    }
    this.input.setValue(this.rate.toString())
  }

  changeRate(newValue: number) {
    if(this.readonly) return

    this.rate = newValue

    if(newValue === 0) {
      this.input.setValue('')
    } else {
      this.input.setValue(this.rate.toString())
    }
  }

  mouseEnter(index: number): void {
    if(this.readonly) return
    this.temp = this.rate
    this.changeRate(index)
  }

  mouseLeave(): void {
    if(this.readonly) return
    if(this.temp !== null && this.rate != 0) this.changeRate(this.temp)
  }

  defineRate(index: number) {
    if(this.readonly) return
    /* Zerar valor do rate, caso a estrela clicada já tenha valor */
    if(this.temp === index) {
      this.changeRate(0)
    } else {
      this.changeRate(index)
      this.temp = null
    }
  }

}