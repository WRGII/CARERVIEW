import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, signOut, getCurrentUser } from './auth';

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: (...args: any[]) => {
        mockSelect(...args);
        return {
          eq: (...eqArgs: any[]) => {
            mockEq(...eqArgs);
            return { single: () => mockSingle() };
          },
        };
      },
    }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signUp', () => {
  it('calls supabase.auth.signUp with correct params', async () => {
    const fakeData = { user: { id: '1' }, session: {} };
    mockSignUp.mockResolvedValue({ data: fakeData, error: null });

    const result = await signUp('a@b.com', 'pass1234', 'Alice');

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass1234',
      options: { data: { display_name: 'Alice', role: 'caregiver' } },
    });
    expect(result).toEqual(fakeData);
  });

  it('accepts a custom role', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null });

    await signUp('a@b.com', 'pass1234', 'Bob', 'admin');

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { data: { display_name: 'Bob', role: 'admin' } },
      }),
    );
  });

  it('throws on auth error', async () => {
    mockSignUp.mockResolvedValue({ data: null, error: new Error('Email taken') });

    await expect(signUp('a@b.com', 'pass', 'Alice')).rejects.toThrow('Email taken');
  });
});

describe('signIn', () => {
  it('calls signInWithPassword and returns data', async () => {
    const session = { access_token: 'tok' };
    mockSignInWithPassword.mockResolvedValue({ data: session, error: null });

    const result = await signIn('a@b.com', 'pass1234');

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass1234',
    });
    expect(result).toEqual(session);
  });

  it('throws on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Invalid login credentials'),
    });

    await expect(signIn('a@b.com', 'wrong')).rejects.toThrow('Invalid login credentials');
  });
});

describe('signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await signOut();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('throws on error', async () => {
    mockSignOut.mockResolvedValue({ error: new Error('Network error') });

    await expect(signOut()).rejects.toThrow('Network error');
  });
});

describe('getCurrentUser', () => {
  it('returns null when no user is signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it('returns user with profile when both exist', async () => {
    const user = { id: 'u1', email: 'a@b.com' };
    const profile = { id: 'u1', role: 'caregiver', display_name: 'Alice' };
    mockGetUser.mockResolvedValue({ data: { user } });
    mockSingle.mockResolvedValue({ data: profile, error: null });

    const result = await getCurrentUser();

    expect(result).toEqual({ ...user, profile });
    expect(mockEq).toHaveBeenCalledWith('id', 'u1');
  });

  it('returns user without profile on profile fetch error', async () => {
    const user = { id: 'u2', email: 'b@c.com' };
    mockGetUser.mockResolvedValue({ data: { user } });
    mockSingle.mockResolvedValue({ data: null, error: new Error('Not found') });

    const result = await getCurrentUser();

    expect(result).toEqual(user);
  });
});
