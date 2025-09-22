"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface StarFieldProps {
  className?: string;
  starCount?: number;
  speed?: number; // سرعة حركة النجوم (0.1 - 2.0)
  twinkleSpeed?: number; // سرعة التلألؤ (0.005 - 0.05)
  minSize?: number; // أصغر حجم للنجوم
  maxSize?: number; // أكبر حجم للنجوم
}

const StarField: React.FC<StarFieldProps> = ({
  className = "",
  starCount = 180,
  speed = 10, // السرعة الافتراضية
  twinkleSpeed = 0.012, // سرعة التلألؤ الافتراضية
  minSize = 0.3, // أصغر حجم افتراضي
  maxSize = 2.8, // أكبر حجم افتراضي
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (maxSize - minSize) + minSize, // استخدام الحدود المحددة
          opacity: Math.random() * 0.7 + 0.3, // Opacity between 0.3 and 1
          speed: Math.random() * speed + speed * 0.2, // استخدام السرعة المحددة
          twinkleSpeed: Math.random() * twinkleSpeed + twinkleSpeed * 0.5, // استخدام سرعة التلألؤ المحددة
          twinklePhase: Math.random() * Math.PI * 2, // Random starting phase
        });
      }
    };

    initStars();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Update twinkle phase
        star.twinklePhase += star.twinkleSpeed;

        // Calculate twinkling opacity
        const twinkleOpacity =
          star.opacity * (0.5 + 0.5 * Math.sin(star.twinklePhase));

        // Slow drift movement
        star.x += Math.sin(star.twinklePhase * 0.1) * star.speed;
        star.y += Math.cos(star.twinklePhase * 0.15) * star.speed * 0.5;

        // Wrap around edges
        if (star.x > canvas.width) star.x = 0;
        if (star.x < 0) star.x = canvas.width;
        if (star.y > canvas.height) star.y = 0;
        if (star.y < 0) star.y = canvas.height;

        // Draw star with glow effect
        ctx.save();

        // Create gradient for soft glow effect
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.size * 2.5
        );

        // Different colors for different star sizes with more variety
        let starColor;
        const colorRandom = Math.sin(star.twinklePhase * 0.5);

        if (star.size > 2.2) {
          // Large stars - bright white with slight blue tint
          starColor = `rgba(${255}, ${255}, ${255}, ${twinkleOpacity})`;
        } else if (star.size > 1.8) {
          // Medium-large stars - light blue
          starColor = `rgba(${180 + colorRandom * 20}, ${
            220 + colorRandom * 15
          }, ${255}, ${twinkleOpacity})`;
        } else if (star.size > 1.2) {
          // Medium stars - white with subtle color variations
          starColor = `rgba(${240 + colorRandom * 15}, ${
            245 + colorRandom * 10
          }, ${255}, ${twinkleOpacity})`;
        } else {
          // Small stars - soft blue-white
          starColor = `rgba(${200 + colorRandom * 30}, ${
            220 + colorRandom * 20
          }, ${255}, ${twinkleOpacity})`;
        }

        gradient.addColorStop(0, starColor);
        gradient.addColorStop(
          0.4,
          starColor.replace(/,\s*[\d.]+\)$/, `, ${twinkleOpacity * 0.3})`)
        );
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        // Draw soft glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw bright star center
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starCount, speed, twinkleSpeed, minSize, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};

export default StarField;
