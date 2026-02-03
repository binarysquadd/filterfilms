import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/app/lib/google-drive.server', () => ({
  driveService: {
    getCollection: vi.fn(async () => []),
    saveCollection: vi.fn(async () => undefined),
  },
}));

import { userService } from '@/app/lib/services/user-service.server';
import { driveService } from '@/app/lib/google-drive.server';

const baseUser = {
  id: '1',
  email: 'user@example.com',
  role: 'customer',
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

describe('userService', () => {
  beforeEach(() => {
    vi.mocked(driveService.getCollection).mockResolvedValue([]);
    vi.mocked(driveService.saveCollection).mockResolvedValue(undefined);
  });

  it('createUser returns existing user if email matches', async () => {
    vi.mocked(driveService.getCollection).mockResolvedValueOnce([baseUser]);

    const user = await userService.createUser({ email: 'USER@example.com' });
    expect(user).toEqual(baseUser);
    expect(driveService.saveCollection).not.toHaveBeenCalled();
  });

  it('createUser creates new user and saves', async () => {
    const user = await userService.createUser({ email: 'new@example.com' });
    expect(user.email).toBe('new@example.com');
    expect(driveService.saveCollection).toHaveBeenCalled();
  });

  it('updateUser returns null when not found', async () => {
    const res = await userService.updateUser('missing', { name: 'x' } as never);
    expect(res).toBeNull();
  });

  it('updateUserRole initializes profiles for team/customer', async () => {
    vi.mocked(driveService.getCollection)
      .mockResolvedValueOnce([{ ...baseUser, id: '2', role: 'customer' }])
      .mockResolvedValueOnce([{ ...baseUser, id: '2', role: 'customer' }]);
    vi.mocked(driveService.saveCollection).mockResolvedValue(undefined);

    const updated = await userService.updateUserRole('2', 'team');
    expect(updated).not.toBeNull();
    expect(driveService.saveCollection).toHaveBeenCalled();
  });

  it('verifyEmail sets verified timestamp', async () => {
    vi.mocked(driveService.getCollection).mockResolvedValueOnce([
      { ...baseUser, id: '3', role: 'customer' },
    ]);

    const updated = await userService.verifyEmail('user@example.com');
    expect(updated?.emailVerified).toBeTruthy();
    expect(driveService.saveCollection).toHaveBeenCalled();
  });
});
