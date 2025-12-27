/**
 * KPI Targets API - CRUD operations for database-backed targets
 * 
 * GET    /api/kpi-targets?kraId=X&kpiId=Y&year=Z&quarter=Q - Fetch targets
 * POST   /api/kpi-targets - Create/update target (ADMIN + FACULTY only)
 * DELETE /api/kpi-targets/:id - Delete target (ADMIN only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';
import { hasRole } from '@/lib/utils/rbac';
import { UserRole } from '@prisma/client';

/**
 * GET /api/kpi-targets
 * Query params: kraId, kpiId (initiative_id), year, quarter
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;
    
    const { searchParams } = new URL(request.url);
    const kraId = searchParams.get('kraId');
    const kpiId = searchParams.get('kpiId');
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');
    
    // Build where clause
    const where: any = {};
    if (kraId) where.kra_id = kraId;
    if (kpiId) where.initiative_id = kpiId;
    if (year) where.year = parseInt(year);
    if (quarter) where.quarter = parseInt(quarter);
    
    const targets = await prisma.kPITarget.findMany({
      where,
      orderBy: [
        { year: 'asc' },
        { quarter: 'asc' }
      ]
    });
    
    return NextResponse.json({
      success: true,
      targets: targets.map(t => ({
        id: t.id,
        kra_id: t.kra_id,
        initiative_id: t.initiative_id,
        year: t.year,
        quarter: t.quarter,
        target_value: t.target_value.toNumber(),
        target_type: t.target_type,
        description: t.description,
        created_at: t.created_at,
        updated_at: t.updated_at
      }))
    });
    
  } catch (error: any) {
    console.error('[KPI Targets GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch targets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kpi-targets - Upsert target (ADMIN + FACULTY only)
 * Body: { kra_id, initiative_id, year, quarter?, target_value, target_type, description? }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;
    const { user } = authResult;
    
    // Check permissions: ADMIN or FACULTY only
    if (!hasRole(user.role, UserRole.FACULTY)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. ADMIN/FACULTY required.' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { kra_id, initiative_id, year, quarter, target_value, target_type, description } = body;
    
    // Validate required fields
    if (!kra_id || !initiative_id || !year || target_value === undefined || !target_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: kra_id, initiative_id, year, target_value, target_type' },
        { status: 400 }
      );
    }
    
    // Validate target_type
    const validTypes = ['COUNT', 'SNAPSHOT', 'RATE', 'PERCENTAGE', 'MILESTONE', 'FINANCIAL', 'TEXT_CONDITION'];
    if (!validTypes.includes(target_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid target_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Upsert target (create or update if exists)
    const parsedQuarter = quarter ? parseInt(quarter) : null;
    
    // Check if target exists
    const existingTarget = await prisma.kPITarget.findFirst({
      where: {
        kra_id,
        initiative_id,
        year: parseInt(year),
        quarter: parsedQuarter
      }
    });
    
    let target;
    if (existingTarget) {
      // Update existing target
      target = await prisma.kPITarget.update({
        where: { id: existingTarget.id },
        data: {
          target_value,
          target_type,
          description,
          updated_by: user.id
        }
      });
    } else {
      // Create new target
      target = await prisma.kPITarget.create({
        data: {
          kra_id,
          initiative_id,
          year: parseInt(year),
          quarter: parsedQuarter,
          target_value,
          target_type,
          description,
          created_by: user.id,
          updated_by: user.id
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      target: {
        id: target.id,
        kra_id: target.kra_id,
        initiative_id: target.initiative_id,
        year: target.year,
        quarter: target.quarter,
        target_value: target.target_value.toNumber(),
        target_type: target.target_type,
        description: target.description,
        updated_at: target.updated_at
      }
    });
    
  } catch (error: any) {
    console.error('[KPI Targets POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save target' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kpi-targets - Delete target (ADMIN only)
 * Query params: kra_id, initiative_id, year, quarter
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;
    const { user } = authResult;
    
    // Check permissions: ADMIN only
    if (!hasRole(user.role, UserRole.ADMIN)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. ADMIN required.' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const kra_id = searchParams.get('kra_id');
    const initiative_id = searchParams.get('initiative_id');
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');
    
    if (!kra_id || !initiative_id || !year) {
      return NextResponse.json(
        { success: false, error: 'Missing required query params: kra_id, initiative_id, year' },
        { status: 400 }
      );
    }
    
    const targetToDelete = await prisma.kPITarget.findFirst({
      where: {
        kra_id,
        initiative_id,
        year: parseInt(year),
        quarter: quarter ? parseInt(quarter) : null
      }
    });
    
    if (!targetToDelete) {
      return NextResponse.json(
        { success: false, error: 'Target not found' },
        { status: 404 }
      );
    }
    
    await prisma.kPITarget.delete({
      where: { id: targetToDelete.id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Target deleted successfully'
    });
    
  } catch (error: any) {
    console.error('[KPI Targets DELETE] Error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Target not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete target' },
      { status: 500 }
    );
  }
}
