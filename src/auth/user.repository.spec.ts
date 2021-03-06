import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

const mockCredentialsDto = { username: 'TestUsername', password: 'TestPassword' };

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
      ],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it('Throws a conflict exception as username already exists', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(ConflictException);
    });

    it('Throws a internal server exception as unknown status code', () => {
      save.mockRejectedValue({ code: '555555' }); // unhandled error code
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validatePassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'TestUser';
      user.validatePassword = jest.fn();
    });

    it('Returns the username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(result).toEqual('TestUser');
    });

    it('Returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('Returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('TestHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword('TestPassword', 'TestSalt');
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual('TestHash');
    });
  });
});
