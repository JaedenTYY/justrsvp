'use server'

import { revalidatePath } from 'next/cache'
import pool from '@/lib/database/database'
import { User, IUser } from '@/lib/database/models/user.model'
import { Event } from '@/lib/database/models/event.model'
import { Order } from '@/lib/database/models/order.model'
import { handleError } from '@/lib/utils'

import { CreateUserParams, UpdateUserParams } from '@/types'

export async function createUser(user: CreateUserParams): Promise<IUser | null> {
  try {
    const newUser = await User.create(user);
    return newUser;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getUserById(userId: string): Promise<IUser | null> {
  try {
    const user = await User.findById(parseInt(userId, 10));
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams): Promise<IUser | null> {
  try {
    const updatedUser = await User.updateByClerkId(clerkId, user);
    if (!updatedUser) throw new Error('User update failed');
    return updatedUser;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function deleteUser(clerkId: string): Promise<IUser | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find user to delete
    const userToDelete = await User.findByClerkId(clerkId);
    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' table to remove references to the user
      Event.removeOrganizer(userToDelete.id),

      // Update the 'orders' table to remove references to the user
      Order.removeBuyer(userToDelete.id),
    ]);

    // Delete user
    const deletedUser = await User.delete(userToDelete.id);

    await client.query('COMMIT');
    revalidatePath('/');

    return deletedUser;
  } catch (error) {
    await client.query('ROLLBACK');
    handleError(error);
    return null;
  } finally {
    client.release();
  }
}