import { Component, ViewChild } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatMenuTrigger, MatMenuModule} from '@angular/material/menu';
import { RegistroComponent } from '../registro/registro.component';
import { IngresoComponent } from '../ingreso/ingreso.component';

// Componente del menú lateral izquierdo (sidebar) que aparece en las páginas
// principales de la aplicación, con los enlaces de navegación ("MI ESTILO",
// "DESCUBRIR", etc.). Toda la estructura de enlaces vive en el HTML;
// esta clase no tiene lógica propia ni variables, solo declara el componente.
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
}

