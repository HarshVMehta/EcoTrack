import { syncUser } from '../user';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '../prisma';

jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn()
}));

jest.mock('../prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn()
    }
  }
}));

describe('syncUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return null and log error if no user is logged in', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (currentUser as jest.Mock).mockResolvedValueOnce(null);

    const result = await syncUser();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('syncUser called but no user is authenticated via Clerk');
    consoleErrorSpy.mockRestore();
  });

  test('should upsert user with full name and email successfully', async () => {
    const mockClerkUser = {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john.doe@example.com' }]
    };
    (currentUser as jest.Mock).mockResolvedValueOnce(mockClerkUser);
    
    const mockDbUser = {
      id: 'user_123',
      email: 'john.doe@example.com',
      name: 'John Doe'
    };
    (prisma.user.upsert as jest.Mock).mockResolvedValueOnce(mockDbUser);

    const result = await syncUser();

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      update: {
        email: 'john.doe@example.com',
        name: 'John Doe'
      },
      create: {
        id: 'user_123',
        email: 'john.doe@example.com',
        name: 'John Doe'
      }
    });
    expect(result).toEqual(mockDbUser);
  });

  test('should use fallback name if name is empty and default email', async () => {
    const mockClerkUser = {
      id: 'user_456',
      firstName: null,
      lastName: null,
      emailAddresses: []
    };
    (currentUser as jest.Mock).mockResolvedValueOnce(mockClerkUser);

    const mockDbUser = {
      id: 'user_456',
      email: '',
      name: 'EcoTrack User'
    };
    (prisma.user.upsert as jest.Mock).mockResolvedValueOnce(mockDbUser);

    const result = await syncUser();

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: 'user_456' },
      update: {
        email: '',
        name: 'EcoTrack User'
      },
      create: {
        id: 'user_456',
        email: '',
        name: 'EcoTrack User'
      }
    });
    expect(result).toEqual(mockDbUser);
  });

  test('should propagate dynamic server usage error', async () => {
    const dynamicError = new Error('Dynamic server usage');
    (currentUser as jest.Mock).mockRejectedValueOnce(dynamicError);

    await expect(syncUser()).rejects.toThrow('Dynamic server usage');
  });

  test('should return null if other database error is thrown', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockClerkUser = {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }]
    };
    (currentUser as jest.Mock).mockResolvedValueOnce(mockClerkUser);
    (prisma.user.upsert as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

    const result = await syncUser();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
