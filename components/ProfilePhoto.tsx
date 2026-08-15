"use client";

import { useState } from "react";

type ProfilePhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizes = { sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-lg", lg: "h-20 w-20 text-2xl" };

export default function ProfilePhoto({ name, photoUrl, size = "md" }: ProfilePhotoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (!photoUrl || imageFailed) {
    return <div aria-label={`${name}'s profile photo`} className={`${sizes[size]} shrink-0 rounded-2xl bg-[var(--color-teal)] text-white grid place-items-center font-display font-bold shadow-sm`}>{initial}</div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoUrl} alt={`${name}'s profile photo`} onError={() => setImageFailed(true)} className={`${sizes[size]} shrink-0 rounded-2xl object-cover border-2 border-white shadow-sm`} />
  );
}
