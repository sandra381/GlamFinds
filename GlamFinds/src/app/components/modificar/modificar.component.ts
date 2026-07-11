import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modificar',
  templateUrl: './modificar.component.html',
  styleUrls: ['./modificar.component.scss']
})
export class ModificarComponent implements OnInit {
  fomGroup: FormGroup = new FormGroup({});
  comicControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  posts_generales: any={
      id:0,
      descripcion:'',
      imagen:'',
      autor:0,
      categoria:0
  }
  constructor(private fb: FormBuilder,private share : ShareDataService , private router:Router, private backend4:BackendService,private activateRouter:ActivatedRoute) {
  }

  ngOnInit(): void {
    const id_new=this.activateRouter.snapshot.params['id'];
    console.log("id de entrada: " + id_new);

    if(id_new){
      this.backend4.obtenerGeneral(id_new).subscribe(x=>{
      this.posts_generales = x.datos[0];
      console.log(x.datos[0]);
      })
    }
  }
  guardarModificar(){
    const id_new=this.activateRouter.snapshot.params['id'];
    this.backend4.editarPosts(id_new,this.posts_generales).subscribe(x=>{
      console.log(x);
    });
    if (this.posts_generales.categoria== 1) {
      this.router.navigateByUrl("/tablaTendencias");
    } else if (this.posts_generales.categoria == 2) {
      this.router.navigateByUrl("/tablaRopa");
    } else if (this.posts_generales.categoria == 3) {
      this.router.navigateByUrl("/tablaMaquillaje");
    } else if (this.posts_generales.categoria == 4) {
      this.router.navigateByUrl("/tablaAccesorios");
    }else if (this.posts_generales.categoria == 5) {
      this.router.navigateByUrl("/tablaZapatos");
    }else if (this.posts_generales.categoria == 6) {
      this.router.navigateByUrl("/tablaDescuentos");
    }else {
      this.router.navigateByUrl("/tablaDups");
    }

  }
  regresar() {

    if (this.posts_generales.categoria== 1) {
      this.router.navigateByUrl("/tablaTendencias");
    } else if (this.posts_generales.categoria == 2) {
      this.router.navigateByUrl("/tablaRopa");
    } else if (this.posts_generales.categoria == 3) {
      this.router.navigateByUrl("/tablaMaquillaje");
    } else if (this.posts_generales.categoria == 4) {
      this.router.navigateByUrl("/tablaAccesorios");
    }else if (this.posts_generales.categoria == 5) {
      this.router.navigateByUrl("/tablaZapatos");
    }else if (this.posts_generales.categoria == 6) {
      this.router.navigateByUrl("/tablaDescuentos");
    }else {
      this.router.navigateByUrl("/tablaDups");
    }
  }
}