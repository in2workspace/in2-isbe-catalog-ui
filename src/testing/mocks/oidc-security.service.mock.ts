import { of } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

export const oidcSecurityServiceMock = {
  checkAuth: jest.fn(() => of({ isAuthenticated: false, accessToken: '', userData: {} })),
  authorize: jest.fn(),
  logoffAndRevokeTokens: jest.fn(),
  getAccessToken: jest.fn(() => of('')),
};


export const authServiceMock: Partial<AuthService> = {
  isAuthenticated$: of(false),
  user$: of(null),
  accessToken$: of(''),
  loginInfo$: of(null),
  sellerId$: of(''),
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(() => of(false)),
  getAccessToken: jest.fn(() => Promise.resolve('')),
};