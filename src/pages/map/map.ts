import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, ModalController, Platform } from 'ionic-angular';

import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMaps, GoogleMap, LatLng, GoogleMapsEvent, GoogleMapOptions, Geocoder, GeocoderRequest } from '@ionic-native/google-maps';
import { MapService } from '../../services/map.service';

import { AddPage } from '../add/add';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  
  @ViewChild('map')
  private mapElement: ElementRef;
  private map: GoogleMap;
  private location: LatLng;
  private locations: Array<any> = [];
  public lat: any;
  public lng: any;
  
  constructor(private alertCtrl: AlertController, private diagnostic: Diagnostic, private modalCtrl: ModalController, private platform: Platform, private googleMaps: GoogleMaps, private geolocation: Geolocation, public mapService: MapService) {
//    this.location = new LatLng(42.361145, -71.057083);
  }
  
  ionViewDidLoad() {
    this.platform.ready().then(() => {
      
      let successCallback = (isAvailable) => {
        if (isAvailable) {
          this.initGeolocation();
        } else {
          let alert = this.alertCtrl.create({
            title: 'Turn on GPS',
            message: 'Where are the Lights requires Location Settings to be enabled.',
            buttons: [
              {
                text: 'Settings',
                handler: () => {
                  this.turnOnGps();
                }
              },
              {
                text: 'Nope',
                role: 'cancel'
              }
            ]
          });
          alert.present();
        }
      };
      let errorCallback = (err) => {
        console.log('isLocationEnabled ERROR: ', err);
      }
      
      setTimeout(() => {
        this.diagnostic.isLocationEnabled().then(successCallback).catch(errorCallback);
      }, 1000);
      
    }).catch((err) => {
      console.log('platform ready ERROR: ', err);
    });
    
  }
  
  turnOnGps() {
    this.diagnostic.registerLocationStateChangeHandler(function(state) {
      this.initGeolocation();
    });
    this.diagnostic.switchToLocationSettings();
  }
  
  initGeolocation() {
    this.geolocation.getCurrentPosition().then((position) => {
      // SET CURRENT POSITION
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      this.location = new LatLng(this.lat, this.lng);
      
//      this.locations.push( { "position": { "lat": 0.2799849, "lng": -111.6909225 } } );
//      this.locations.push( { "position": { "lat": 40.2888044, "lng": -111.6772819 } } );
//      this.locations.push( { "position": { "lat": 40.283395, "lng": -111.6847064 } } );
//      this.locations.push( { "position": { "lat": 40.2836457, "lng": -111.6847078 } } );
//      this.locations.push( { "position": { "lat": 40.2842247, "lng": -111.6866504 } } );
//      this.locations.push( { "position": { "lat": 40.2648608, "lng": -111.7007487 } } );
//      this.locations.push( { "position": { "lat": 40.322566, "lng": -111.6850699 } } );
//      this.locations.push( { "position": { "lat": 40.2900826, "lng": -111.6788886 } } );
//      this.locations.push( { "position": { "lat": 40.2765166, "lng": -111.6640661 } } );
//      this.locations.push( { "position": { "lat": 40.2755806, "lng": -111.6618042 } } );
//      this.locations.push( { "position": { "lat": 40.2777256, "lng": -111.6621252 } } );
//      this.locations.push( { "position": { "lat": 40.2810373, "lng": -111.6608835 } } );
//      this.locations.push( { "position": { "lat": 40.2761174, "lng": -111.6369026 } } );
//      this.locations.push( { "position": { "lat": 40.2941439, "lng": -111.7048242 } } );
//      this.locations.push( { "position": { "lat": 40.3256325, "lng": -111.7200236 } } );
//      this.locations.push( { "position": { "lat": 40.3258074, "lng": -111.7209444 } } );
//      this.locations.push( { "position": { "lat": 40.082588, "lng": -111.60008 } } );
//      this.locations.push( { "position": { "lat": 40.4220748, "lng": -111.8877516 } } );
      
      // CREATE MAP
      let element = this.mapElement.nativeElement;
      let options: GoogleMapOptions = {
        controls: {
          'compass': true,
          'myLocationButton': true,
          'myLocation': true,
          'zoom': true,
          'mapToolbar': true
        },
        gestures: {
          'scroll': true,
          'tilt': false,
          'zoom': true,
          'rotate': false
        }
      };
      this.map = this.googleMaps.create(element, options);
      
      // SET INITIAL CAMERA POSITION
      this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
        let initialTarget = {
          target: this.location,
          zoom: 13
        };
        
        this.map.moveCamera(initialTarget);
        this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
          this.addCluster();
        },
        (err) => {
          console.log('CAMERA MOVE END ERROR: ', err);
        });
//        setTimeout(() => {this.addCluster()}, 500);
      }).catch((err) => {
        console.log('error: ', err);
      });
      
      // MAP CLICK HANDLER
      this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((data: any) => {
        this.reverseGeocodeLatLng(data[0].lat, data[0].lng);
      },
      (err) => {
        console.log('MAP_CLICK ERROR: ', err);
      });
      
    }).catch((err) => {
      console.log('geolocation ERROR: ', err);
    });
  }
  
  addCluster() {
    console.log('addCluster');
    const visibleRegion = this.map.getVisibleRegion();
    console.log('visibleRegion: ', visibleRegion);
    
    this.mapService.readInBounds(visibleRegion.southwest.lat, visibleRegion.southwest.lng, visibleRegion.northeast.lat, visibleRegion.northeast.lng).subscribe((data: any) => {
      console.log('read: ', data);
      
      if (data.status == "success" && data.displayCount > 0) {
        
        if (this.locations.length > 0) {
          this.map.clear();
          this.locations = [];
        }
        
        for(let i = 0; i < data['displays'].length; i++) {
          this.locations.push( { "position": { "lat": parseFloat(data['displays'][i].latitude), "lng": parseFloat(data['displays'][i].longitude) } } );
        }
        
        this.map.addMarkerCluster({
          markers: this.locations,
          icons: [
            {
              min: 1,
              max: 2,
              url: "./assets/imgs/mapMarker_green.png", 
              size: { height: 16, width: 16 },
              anchor: { x: 8, y: 8 }
            },
            {
              min: 3, 
              max: 4, 
              url: "./assets/imgs/mapMarker_yellow.png", 
              size: { height: 24, width: 24 },
              anchor: { x: 12, y: 12 }
            },
            {
              min: 5,
              url: "./assets/imgs/mapMarker_red.png", 
              size: { height: 32, width: 32 },
              anchor: { x: 16, y: 16 }
            }
          ]
        })
        .then((markerCluster) => {
          markerCluster.on(GoogleMapsEvent.MAP_CLICK).subscribe((cluster: any) => {
            console.log('cluster was clicked.', cluster);
          },
          (err) => {
            console.log('MAP_CLICK ERROR: ', err);
          });
        }).catch((err) => {
          console.log('err: ', err);
        });
        
      }
      
    },
    (err) => {
      console.log('read ERROR: ', err);
    });
    
//    this.map.addMarkerCluster({
//      markers: this.locations,
//      icons: [
//        {
//          min: 2,
//          url: "assets/imgs/mapMarker_green.png",
//          anchor: { x: 16, y: 16 },
//          size: { width: 32, height: 32 }
//        }
//      ]
//    });
  }
  
  reverseGeocodeLatLng(lat, lng) {
    let options: GeocoderRequest = {
      position: {"lat": lat, "lng": lng }
    };
    Geocoder.geocode(options).then((mvcArray: any) => {
      console.log('addressArray: ', mvcArray);
      
      let address: any = {};
      address.street = mvcArray[0].subThoroughfare + ' ' + mvcArray[0].thoroughfare;
      address.city = mvcArray[0].locality;
      address.state = mvcArray[0].adminArea;
      address.zip = mvcArray[0].postalCode;
      
      let positionAddress = {
        lat: lat,
        lng: lng,
        address: address
      }
      this.confirmAddDisplay(positionAddress);
      
    }).catch((err) => {
      console.log('error: ', err);
    });
  }
  
  confirmAddDisplay(positionAddress) {
    let alert = this.alertCtrl.create({
      title: 'Add Display',
      message: 'Do you want to add a light display at ' + positionAddress.address.street + '?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            let addModal = this.modalCtrl.create(AddPage, { data: positionAddress });
            addModal.onDidDismiss(data => {
              this.addCluster();
            });
            addModal.present();
          }
        }
      ]
    });
    alert.present();
  }

}
