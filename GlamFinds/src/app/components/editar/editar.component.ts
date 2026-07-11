import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
}) export class EditarComponent implements OnInit {
  fomGroup: FormGroup = new FormGroup({});
  comicControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  msg = '';
  imgUrl= "";
  posts_generales: any={
      id:0,
      usuario:'',
      descripcion:'',
      imagen:''

  }
  dataSource: any[] = [];
  dataSource5: any[] = [];
  activeTab = 'publicaciones';

  followersCount: number = 0;
  followingCount: number = 0;
  postsCount: number = 0;

  constructor(private fb: FormBuilder,private share : ShareDataService , private router:Router, private backend4:BackendService,private activateRouter:ActivatedRoute,public snackBar: MatSnackBar,public dialog: MatDialog) {}
  ngOnInit(): void {
    const id_new = localStorage.getItem('ids');
    if(id_new){
      const userId = Number(id_new);
      this.backend4.obtenerUsuario(userId).subscribe(x=>{
        this.posts_generales.usuario = x.datos[0].usuario;
        this.posts_generales.descripcion=x.datos[0].descripcion;
        this.posts_generales.imagen =x.datos[0].imagen;
        console.log(x.datos[0]);
      });
      this.backend4.PostPerfil(userId).subscribe((x: any) => {
        this.dataSource = x.datos || x || [];
      });
      this.backend4.obtenerArticulos().subscribe((x: any) => {
        this.dataSource5 = x.datos || x || [];
      });
      this.backend4.getUserStats(userId).subscribe(stats => {
          this.followersCount = stats.followers;
          this.followingCount = stats.following;
          this.postsCount = stats.posts;
        },
        error => console.error('Error al cargar estadísticas', error)
      );
    }
  }


  isImage(fileName: string): boolean {
    if (!fileName) return false;
    return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
  }
  guardarModificar() {
    const id_new = localStorage.getItem('ids');
    if (id_new) {
      const formData = new FormData();
      formData.append('usuario', this.posts_generales.usuario);
      formData.append('descripcion', this.posts_generales.descripcion);
      if (this.msg) {
        formData.append('imagen', this.msg);
      } else {
        formData.append('imagen', this.posts_generales.imagen);
      }
      this.backend4.editarPosts2(Number(id_new), formData).subscribe(
        (response: any) => {
          if (response.status === 1) {
            this.snackBar.open('¡Modificaciones realizadas con éxito! 🚀💫🌈', 'Cerrar', {
              duration: 4000,
            });
            this.regresar();
          } else {
            this.snackBar.open('Error al actualizar el perfil. Intente nuevamente.', 'Cerrar', {
              duration: 4000,
            });
          }
        },(error) => {
          console.error('Error al actualizar el perfil:', error);
          this.snackBar.open('Error en el servidor. Intente más tarde.', 'Cerrar', {
            duration: 4000,
          });
        }
      );
    }
  }
  regresar() {
    this.router.navigateByUrl("/perfil");
  }
  imagenSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        this.imgUrl = e.target.result;
      };
      this.msg = file;
    } else {
      console.error('No se seleccionó ningún archivo');
    }
  }
}

