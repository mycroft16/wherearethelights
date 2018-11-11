import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class MapService {
  
  apiUrl = 'http://api.wherearethelights.com/map';
  
  constructor(private http: HttpClient) {
    
  }
  
  readInBounds(swLat, swLng, neLat, neLng) {
    const queryString = '?swLat=' + swLat + '&swLng=' + swLng + '&neLat=' + neLat + '&neLng=' + neLng;
    return this.http.get(this.apiUrl + '/readInBounds.php' + queryString);
  }
  
}
