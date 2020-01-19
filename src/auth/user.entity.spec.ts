import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User entity', () => {
  let user: User;
  const mockPassword = 'testPassword';
  const mockSalt = 'testSalt';

  beforeEach(() => {
    user = new User();
    user.salt = mockSalt;
    user.password = mockPassword;

    bcrypt.hash = jest.fn();
  });

  describe('validatePassword', () => {
    it('Returns true as password is valid', async () => {
      bcrypt.hash.mockReturnValue(mockPassword);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword(mockPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, mockSalt);
      expect(result).toEqual(true);
    });

    it('Returns false as password is invalid', async () => {
      const invalidPassword = 'invalidPassword';

      bcrypt.hash.mockReturnValue(invalidPassword);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword(invalidPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(invalidPassword, mockSalt);
      expect(result).toEqual(false);
    });
  });
});
