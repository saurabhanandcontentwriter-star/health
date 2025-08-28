import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={className} aria-label="Bihar Health Connect Logo">
        <svg
            className="h-full w-auto"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logoAiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#14b8a6' }} /> {/* tailwind teal-500 */}
                    <stop offset="100%" style={{ stopColor: '#3b82f6' }} /> {/* tailwind blue-500 */}
                </linearGradient>
                <path id="textCircle" d="M 15, 50 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
            </defs>
            
            <circle cx="50" cy="50" r="48" fill="none" stroke="#F5B82E" strokeWidth="3" />

            <circle cx="50" cy="50" r="42" fill="url(#logoAiGradient)" />
            
            {/* AI Bot and Medical Symbol */}
            <g transform="translate(26, 24) scale(2.2)">
                <path 
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    fill="white"
                />
                <path
                    d="M11 7 H 13 V 11 H 17 V 13 H 13 V 17 H 11 V 13 H 7 V 11 H 11 V 7 Z"
                    fill="#14b8a6" // tailwind teal-500
                />
            </g>

            <text fill="white" fontSize="9" fontWeight="bold" letterSpacing="0.5">
                <textPath href="#textCircle" startOffset="50%" textAnchor="middle">
                  BIHAR HEALTH CONNECT
                </textPath>
            </text>
        </svg>
    </div>
);

export default Logo;
