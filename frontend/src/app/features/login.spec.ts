import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginComponent } from './login';
import { AuthService, AuthUser } from '../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let response: Subject<AuthUser>;
  let login: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    response = new Subject<AuthUser>();
    login = vi.fn(() => response.asObservable());
    navigate = vi.fn(() => Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: { login } },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('disables submission and shows errors for required fields', () => {
    const page = fixture.nativeElement as HTMLElement;
    const button = page.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    expect(button?.disabled).toBe(true);

    component.form.markAllAsTouched();
    fixture.detectChanges();

    expect(page.textContent).toContain('El email es obligatorio.');
    expect(page.textContent).toContain('La contraseña es obligatoria.');

    component.submit();
    expect(login).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', () => {
    component.form.setValue({
      email: 'invalid-email',
      password: 'password',
    });
    component.form.controls.email.markAsTouched();
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Introduce un email válido.');

    component.submit();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits once, shows pending state and navigates on success', () => {
    component.form.setValue({
      email: 'admin@example.com',
      password: 'admin123',
    });

    component.submit();
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const button = page.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    expect(login).toHaveBeenCalledWith('admin@example.com', 'admin123');
    expect(button?.disabled).toBe(true);
    expect(button?.textContent).toContain('Entrando...');

    component.submit();
    expect(login).toHaveBeenCalledOnce();

    response.next({
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    });
    response.complete();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(['/home']);
    expect(component.isSubmitting()).toBe(false);
  });

  it('shows a generic error and permits retry after failure', () => {
    component.form.setValue({
      email: 'admin@example.com',
      password: 'admin123',
    });

    component.submit();
    response.error({
      code: 'SERVER_ERROR',
      httpStatus: 500,
      userMessage: 'Error del servidor.',
    });
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent)
      .toContain('No se ha podido iniciar sesión. Inténtalo de nuevo.');
    expect(component.isSubmitting()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
