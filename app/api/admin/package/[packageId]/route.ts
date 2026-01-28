import { getServerSession } from '@/app/lib/firebase/server-auth';
import { packageService } from '@/app/lib/services/package-service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET — single package group
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ packageId: string }> }) {
  const session = await getServerSession();

  if (!session || !['admin', 'customer'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { packageId } = await context.params;

    const pkg = await packageService.getPackageGroupById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Package group not found' }, { status: 404 });
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    console.error('GET package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH — add or update a package inside a group
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ packageId: string }> }) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { packageId: groupId } = await context.params;
    const { packageId, packageData, addNew } = await req.json();

    const packageGroup = await packageService.getPackageGroupById(groupId);
    if (!packageGroup) {
      return NextResponse.json({ error: 'Package group not found' }, { status: 404 });
    }

    const updatedPackages = addNew
      ? [...packageGroup.packages, packageData]
      : packageGroup.packages.map((pkg) =>
          pkg.id === packageId
            ? { ...pkg, ...packageData, updatedAt: new Date().toISOString() }
            : pkg
        );

    const updatedGroup = await packageService.updatePackageGroup(groupId, {
      packages: updatedPackages,
    });

    return NextResponse.json({ package: updatedGroup });
  } catch (error) {
    console.error('PATCH package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE — remove a package from a group
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ packageId: string }> }
) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { packageId: groupId } = await context.params;
    const { packageId } = await req.json();

    const packageGroup = await packageService.getPackageGroupById(groupId);
    if (!packageGroup) {
      return NextResponse.json({ error: 'Package group not found' }, { status: 404 });
    }

    const updatedPackages = packageGroup.packages.filter((pkg) => pkg.id !== packageId);

    if (updatedPackages.length === 0) {
      await packageService.deletePackageGroup(groupId);
      return NextResponse.json({ deletedGroup: true });
    }

    const updatedGroup = await packageService.updatePackageGroup(groupId, {
      packages: updatedPackages,
    });

    return NextResponse.json({
      deletedGroup: false,
      package: updatedGroup,
    });
  } catch (error) {
    console.error('DELETE package error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
