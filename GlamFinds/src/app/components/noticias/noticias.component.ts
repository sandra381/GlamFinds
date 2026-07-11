import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss']
})
export class NoticiasComponent implements OnInit {
  trends: any[] = [];

  constructor(private backend1: BackendService) {}

  ngOnInit(): void {
    this.backend1.getTrends().subscribe((data) => {
      this.trends = data;
    });
  }
}
