import { Component } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormBuilder} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Usuario } from 'src/app/models/Usuario';
import { BackendService } from 'src/app/services/backend.service';
interface HtmlInputEvent extends Event{
  target: HtmlInputEvent & EventTarget;
}
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  formGroups: FormGroup = new FormGroup({});
  userControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  listado1 = new Array<Usuario>();
  url: any;
	msg = '';
  imgUrl= "";
  imageName = '';
  showPass = false;

  toast = {
    visible: false,
    hiding:  false,
    type:    'success' as 'success' | 'error',
    message: ''
  };
  private toastTimer: any;

  private showToast(type: 'success' | 'error', message: string) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, hiding: false, type, message };
    this.toastTimer = setTimeout(() => {
      this.toast = { ...this.toast, hiding: true };
      setTimeout(() => { this.toast.visible = false; }, 450);
    }, 3000);
  }

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
  cerrar() {
    this.dialogRef.close();
  }

  borraringreso(){
    this.formGroups.reset();
    this.dialogRef.close();
  }
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

  get passwordStrengthLabel(): string {
    return ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][this.passwordStrength] || '';
  }
}
