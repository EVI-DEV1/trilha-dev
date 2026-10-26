import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GithubRepo, GithubUsuario } from '../models/github.model';

/** Cliente da API REST pública do GitHub (sem token: limite de 60 requisições/hora por IP). */
@Injectable({ providedIn: 'root' })
export class GithubService {
  private http = inject(HttpClient);
  private base = environment.githubApi;

  usuario(login: string): Observable<GithubUsuario> {
    return this.http.get<GithubUsuario>(`${this.base}/users/${encodeURIComponent(login)}`);
  }

  repositorios(login: string): Observable<GithubRepo[]> {
    const params = new HttpParams().set('sort', 'updated').set('per_page', 30);
    return this.http
      .get<GithubRepo[]>(`${this.base}/users/${encodeURIComponent(login)}/repos`, { params })
      .pipe(map((repos) => repos.filter((r) => !r.fork)));
  }
}
