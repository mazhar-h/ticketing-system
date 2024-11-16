import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/enivornment';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioUrl = environment.apiUrl + '/ticketing/spotify/artist/top-tracks';

  constructor(private http: HttpClient) {}

  getTopTracks(artist: string): Observable<any> {
    return this.http.get(`${this.audioUrl}?&artist=${artist}`);
  }
}