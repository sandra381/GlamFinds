import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TendenciasComponent } from './components/tendencias/tendencias.component';
import { RopaComponent } from './components/ropa/ropa.component';
import { MaquillajeComponent } from './components/maquillaje/maquillaje.component';
import { AccesoriosComponent } from './components/accesorios/accesorios.component';
import { ZapatosComponent } from './components/zapatos/zapatos.component';
import { IngresoComponent } from './components/ingreso/ingreso.component';
import { Menu2Component } from './components/menu2/menu2.component';
import { DescuentosComponent } from './components/descuentos/descuentos.component';
import { DupsComponent } from './components/dups/dups.component';
import { AdminComponent } from './components/admin/admin.component';
import { AgregarComponent } from './components/agregar/agregar.component';
import { ModificarComponent } from './components/modificar/modificar.component';
import { EliminarComponent } from './components/eliminar/eliminar.component';
import { EliminarUserComponent } from './components/eliminar-user/eliminar-user.component';
import { TablaTendenciasComponent } from './components/tabla-tendencias/tabla-tendencias.component';
import { TablaRopaComponent } from './components/tabla-ropa/tabla-ropa.component';
import { TablaMaquillajeComponent } from './components/tabla-maquillaje/tabla-maquillaje.component';
import { TablaAccesoriosComponent } from './components/tabla-accesorios/tabla-accesorios.component';
import { TablaZapatosComponent } from './components/tabla-zapatos/tabla-zapatos.component';
import { TablaDescuentosComponent } from './components/tabla-descuentos/tabla-descuentos.component';
import { TablaDupsComponent } from './components/tabla-dups/tabla-dups.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { RegistroComponent } from './components/registro/registro.component';
import { EditarComponent } from './components/editar/editar.component';
import { ModificarCommComponent } from './components/modificar-comm/modificar-comm.component';
import { ImagecolorComponent } from './components/imagecolor/imagecolor.component';
import { MoodboardComponent } from './components/moodboard/moodboard.component';
import { ArticulosComponent } from './components/articulos/articulos.component';
import { RandlookComponent } from './components/randlook/randlook.component';
import { TryOnComponent } from './components/try-on/try-on.component';
import { NoticiasComponent } from './components/noticias/noticias.component';
import { AsistenteComponent } from './components/asistente/asistente.component';
import { FeedTendenciasComponent } from './feed-tendencias/feed-tendencias.component';
import { FeedSiguiendoComponent } from './feed-siguiendo/feed-siguiendo.component';
import { FeedParatiComponent } from './feed-parati/feed-parati.component';
import { OutfitIaComponent } from './components/outfit-ia/outfit-ia.component';


const routes: Routes = [
  {path:'' ,component: IngresoComponent},
  {path:'feed' ,component: TendenciasComponent},
  {path:'ropa' ,component: RopaComponent},
  {path:'maquillaje' ,component: MaquillajeComponent},
  {path:'accesorios' ,component: AccesoriosComponent},
  {path:'zapatos' ,component: ZapatosComponent},
  {path:'menu2/:id' ,component: Menu2Component},
  {path:'descuentos' ,component: DescuentosComponent},
  {path:'dups' ,component: DupsComponent},
  {path:'perfil' ,component: PerfilComponent},
  {path:'perfil/:id' ,component: PerfilComponent},
  {path:'admin' ,component: AdminComponent},
  {path:'agregar' ,component: AgregarComponent},
  {path:'modificar' ,component: ModificarComponent},
  {path:'eliminar' ,component: EliminarComponent},
  {path:'eliminarUser' ,component: EliminarUserComponent},
  {path:'modificar/:id' ,component: ModificarComponent},
  {path:'tablaTendencias' ,component: TablaTendenciasComponent},
  {path:'tablaRopa' ,component: TablaRopaComponent},
  {path:'tablaMaquillaje' ,component: TablaMaquillajeComponent},
  {path:'tablaAccesorios' ,component: TablaAccesoriosComponent},
  {path:'tablaZapatos' ,component: TablaZapatosComponent},
  {path:'tablaDescuentos' ,component: TablaDescuentosComponent},
  {path:'tablaDups' ,component: TablaDupsComponent},
  {path:'registrar' ,component: RegistroComponent},
  {path:'configuracion' ,component: EditarComponent},
  {path:'modComment' ,component: ModificarCommComponent},
  {path:'imagecolor' ,component: ImagecolorComponent},
  {path:'moodboard' ,component: MoodboardComponent},
  {path:'articulo' ,component: ArticulosComponent},
  {path:'randlook'  ,component: RandlookComponent},
  {path:'tryon'     ,component: TryOnComponent},
  {path:'noticias'  ,component: NoticiasComponent},
  {path:'asistente' ,component: AsistenteComponent},

  //nuevas rutas para los feeds
  { path: 'tendencias', component: FeedTendenciasComponent },
  { path: 'siguiendo', component: FeedSiguiendoComponent },
  { path: 'parati', component: FeedParatiComponent },
  { path: 'outfit-ia', component: OutfitIaComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
