import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
@Component({
  selector: 'app-shoe-classifier',
  templateUrl: './shoe-classifier.component.html',
  styleUrls: ['./shoe-classifier.component.scss']
})
export class ShoeClassifierComponent implements OnInit{
  model: any;
  predictions: any;
  imageSrc: string | ArrayBuffer | null = null;
  async ngOnInit() {
    this.model = await tf.loadLayersModel('/assets/model_zapato/model.json');
  }
  async classifyImage(imageElement: HTMLImageElement) {
    if (this.model) {
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();

      const predictions = await this.model.predict(tensor).data();
      this.predictions = Array.from(predictions);
      console.log('Predicciones:', this.predictions);
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          this.imageSrc = result;
          setTimeout(() => {
            const imageElement = document.getElementById('uploadedImage') as HTMLImageElement;
            this.classifyImage(imageElement); }, 100);
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
