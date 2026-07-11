import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';

@Component({
  selector: 'app-modificar-comm-p',
  templateUrl: './modificar-comm-p.component.html',
  styleUrls: ['./modificar-comm-p.component.scss']
})
export class ModificarCommPComponent {
  fomGroup: FormGroup = new FormGroup({});
  comicControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  comentario: { [key: number]: string } = {};
  commentario: any={
      post:0,
      navegante:0,
      comments:''
  }

  constructor(private fb: FormBuilder,private share : ShareDataService , private router:Router, private backend1:BackendService,private activateRouter:ActivatedRoute,@Inject(MAT_DIALOG_DATA) public data: any ) {}

  ngOnInit() {
    this.backend1.obtenerComentarioUserP(this.data.id,this.data.nav,this.data.comm).subscribe(x=>{
      this.commentario = x.datos[0];
      console.log(this.commentario);
    });
  }

  editComment() {
    this.backend1.modificarComentarioP(this.data.comm,this.commentario).subscribe(x=>{
      console.log(x);
      location.reload();
    });
  }

}
