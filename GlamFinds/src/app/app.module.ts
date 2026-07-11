import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatDialogModule} from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatMenuModule} from '@angular/material/menu';
import { RegistroComponent } from './components/registro/registro.component';
import { IngresoComponent } from './components/ingreso/ingreso.component';
import {HttpClientModule} from '@angular/common/http';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TendenciasComponent } from './components/tendencias/tendencias.component';
import { RopaComponent } from './components/ropa/ropa.component';
import { MaquillajeComponent } from './components/maquillaje/maquillaje.component';
import { AccesoriosComponent } from './components/accesorios/accesorios.component';
import { ZapatosComponent } from './components/zapatos/zapatos.component';
import { Menu2Component } from './components/menu2/menu2.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import { DescuentosComponent } from './components/descuentos/descuentos.component';
import { DupsComponent } from './components/dups/dups.component';
import { AfterViewChecked } from '@angular/core';
import { AdminComponent } from './components/admin/admin.component';
import { Menu3Component } from './components/menu3/menu3.component';
import { AgregarComponent } from './components/agregar/agregar.component';
import { ModificarComponent } from './components/modificar/modificar.component';
import { EliminarComponent } from './components/eliminar/eliminar.component';
import { EliminarUserComponent } from './components/eliminar-user/eliminar-user.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import { TablaTendenciasComponent } from './components/tabla-tendencias/tabla-tendencias.component';
import { TablaRopaComponent } from './components/tabla-ropa/tabla-ropa.component';
import { TablaMaquillajeComponent } from './components/tabla-maquillaje/tabla-maquillaje.component';
import { TablaAccesoriosComponent } from './components/tabla-accesorios/tabla-accesorios.component';
import { TablaZapatosComponent } from './components/tabla-zapatos/tabla-zapatos.component';
import { TablaDescuentosComponent } from './components/tabla-descuentos/tabla-descuentos.component';
import { TablaDupsComponent } from './components/tabla-dups/tabla-dups.component';
import {MatIconModule} from '@angular/material/icon';
import { PerfilComponent } from './components/perfil/perfil.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import { AgregarPubUComponent } from './components/agregar-pub-u/agregar-pub-u.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { EditarComponent } from './components/editar/editar.component';
import { ModificarCommComponent } from './components/modificar-comm/modificar-comm.component';
import { ModificarCommPComponent } from './components/modificar-comm-p/modificar-comm-p.component';
import { Filter } from 'bad-words';
import { ImagecolorComponent } from './components/imagecolor/imagecolor.component';
import { MoodboardComponent } from './components/moodboard/moodboard.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RandlookComponent } from './components/randlook/randlook.component';
import { TryOnComponent } from './components/try-on/try-on.component';
import { ShoeClassifierComponent } from './shoe-classifier/shoe-classifier.component';
import { ArticulosComponent } from './components/articulos/articulos.component';
import { AgregarARTComponent } from './components/agregar-art/agregar-art.component';
import { ModificarCommARTComponent } from './components/modificar-comm-art/modificar-comm-art.component';
import { WidgetComponent } from './components/widget/widget.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NoticiasComponent } from './components/noticias/noticias.component';
import { AsistenteComponent } from './components/asistente/asistente.component';
import { FeedTendenciasComponent } from './feed-tendencias/feed-tendencias.component';
import { FeedSiguiendoComponent } from './feed-siguiendo/feed-siguiendo.component';
import { FeedParatiComponent } from './feed-parati/feed-parati.component';
import { OutfitIaComponent } from './components/outfit-ia/outfit-ia.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    RegistroComponent,
    IngresoComponent,
    TendenciasComponent,
    RopaComponent,
    MaquillajeComponent,
    AccesoriosComponent,
    ZapatosComponent,
    Menu2Component,
    DescuentosComponent,
    DupsComponent,
    AdminComponent,
    Menu3Component,
    AgregarComponent,
    ModificarComponent,
    EliminarComponent,
    EliminarUserComponent,
    TablaTendenciasComponent,
    TablaRopaComponent,
    TablaMaquillajeComponent,
    TablaAccesoriosComponent,
    TablaZapatosComponent,
    TablaDescuentosComponent,
    TablaDupsComponent,
    PerfilComponent,
    AgregarPubUComponent,
    EditarComponent,
    ModificarCommComponent,
    ModificarCommPComponent,
    ImagecolorComponent,
    MoodboardComponent,
    RandlookComponent,
    TryOnComponent,
    ShoeClassifierComponent,
    ArticulosComponent,
    AgregarARTComponent,
    ModificarCommARTComponent,
    WidgetComponent,
    NoticiasComponent,
    AsistenteComponent,
    FeedTendenciasComponent,
    FeedSiguiendoComponent,
    FeedParatiComponent,
    OutfitIaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatMenuModule,
    HttpClientModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTabsModule,
    MatGridListModule,
    MatInputModule,
    MatSnackBarModule,
    DragDropModule,
    EditorModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
