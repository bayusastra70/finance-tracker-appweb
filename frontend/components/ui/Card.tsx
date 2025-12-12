import * as React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "glass";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const variants = {
    default: "bg-zinc-900 border border-zinc-800",
    gradient: "bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800",
    glass: "bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50",
  };

  return (
    <div className={`rounded-xl p-6 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-zinc-400 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-4 flex items-center ${className}`}>
      {children}
    </div>
  );
}
