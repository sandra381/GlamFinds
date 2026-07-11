import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit{
  trends: any[] = [];
  showWidget: boolean = true;


  constructor(private backend1: BackendService) {}
  ngOnInit(): void {
    this.loadTrends();
  }
  loadTrends(){
    this.backend1.getTrends().subscribe((data) => {
      this.trends = data;
    });
  }
  closeWidget(): void {
    this.showWidget = false;
  }
}
