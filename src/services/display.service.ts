import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class DisplayService {
  
  apiUrl = 'http://api.wherearethelights.com/display';
  
  constructor(private http: HttpClient) {
    
  }
  
  createDisplay(display) {
    return this.http.post(this.apiUrl + '/create.php', display);
  }
  
}