import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  daftar,
  daftarStructure,
  structure,
} from "@/backend/drizzle/models/daftar";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq, inArray } from "drizzle-orm";

// Function to generate all permutations of an array
function getPermutations<T>(array: T[]): T[][] {
  if (array.length === 0) return [[]];
  const result: T[][] = [];
  array.forEach((item, index) => {
    const rest = [...array.slice(0, index), ...array.slice(index + 1)];
    getPermutations(rest).forEach((perm) => result.push([item, ...perm]));
  });
  return result;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");

  if (!scoutId)
    return NextResponse.json({ error: "Invalid scoutId" }, { status: 400 });

  try {
    // Get collaborator daftarIds from scouts table
    const collaborators = await db
      .select({ collaboratorId: scouts.daftarId })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId));

    if (!collaborators.length) return NextResponse.json([]);

    const collaboratorIds = collaborators.map((d) => d.collaboratorId);

    // Get structures of all collaborators
    const structures = await db
      .select({
        daftarId: daftarStructure.daftarId,
        structureName: structure.name,
      })
      .from(daftarStructure)
      .innerJoin(structure, eq(daftarStructure.structureId, structure.id))
      .where(inArray(daftarStructure.daftarId, collaboratorIds));

    // Group structures by daftarId
    const structureMap: Record<string, string[]> = {};
    structures.forEach(({ daftarId, structureName }) => {
      if (!structureMap[daftarId || 0]) structureMap[daftarId || 0] = [];
      structureMap[daftarId || 0].push(structureName);
    });

    const results: { permutation: string[]; ratio: number; offer: boolean }[] =
      [];

    // Generate permutations and calculate ratios
    Object.values(structureMap).forEach((structureList) => {
      const permutations = getPermutations(structureList);

      permutations.forEach((perm) => {
        const ratio = perm.length / structureList.length;
        results.push({ permutation: perm, ratio, offer: ratio >= 0.5 });
      });
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching permutations:", error);
    return NextResponse.json([], { status: 500 });
  }
}
