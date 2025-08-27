import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {NgForOf} from "@angular/common";
import {components} from "../../models/product-catalog";
import {MarkdownComponent} from "ngx-markdown";
import { certifications } from 'src/app/models/certification-standards.const';
type  ProductSpecificationCharacteristic = components["schemas"]["ProductSpecificationCharacteristic"]

interface CharacteristicValue {
  isDefault: boolean;
  value: any;
  valueFrom?: number;
  valueTo?: number;
  unitOfMeasure?: string;
}

interface Characteristic {
  id: string;
  name: string;
  description: string;
  productSpecCharacteristicValue: CharacteristicValue[];
}

@Component({
  selector: 'app-characteristic',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    MarkdownComponent
  ],
  templateUrl: './characteristic.component.html',
  styleUrl: './characteristic.component.css'
})
export class CharacteristicComponent implements OnInit {
  @Input() characteristic!: ProductSpecificationCharacteristic;
  @Input() readOnly: boolean = false;
  @Output() valueChange = new EventEmitter<any>();

  control = new FormControl();

  ngOnInit(): void {
    const defaultValue = this.characteristic.productSpecCharacteristicValue?.find(
      (val) => val.isDefault
    )?.value || this.characteristic.productSpecCharacteristicValue?.find(
      (val) => val.isDefault
    )?.valueFrom;

    console.log('defaultValue: ', defaultValue);
    if (defaultValue !== undefined) {
      this.control = new FormControl(
        { value: defaultValue, disabled: this.readOnly } // Configura el estado aquí
      );
    }

    // Emit initial value
    this.control.valueChanges.subscribe((value) => {
      if (!this.readOnly) { // Respetar el estado de solo lectura
        this.valueChange.emit({
          characteristicId: this.characteristic.id,
          selectedValue: value,
        });
      }
    });
  }

  isSlider(): boolean {
    const values = this.characteristic.productSpecCharacteristicValue;
    return values?.some((val) => val.valueFrom !== undefined && val.valueTo !== undefined) || false;
  }

  getSliderRange(): { min: number; max: number } | null {
    const range = this.characteristic.productSpecCharacteristicValue?.find(
      (val) => val.valueFrom !== undefined && val.valueTo !== undefined
    );
    if (range) {
      return { min: range.valueFrom!, max: range.valueTo! };
    }
    return null;
  }

  getUnit(): string | undefined {
    return this.characteristic.productSpecCharacteristicValue?.[0].unitOfMeasure;
  }
}
