import { useState } from "react";

// Real photos go in the folder public/crew/
// If a photo is missing, the drawn face is shown instead.
// If your photos are PNG files, change .jpg to .png below.
const PHOTOS = {
  commander: "/crew/commander.jpg",
  engineer: "/crew/engineer.jpg",
  medical: "/crew/medical.jpg",
  geologist: "/crew/geologist.jpg",
  lifesupport: "/crew/lifesupport.jpg",
  pilot: "/crew/pilot.jpg",
};

const FACES = {
  commander: { skin: "#c68a5e", hair: "#1d1410", style: "long", accent: "#e77845" },
  engineer: { skin: "#8d5a3b", hair: "#15100d", style: "buzz", beard: "full", accent: "#56c5ed" },
  medical: { skin: "#6b4429", hair: "#120d0a", style: "curly", accent: "#5bd58b" },
  geologist: { skin: "#e8bf9a", hair: "#16120f", style: "fringe", accent: "#e9a34c" },
  lifesupport: { skin: "#f1c8a5", hair: "#8a3d20", style: "bun", accent: "#4cc9a0" },
  pilot: { skin: "#c99a6b", hair: "#1c1511", style: "short", beard: "stubble", accent: "#b48cf2" },
};

function CrewAvatar({ id, name }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  // Show the real photo if it exists, otherwise fall back to the drawn face
  if (PHOTOS[id] && !photoFailed) {
    return (
      <img src={PHOTOS[id]} alt={name} onError={() => setPhotoFailed(true)} />
    );
  }

  const { skin, hair, style, beard, accent } = FACES[id] || FACES.commander;
  const gradientId = `avatar-bg-${id}`;

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={name}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0.55" />
          <stop offset="1" stopColor="#10151b" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#${gradientId})`} />

      {/* Long hair behind the head */}
      {style === "long" && (
        <path
          d="M27 48 C25 22 38 16 50 16 C62 16 75 22 73 48 L75 76 Q64 74 62 60 L38 60 Q36 74 25 76 Z"
          fill={hair}
        />
      )}

      {/* Spacesuit */}
      <path d="M14 100 Q14 79 50 76 Q86 79 86 100 Z" fill="#dfe5ec" />
      <path d="M32 100 L35 83 Q50 88 65 83 L68 100 Z" fill={accent} opacity="0.9" />
      <circle cx="26" cy="91" r="4" fill={accent} />

      {/* Neck and collar */}
      <rect x="43" y="60" width="14" height="19" rx="5" fill={skin} />
      <rect x="43" y="60" width="14" height="6" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="50" cy="77" rx="17" ry="5.5" fill="#c3cbd6" stroke="#a9b2be" strokeWidth="1" />

      {/* Ears and head */}
      <ellipse cx="31" cy="48" rx="3" ry="5" fill={skin} />
      <ellipse cx="69" cy="48" rx="3" ry="5" fill={skin} />
      <ellipse cx="50" cy="46" rx="19" ry="22" fill={skin} />

      {/* Beard */}
      {beard && (
        <path
          d="M31 50 Q32 72 50 73 Q68 72 69 50 Q64 61 50 61 Q36 61 31 50 Z"
          fill={hair}
          opacity={beard === "stubble" ? 0.35 : 1}
        />
      )}

      {/* Face */}
      <circle cx="42" cy="46" r="2.2" fill="#1b1b1b" />
      <circle cx="58" cy="46" r="2.2" fill="#1b1b1b" />
      <path d="M37 40 Q42 37 47 40" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M53 40 Q58 37 63 40" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path
        d="M50 47 L48 54 Q50 55.5 52 54"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 59 Q50 64 56 59"
        stroke={beard === "full" ? "#e8a08f" : "#7a3b2e"}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Hair in front */}
      {style === "long" && (
        <path d="M31 42 Q34 23 50 23 Q66 23 69 42 Q60 31 50 31 Q40 31 31 42 Z" fill={hair} />
      )}
      {style === "short" && (
        <path d="M31 42 Q30 21 50 21 Q70 21 69 42 Q62 32 50 32 Q38 32 31 42 Z" fill={hair} />
      )}
      {style === "buzz" && (
        <path d="M32 38 Q32 24 50 24 Q68 24 68 38 Q60 30 50 30 Q40 30 32 38 Z" fill={hair} />
      )}
      {style === "fringe" && (
        <path
          d="M30 44 Q28 20 50 20 Q72 20 70 44 Q66 30 56 30 L44 34 Q36 32 30 44 Z"
          fill={hair}
        />
      )}
      {style === "bun" && (
        <>
          <circle cx="50" cy="15" r="8" fill={hair} />
          <path d="M31 42 Q30 21 50 21 Q70 21 69 42 Q62 31 50 31 Q38 31 31 42 Z" fill={hair} />
        </>
      )}
      {style === "curly" && (
        <>
          <circle cx="34" cy="31" r="8" fill={hair} />
          <circle cx="44" cy="25" r="8" fill={hair} />
          <circle cx="56" cy="25" r="8" fill={hair} />
          <circle cx="66" cy="31" r="8" fill={hair} />
          <circle cx="30" cy="40" r="6" fill={hair} />
          <circle cx="70" cy="40" r="6" fill={hair} />
        </>
      )}

      {/* Helmet ring */}
      <circle cx="50" cy="48" r="33" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
      <path
        d="M24 34 Q30 20 44 16"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default CrewAvatar;