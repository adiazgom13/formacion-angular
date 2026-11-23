import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AuthService, AuthUser } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const testUser: AuthUser = {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'ADMIN',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('inicia sesión, incluye credenciales y guarda el usuario', () => {
    let result: AuthUser | undefined;

    service.login('admin@example.com', 'secret').subscribe((user) => {
      result = user;
    });

    const req = httpMock.expectOne('api/auth/login');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'admin@example.com',
      password: 'secret',
    });
    expect(req.request.withCredentials).toBe(true);

    req.flush({ user: testUser });

    expect(result).toEqual(testUser);
    expect(service.user()).toEqual(testUser);
  });

  it('obtiene y guarda el usuario actual', () => {
    let result: AuthUser | null | undefined;

    service.me().subscribe((user) => {
      result = user;
    });

    const req = httpMock.expectOne('api/auth/me');

    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(testUser);

    expect(result).toEqual(testUser);
    expect(service.user()).toEqual(testUser);
  });

  it('devuelve null y limpia el usuario si falla la consulta de sesión', () => {
    service.user.set(testUser);
    let result: AuthUser | null | undefined;

    service.me().subscribe((user) => {
      result = user;
    });

    const req = httpMock.expectOne('api/auth/me');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(result).toBeNull();
    expect(service.user()).toBeNull();
  });

  it('renueva la sesión y guarda el usuario devuelto', () => {
    let result: AuthUser | undefined;

    service.refresh().subscribe((user) => {
      result = user;
    });

    const req = httpMock.expectOne('api/auth/refresh');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.withCredentials).toBe(true);

    req.flush({ user: testUser });

    expect(result).toEqual(testUser);
    expect(service.user()).toEqual(testUser);
  });

  it('limpia el usuario al cerrar sesión correctamente', () => {
    service.user.set(testUser);

    service.logout().subscribe();

    const req = httpMock.expectOne('api/auth/logout');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.withCredentials).toBe(true);

    req.flush(null);

    expect(service.user()).toBeNull();
  });

  it('limpia el usuario y propaga el error si falla el cierre de sesión', () => {
    service.user.set(testUser);
    let receivedError: unknown;

    service.logout().subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    const req = httpMock.expectOne('api/auth/logout');
    req.flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(service.user()).toBeNull();
    expect(receivedError).toBeTruthy();
  });
});
