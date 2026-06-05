'use client';
export default function Footer() {
  return (
    <footer
      className="relative w-full"
      style={{
        backgroundColor: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        zIndex: 2,
        padding: '48px 0',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <span className="font-display text-xl tracking-[0.15em] text-white">
                STRIDE
              </span>
              <span
                className="ml-0.5 w-2 h-2 rounded-sm"
                style={{ backgroundColor: '#C7FF3D' }}
              />
            </div>
            <span
              className="font-mono text-xs"
              style={{ color: '#6B7280' }}
            >
              &copy; 2025 STRIDE INC.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            {['PRIVACY', 'TERMS', 'CONTACT'].map((link) => (
              <a
                key={link}
                href="#"
                className="font-mono text-xs uppercase tracking-wider transition-colors duration-200 hover:text-white"
                style={{ color: '#6B7280' }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-5">
            {/* Twitter/X */}
            <a
              href="#"
              className="transition-colors duration-200 hover:text-[#C7FF3D]"
              style={{ color: '#6B7280' }}
              aria-label="Twitter"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="#"
              className="transition-colors duration-200 hover:text-[#C7FF3D]"
              style={{ color: '#6B7280' }}
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* Discord */}
            <a
              href="#"
              className="transition-colors duration-200 hover:text-[#C7FF3D]"
              style={{ color: '#6B7280' }}
              aria-label="Discord"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="text-center mt-6">
          <span
            className="font-mono text-xs uppercase tracking-[0.1em]"
            style={{ color: '#6B7280' }}
          >
            BUILT FOR RUNNERS WHO WANT MORE.
          </span>
        </div>
      </div>
    </footer>
  );
}