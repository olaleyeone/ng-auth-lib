import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { UserIdentifierControllerService } from 'auth-api-sdk';
import { Observable, of, throwError } from 'rxjs';
import { UniqueIdentifierValidator } from './unique-identifier-validator';

describe('UniqueIdentifier', () => {

  let validatorFactory: UniqueIdentifierValidator;
  let userIdentifierControllerService: UserIdentifierControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    userIdentifierControllerService = TestBed.inject(UserIdentifierControllerService);
    validatorFactory = TestBed.inject(UniqueIdentifierValidator);
  });

  it('should create an instance', () => {
    expect(validatorFactory).toBeTruthy();
  });

  it('should return valid for no value', (done) => {
    const validator = validatorFactory.uniqueEmail();
    expect(validator).toBeTruthy();
    const response = validator({ value: '' } as AbstractControl);
    expect(response).toBeInstanceOf(Observable);
    (<Observable<any>>response).subscribe(val => {
      expect(val).toEqual(null);
      done();
    });
  });

  it('should return invalid for existing email', (done) => {
    spyOn(userIdentifierControllerService, 'checkEmailExistence').and.returnValue(of(new HttpResponse()));
    const validator = validatorFactory.uniqueEmail();
    expect(validator).toBeTruthy();
    const response = validator({ value: 'olaleyeone@gmail.com' } as AbstractControl);
    expect(response).toBeInstanceOf(Observable);
    (<Observable<any>>response).subscribe(val => {
      expect(val).toEqual({ existingEmail: true });
      done();
    });
  });

  it('should return valid for email not found', (done) => {
    spyOn(userIdentifierControllerService, 'checkEmailExistence').and.returnValue(throwError(new HttpErrorResponse({
      status: 404
    })));
    const validator = validatorFactory.uniqueEmail();
    expect(validator).toBeTruthy();
    const response = validator({ value: 'olaleyeone@gmail.com' } as AbstractControl);
    expect(response).toBeInstanceOf(Observable);
    (<Observable<any>>response).subscribe(val => {
      expect(val).toEqual(null);
      done();
    });
  });

  it('should return invalid for error status != 404', (done) => {
    spyOn(userIdentifierControllerService, 'checkEmailExistence').and.returnValue(throwError(new HttpErrorResponse({
      status: 400
    })));
    const validator = validatorFactory.uniqueEmail('customError');
    expect(validator).toBeTruthy();
    const response = validator({ value: 'olaleyeone@gmail.com' } as AbstractControl);
    expect(response).toBeInstanceOf(Observable);
    (<Observable<any>>response).subscribe(val => {
      expect(val).toEqual({ customError: true });
      done();
    });
  });
});
