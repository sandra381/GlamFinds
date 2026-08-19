import { Component } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormBuilder} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Usuario } from 'src/app/models/Usuario';
import { BackendService } from 'src/app/services/backend.service';

// Tipo auxiliar para tipar eventos de input de archivo (no se usa activamente
// en la lógica, solo declara la forma esperada del evento).
interface HtmlInputEvent extends Event{
  target: HtmlInputEvent & EventTarget;
}

// Diálogo modal de REGISTRO de un usuario nuevo. Se abre desde la pantalla
// de login (IngresoComponent). Incluye validación de campos, vista previa de
// la foto de perfil, un medidor de fortaleza de contraseña y un sistema de
// "toast" (aviso flotante) propio para mostrar éxito/error.
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  // Formulario reactivo de registro (usuario, nombre, apellido, edad, sexo, correo, contraseña, imagen, descripción).
  formGroups: FormGroup = new FormGroup({});
  userControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  listado1 = new Array<Usuario>();
  url: any;
  // Archivo de imagen de perfil seleccionado (File), listo para subirse.
	msg = '';
  // URL local (data URL) de la imagen seleccionada, usada para la vista previa circular de perfil.
  imgUrl= "";
  // Nombre del archivo de imagen seleccionado (para mostrarlo en el input de archivo).
  imageName = '';
  // Controla si la contraseña se muestra en texto plano o como puntos (toggle del ícono de "ojo").
  showPass = false;

  // Estado del aviso flotante ("toast") que se muestra tras registrarse: si
  // está visible, si está en proceso de desaparecer (animación), el tipo
  // (éxito/error) y el mensaje a mostrar.
  toast = {
    visible: false,
    hiding:  false,
    type:    'success' as 'success' | 'error',
    message: ''
  };
  private toastTimer: any;

  // Muestra el toast con el tipo y mensaje indicados, y programa su
  // desaparición automática (con una animación de "hiding" antes de ocultarse del todo).
  private showToast(type: 'success' | 'error', message: string) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, hiding: false, type, message };
    this.toastTimer = setTimeout(() => {
      this.toast = { ...this.toast, hiding: true };
      setTimeout(() => { this.toast.visible = false; }, 450);
    }, 3000);
  }

  // Arma el formulario reactivo con todos los campos requeridos para el registro.
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private backend: BackendService,
    private dialogRef: MatDialogRef<RegistroComponent>
  ) {
    this.formGroups = this.fb.group({
      id:['', [Validators.required]],
      usuario: ['', [Validators.required]],
      nombre:['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required]],
      sexo:['', [Validators.required]],
      correo: ['', [Validators.required]],
      contrase:['', [Validators.required]],
      imagen: [null, [Validators.required]],
      descripcion:['', [Validators.required]]
    })
  }

  // Se ejecuta cuando el usuario hace click en el botón "Registrarse".
  // 1) Arma el FormData con la imagen de perfil.
  // 2) Convierte el valor de "edad" (que en realidad se usa como fecha) a formato ISO (YYYY-MM-DD).
  // 3) Envía los datos al backend (guardarUsuarioConImagen).
  // 4) Si todos los campos requeridos tienen valor, muestra un toast de
  //    éxito y cierra el diálogo tras una breve espera; si no, muestra un toast de error.
  guardarUsuario() {
    const formData = new FormData();
    formData.append('imagen', this.msg);
    const fecha = new Date(this.formGroups.value.edad);
    const fechaArr = fecha.toISOString().split('T')[0];
    const userData = { ...this.formGroups.value, edad: fechaArr };
    this.backend.guardarUsuarioConImagen(formData, userData).subscribe((response) => {
        const v = this.formGroups.controls;
        if (v['usuario'].value && v['nombre'].value && v['apellido'].value &&
            v['edad'].value && v['sexo'].value && v['correo'].value &&
            v['contrase'].value && v['imagen'].value && v['descripcion'].value) {
          this.showToast('success', '¡Cuenta creada con éxito!');
          setTimeout(() => { this.borraringreso(); }, 1800);
        } else {
          this.showToast('error', 'Por favor completa todos los campos');
        }
    });
  }

  // Se ejecuta cuando el usuario hace click en el botón de cerrar (X) del diálogo.
  // Cierra el diálogo sin guardar nada.
  cerrar() {
    this.dialogRef.close();
  }

  // Resetea el formulario y cierra el diálogo. Se llama automáticamente
  // después de un registro exitoso (ver guardarUsuario()).
  borraringreso(){
    this.formGroups.reset();
    this.dialogRef.close();
  }

  // Se ejecuta cuando el usuario selecciona una foto de perfil (evento
  // "change" del <input type="file">). Guarda el nombre del archivo, genera
  // la vista previa (data URL) en "imgUrl" y guarda el archivo real en "msg" para subirlo.
  imagenSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.imageName = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.imgUrl = event.target.result;
      };
      this.msg = file;
    } else {
      console.error('No se seleccionó ningún archivo');
    }
  }

  // Getter usado en el HTML para mostrar una barra/indicador de fortaleza de
  // contraseña. Devuelve un puntaje de 0 a 4 sumando un punto por cada
  // criterio cumplido: longitud mínima de 8, tiene mayúscula, tiene número,
  // tiene carácter especial.
  get passwordStrength(): number {
    const p = this.formGroups.get('contrase')?.value || '';
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  // Getter usado en el HTML para mostrar el texto correspondiente al puntaje
  // de passwordStrength ("Débil", "Regular", "Buena" o "Fuerte").
  get passwordStrengthLabel(): string {
    return ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][this.passwordStrength] || '';
  }
}
