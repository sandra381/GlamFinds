import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import {MatTabsModule} from '@angular/material/tabs';
@Component({
  selector: 'app-randlook',
  templateUrl: './randlook.component.html',
  styleUrls: ['./randlook.component.scss']
})
export class RandlookComponent implements OnInit {
  constructor(private backend: BackendService) {}
  look: any;
  lookM: any;

  ngOnInit(): void {
    this.generarNuevoLook();
    this.generarNuevoLookM();
  }
  generarNuevoLook() {
    this.backend.generarLookAleatorio().subscribe(data => {
      this.look = data;
    });
  }
  generarNuevoLookM() {
    this.backend.generarLookAleatorioM().subscribe(data => {
      this.lookM = data;
    });
  }
}
