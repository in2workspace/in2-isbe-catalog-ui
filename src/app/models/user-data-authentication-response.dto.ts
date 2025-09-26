import { LEARCredentialEmployee } from "./lear-credential";

export enum RoleType {
    LEAR = 'LEAR',
    LER = 'LER',
}

export interface UserDataAuthenticationResponse {
  sub: string;
  commonName: string;
  country: string;
  serialNumber: string;
  email_verified: boolean;
  preferred_username: string;
  given_name: string;
  "tenant-id": string;
  emailAddress: string;
  organizationIdentifier: string;
  organization: string;
  name: string;
  family_name: string;
  serial_number?:string;
  email?:string
  role?: RoleType;
  vc?: LEARCredentialEmployee;
}
