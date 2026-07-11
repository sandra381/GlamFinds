import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistroComponent } from '../registro/registro.component';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.scss']
})
export class IngresoComponent {
  constructor(
    private router:   Router,
    private backend1: BackendService,
    public  dialog:   MatDialog
  ) {}

  user = { id_user: 0, usuario: '', contrase: '' };
  usuar = '';
  pass  = '';
  showPass = false;

  toast = {
    visible:  false,
    hiding:   false,
    type:     'success' as 'success' | 'error',
    message:  ''
  };
  private toastTimer:  any;
  private navTimer:    any;

  private showToast(type: 'success' | 'error', message: string, navigateTo?: string) {
    clearTimeout(this.toastTimer);
    clearTimeout(this.navTimer);
    this.toast = { visible: true, hiding: false, type, message };

    if (navigateTo) {
      // Navegar después de que el usuario vea brevemente el toast
      this.navTimer = setTimeout(() => this.router.navigateByUrl(navigateTo), 1100);
    }

    this.toastTimer = setTimeout(() => {
      this.toast = { ...this.toast, hiding: true };
      setTimeout(() => { this.toast.visible = false; }, 450);
    }, 2600);
  }

  ingresarbase() {
    if (this.user.usuario === '' || this.user.contrase === '') {
      this.showToast('error', 'Por favor completa todos los campos');
      return;
    }

    this.backend1.ingresarMenu(this.user).subscribe(
      (x) => {
        const id = x.datos[0].id_user;
        this.backend1.obtenerUsuario(id).subscribe(x => {
          localStorage.setItem('ids', String(id));
          const dest = x.datos[0].usuario === 'AdminUser' ? '/agregar' : '/feed';
          this.showToast('success', '¡Bienvenido/a de vuelta!', dest);
        });
      },
      (error) => {
        this.borrar();
        console.error('Error:', error);
        this.showToast('error', 'Usuario o contraseña incorrectos');
      }
    );
  }

  borrar() {
    this.user.usuario  = '';
    this.user.contrase = '';
  }

  openRegistrar() {
    this.dialog.open(RegistroComponent, { restoreFocus: false });
  }
}
