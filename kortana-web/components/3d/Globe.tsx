'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

function RotatingGlobe() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group>
            <Sphere ref={meshRef} args={[1, 64, 64]} scale={3.5}>
                <meshStandardMaterial
                    color="#0a0a0f"
                    emissive="#06b6d4"
                    emissiveIntensity={0.15}
                    wireframe
                    transparent
                    opacity={0.4}
                />
            </Sphere>
            <Stars 
                radius={100} 
                depth={50} 
                count={5000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={1} 
            />
        </group>
    );
}

export default function Globe() {
    return (
        <div className="w-full h-[400px] md:h-[600px] lg:h-[700px] relative">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
                <pointLight position={[-10, -10, -10]} intensity={0.8} color="#9d4edd" />
                <RotatingGlobe />
                <OrbitControls 
                    enableZoom={false} 
                    autoRotate 
                    autoRotateSpeed={0.5}
                    enablePan={false}
                />
            </Canvas>
        </div>
    );
}
