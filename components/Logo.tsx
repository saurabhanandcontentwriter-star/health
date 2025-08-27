import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={className} aria-label="Bihar Health Connect Logo">
        <svg
            className="h-full w-auto"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logoGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#65B32E' }} />
                    <stop offset="100%" style={{ stopColor: '#1A5323' }} />
                </linearGradient>
                <path id="textCircle" d="M 15, 50 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
            </defs>
            
            <circle cx="50" cy="50" r="48" fill="none" stroke="#F5B82E" strokeWidth="3" />

            <circle cx="50" cy="50" r="42" fill="url(#logoGreenGradient)" />
            
            <path 
              d="M 50 38 C 40 28, 20 40, 20 58 C 20 80, 50 88, 50 88 C 50 88, 80 80, 80 58 C 80 40, 60 28, 50 38 Z"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            />
            <path
              d="M 18 64 H 38 L 43 54 L 48 70 L 52 58 L 57 66 L 62 64 H 82"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <text fill="white" fontSize="9" fontWeight="bold" letterSpacing="0.5">
                <textPath href="#textCircle" startOffset="50%" textAnchor="middle">
                  BIHAR HEALTH CONNECT
                </textPath>
            </text>
        </svg>
    </div>
);

export default Logo;