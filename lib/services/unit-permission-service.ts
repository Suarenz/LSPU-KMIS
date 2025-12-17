import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type PermissionLevel = 'READ' | 'WRITE' | 'ADMIN';

class UnitPermissionService {
  /**
   * Check if user has permission to access a unit
   */
  async checkUnitAccess(
    userId: string,
    unitId: string,
    requiredPermission: PermissionLevel = 'READ'
  ): Promise<boolean> {
    try {
      // First, try to find the user by the provided userId (which should be the database ID)
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // In the new system, we only use the database ID
      // If not found by database ID, we return false
      if (!user) {
        return false;
      }

      // Admins have access to all units
      if (user.role === 'ADMIN') {
        return true;
      }

      // Check if user is assigned to the specific unit
      if (user.unitId === unitId) {
        return true;
      }

      // Check if user has explicit permissions for this unit using raw query since Prisma client is outdated
      const unitPermission = await prisma.$queryRaw<Array<{ permission: string }>>(
        Prisma.sql`SELECT permission FROM unit_permissions WHERE unit_id = ${unitId} AND user_id = ${user.id}`
      );

      // Map permission level based on required permission
      if (unitPermission.length > 0) {
        const permission = unitPermission[0].permission as PermissionLevel;
        const permissionOrder = { 'READ': 1, 'WRITE': 2, 'ADMIN': 3 };
        return permissionOrder[permission as keyof typeof permissionOrder] >= permissionOrder[requiredPermission];
      }

      return false;
    } catch (error) {
      console.error('Error checking unit access:', error);
      return false;
    }
  }

  /**
   * Grant unit permission to a user
   */
  async grantUnitPermission(
    requesterId: string,
    unitId: string,
    targetUserId: string,
    permission: PermissionLevel
  ): Promise<boolean> {
    try {
      // First, verify requester has permission to grant permissions
      const requester = await prisma.user.findUnique({
        where: { id: requesterId },
      });

      if (!requester || requester.role !== 'ADMIN') {
        return false; // Only admins can grant unit permissions
      }

      // For target user, only check database ID
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      // In the new system, we only use the database ID
      // If not found by database ID, we return false
      if (!targetUser) {
        return false; // Target user doesn't exist
      }

      // Create or update the unit permission using raw query
      await prisma.$executeRaw`INSERT INTO unit_permissions (id, unit_id, user_id, permission, created_at, updated_at) VALUES (gen_random_uuid(), ${unitId}, ${targetUser.id}, ${permission}, NOW(), NOW()) ON CONFLICT (unit_id, user_id) DO UPDATE SET permission = ${permission}, updated_at = NOW()`;

      return true;
    } catch (error) {
      console.error('Error granting unit permission:', error);
      return false;
    }
  }

  /**
   * Revoke unit permission from a user
   */
  async revokeUnitPermission(
    requesterId: string,
    unitId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      // First, verify requester has permission to revoke permissions
      const requester = await prisma.user.findUnique({
        where: { id: requesterId },
      });

      if (!requester || requester.role !== 'ADMIN') {
        return false; // Only admins can revoke unit permissions
      }

      // For target user, only check database ID
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      // In the new system, we only use the database ID
      // If not found by database ID, we return false
      if (!targetUser) {
        return false; // Target user doesn't exist
      }

      // Delete the unit permission using raw query
      await prisma.$executeRaw`DELETE FROM unit_permissions WHERE unit_id = ${unitId} AND user_id = ${targetUser.id}`;

      return true;
    } catch (error) {
      console.error('Error revoking unit permission:', error);
      return false;
    }
  }

  /**
   * Get user's unit permissions
   */
  async getUserUnitPermissions(
    userId: string,
    unitId: string
  ): Promise<PermissionLevel | null> {
    try {
      // First, try to find the user by the provided userId (which might be the database ID)
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // In the new system, we only use the database ID
      // If not found by database ID, we return null
      if (!user) {
        return null;
      }

      // Admins have admin access to all units
      if (user.role === 'ADMIN') {
        return 'ADMIN';
      }

      // Check if user is assigned to the specific unit
      if (user.unitId === unitId) {
        // Determine permission level based on user role
        if (user.role === 'FACULTY') return 'WRITE';
        return 'READ';
      }

      // Check if user has explicit permissions for this unit using raw query
      const unitPermission = await prisma.$queryRaw<Array<{ permission: string }>>(
        Prisma.sql`SELECT permission FROM unit_permissions WHERE unit_id = ${unitId} AND user_id = ${user.id}`
      );

      return unitPermission.length > 0 ? unitPermission[0].permission as PermissionLevel : null;
    } catch (error) {
      console.error('Error getting user unit permissions:', error);
      return null;
    }
  }

  /**
   * Get all units a user has access to
   */
  async getUserUnits(
    userId: string
  ): Promise<{ unitId: string; permission: PermissionLevel }[]> {
    try {
      // First, try to find the user by the provided userId (which might be the database ID)
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // In the new system, we only use the database ID
      // If not found by database ID, we return an empty array
      if (!user) {
        return [];
      }

      // Admins have access to all units
      if (user.role === 'ADMIN') {
        // Using raw query for units table since Prisma client is outdated
        const allUnits = await prisma.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`SELECT id FROM units`
        );
        return allUnits.map(unit => ({
          unitId: unit.id,
          permission: 'ADMIN' as PermissionLevel
        }));
      }

      // Get user's assigned unit if any
      const userUnits: { unitId: string; permission: PermissionLevel }[] = [];
      if (user.unitId) {
        // Determine permission level based on user role
        let permission: PermissionLevel = 'READ';
        if (user.role === 'FACULTY') permission = 'WRITE';
        userUnits.push({ unitId: user.unitId, permission });
      }

      // Get units where user has explicit permissions using raw query
      const explicitPermissions = await prisma.$queryRaw<Array<{ unit_id: string; permission: string }>>(
        Prisma.sql`SELECT unit_id, permission FROM unit_permissions WHERE user_id = ${user.id}`
      );

      explicitPermissions.forEach(permission => {
        // Add to user units if not already added
        const existingUnitIndex = userUnits.findIndex(u => u.unitId === permission.unit_id);
        if (existingUnitIndex === -1) {
          userUnits.push({
            unitId: permission.unit_id,
            permission: permission.permission as PermissionLevel
          });
        } else {
          // If user has multiple permissions to the same unit, use the higher one
          const permissionOrder = { 'READ': 1, 'WRITE': 2, 'ADMIN': 3 };
          if (permissionOrder[permission.permission as keyof typeof permissionOrder] > permissionOrder[userUnits[existingUnitIndex].permission]) {
            userUnits[existingUnitIndex].permission = permission.permission as PermissionLevel;
          }
        }
      });

      return userUnits;
    } catch (error) {
      console.error('Error getting user units:', error);
      return [];
    }
  }
}

export default new UnitPermissionService();