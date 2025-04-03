import React from 'react'

function Button({
    children,
    type = 'button',
    bgColor = '',
    textColor = '',
    className = '',
    ...props
}) {
    return (
        /* From Uiverse.io by dorian_8749 */
        <button
            type={type}
            className={`relative h-12 px-8 rounded-lg overflow-hidden transition-all duration-500 group ${bgColor} ${textColor} ${className}`}
            {...props}
        >
            <div
                className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]"
            >
                <div className="absolute inset-0 bg-[#170928] rounded-lg opacity-90"></div>
            </div>
            <div className="absolute inset-[2px] bg-[#170928] rounded-lg opacity-95"></div>
            <div
                className="absolute inset-[2px] bg-gradient-to-r from-[#170928] via-[#1d0d33] to-[#170928] rounded-lg opacity-90"
            ></div>
            <div
                className="absolute inset-[2px] bg-gradient-to-b from-[#654358]/40 via-[#1d0d33] to-[#2F0D64]/30 rounded-lg opacity-80"
            ></div>
            <div
                className="absolute inset-[2px] bg-gradient-to-br from-[#C787F6]/10 via-[#1d0d33] to-[#2A1736]/50 rounded-lg"
            ></div>
            <div
                className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(199,135,246,0.15)] rounded-lg"
            ></div>
            <div className="relative flex items-center justify-center gap-2">
                <span
                    className="text-lg font-normal bg-gradient-to-b from-[#D69DDE] to-[#B873F8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(199,135,246,0.4)] tracking-tighter"
                >
                    {children}
                </span>
            </div>
            <div
                className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"
            ></div>
        </button>
    )
}

export default Button;