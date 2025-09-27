"use client";

interface LoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loader({
  message = "Loading...",
  size = "md",
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className='fixed inset-0 bg-gradient-to-r from-[#041932] to-[#041322] bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='text-center'>
        <div
          className={`${sizeClasses[size]} border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4`}></div>
        <p
          className='text-white text-lg font-medium'
          style={{
            fontFamily: "'Instrument Sans', Arial, Helvetica, sans-serif",
          }}>
          {message}
        </p>
      </div>
    </div>
  );
}
