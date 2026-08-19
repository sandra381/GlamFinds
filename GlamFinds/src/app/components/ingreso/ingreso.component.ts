import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistroComponent } from '../registro/registro.component';

// Componente de la pantalla de LOGIN (ruta "/", la primera pantalla que ve
// el usuario). Valida las credenciales contra el backend, guarda la sesión
// en localStorage y redirige según el tipo de usuario. También permite abrir
// el diálogo de registro.
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

  // Modelo del formulario de login (usuario y contraseña, enlazados con ngModel).
  user = { id_user: 0, usuario: '', contrase: '' };
  usuar = '';
  pass  = '';
  // Controla si la contraseña se muestra en texto plano o oculta (toggle del ícono de "ojo").
  showPass = false;

  // Estado del aviso flotante ("toast") que informa éxito o error al intentar ingresar.
  toast = {
    visible:  false,
    hiding:   false,
    type:     'success' as 'success' | 'error',
    message:  ''
  };
  private toastTimer:  any;
  private navTimer:    any;

  // Muestra el toast con el tipo y mensaje indicados. Si se pasa
  // "navigateTo", programa la navegación a esa ruta después de una breve
  // espera (para que el usuario alcance a ver el mensaje antes de cambiar de pantalla).
  // También programa la desaparición automática del toast (con animación de "hiding").
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

  // Se ejecuta cuando el usuario hace click en el botón "Ingresar" del formulario.
  // 1) Si falta usuario o contraseña, muestra un toast de error y no continúa.
  // 2) Verifica las credenciales contra el backend (ingresarMenu).
  // 3) Si son correctas, pide los datos completos del usuario, guarda su id
  //    en localStorage ("ids") y muestra un toast de bienvenida que, al
  //    desaparecer, navega a "/agregar" si el usuario es "AdminUser" o a
  //    "/feed" para cualquier otro usuario.
  // 4) Si las credenciales son incorrectas, limpia el formulario y muestra un toast de error.
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

  // Limpia los campos de usuario y contraseña del formulario. Se llama tras un login fallido.
  borrar() {
    this.user.usuario  = '';
    this.user.contrase = '';
  }

  // Se ejecuta cuando el usuario hace click en el enlace/botón "Registrarse".
  // Abre el diálogo modal de RegistroComponent para crear una cuenta nueva.
  openRegistrar() {
    this.dialog.open(RegistroComponent, { restoreFocus: false });
  }
}
