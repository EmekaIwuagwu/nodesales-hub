import { NextResponse } from "next/server";

const partners = [
    {
        id: "GRID-01",
        name: "Lumina Energy",
        category: "Infrastructure",
        description: "Primary solar-mesh and quantum-buffer operator for Sectors 1-9.",
        logo: "Zap",
        status: "Strategic",
        link: "/partners/lumina"
    },
    {
        id: "FLEET-02",
        name: "Aetheria Transport",
        category: "Mobility",
        description: "Autonomous shuttle fleet and high-velocity transit protocol provider.",
        logo: "Car",
        status: "Operational",
        link: "/partners/aetheria"
    },
    {
        id: "VAULT-03",
        name: "Kortana Ledger",
        category: "Finance",
        description: "Official settlement layer and DNR liquidity provider for the metropolis.",
        logo: "ShieldCheck",
        status: "Core",
        link: "/partners/kortana"
    }
];

export async function GET() {
    return NextResponse.json({ partners });
}
