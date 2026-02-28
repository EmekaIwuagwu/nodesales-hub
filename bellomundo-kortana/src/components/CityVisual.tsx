"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import { Suspense } from "react";

function CityMesh() {
    return (
        <group>
            {/* Central "Core" of the city */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[0, 0, 0]}>
                    <icosahedronGeometry args={[1, 15]} />
                    <MeshDistortMaterial
                        color="#1A7A8A"
                        speed={2}
                        distort={0.3}
                        radius={1}
                    />
                </mesh>
            </Float>

            {/* Surrounding "Buildings" / Data Points */}
            {Array.from({ length: 50 }).map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10
                    ]}
                >
                    <boxGeometry args={[0.2, Math.random() * 2, 0.2]} />
                    <meshStandardMaterial color="#0A3D62" emissive="#22D3EE" emissiveIntensity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

export default function CityVisual() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <color attach="background" args={["#0B0F1A"]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#22D3EE" />
                <Suspense fallback={null}>
                    <CityMesh />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Suspense>
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
