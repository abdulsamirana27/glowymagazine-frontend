import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
    categoryForm: FormGroup;

    imgsrc = '../../../../../assets/images/apps/ecommerce/products/No-Preview-Available.jpg';

    fileChange(e) {
        const file = e.srcElement.files[0];
        this.imgsrc = window.URL.createObjectURL(file);

    }

  constructor(private _formBuilder: FormBuilder,
              private cd: ChangeDetectorRef,
              public _d: DomSanitizer) { }

  ngOnInit(): void {
      this.addCategoryForm();
  }

    addCategoryForm() {
        this.categoryForm = this._formBuilder.group({
            categoryName: ['', [Validators.required, Validators.maxLength(18), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
            categoryDescription: ['', [Validators.required]],
            file: [null],
            mediaId:[],
        })
    }

    onClose() {

    }
}
