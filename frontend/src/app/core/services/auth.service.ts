import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginResponseDto {
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'api/auth';

  readonly user = signal<AuthUser | null>(null);

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponseDto>(
        `${this.baseUrl}/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(
        map((res) => res.user),
        tap((user) => this.user.set(user)),
      );
  }

  me(): Observable<AuthUser | null> {
    return this.http
      .get<AuthUser>(`${this.baseUrl}/me`, { withCredentials: true })
      .pipe(
        tap((user) => this.user.set(user)),
        catchError(() => {
          this.user.set(null);
          return of(null);
        }),
      );
  }

  refresh(): Observable<AuthUser> {
    return this.http
      .post<LoginResponseDto>(`${this.baseUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        map((res) => res.user),
        tap((user) => this.user.set(user)),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.user.set(null)),
        catchError((err) => {
          this.user.set(null);
          return throwError(() => err);
        }),
      );
  }
}
