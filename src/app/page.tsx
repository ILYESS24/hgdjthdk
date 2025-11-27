import { ShaderAnimation } from "@/components/shader-lines"

export default function Home() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <ShaderAnimation />
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-white text-2xl font-bold">
          Shader Lines Animation
        </h1>
        <p className="text-gray-300 text-sm mt-2">
          Animated WebGL shader using Three.js
        </p>
      </div>
    </div>
  );
}
