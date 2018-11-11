import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { DisplayService } from '../../services/display.service';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {
  
  showLoader: boolean = false;
  
  data: any;
  locationType: string;
  displayType: string;
  displayMusic: string = 'No';
  radioFrequency: number;
  displayRating: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public displayService: DisplayService) {
    this.data = navParams.get('data');
  }
  
  cancelAdd() {
    this.viewCtrl.dismiss();
  }
  
  addDisplay() {
    this.showLoader = true;
    const display = {
      "latitude": this.data.lat,
      "longitude": this.data.lng,
      "address": this.data.address.street,
      "city": this.data.address.city,
      "state": this.data.address.state,
      "zip": this.data.address.zip,
      "locationType": this.locationType,
      "displayType": this.displayType,
      "displayMusic": this.displayMusic,
      "radioFrequency": this.radioFrequency,
      "displayRating": this.displayRating
    }
    this.displayService.createDisplay(display).subscribe((data: any) => {
      this.showLoader = false;
      console.log('createDisplay: ', data);
      this.cancelAdd();
    },
    (err) => {
      console.log('createDisplay ERROR: ', err);
    });
  }

}
