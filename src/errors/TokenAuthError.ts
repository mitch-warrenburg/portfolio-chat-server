import { TOKEN_AUTH_ERROR } from '../constants';

export default class TokenAuthError extends Error {
  constructor() {
    super(TOKEN_AUTH_ERROR);
  }
}
