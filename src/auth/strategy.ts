import {AuthenticationStrategy} from '@loopback/authentication';
import {Request} from '@loopback/rest/dist/types';
import {UserProfile} from '@loopback/security';

export class AuthStrategy implements AuthenticationStrategy {
  name = 'auth';

  constructor(
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    console.log("Ejecutando estartegia")
    return undefined;
  }
}
