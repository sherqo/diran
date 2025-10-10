import Link from 'next/link';
import React from 'react';

const Footer = () => {
    return (
        <footer className="border-border bg-background w-full border-t px-8 py-4 font-medium sm:px-16" id="contact">
            <div className="mx-auto max-w-6xl space-y-3">
                {/* First row - Links */}
                <div className="flex items-center space-x-4">
                    <a
                        href="mailto:sharqawy@diran.app"
                        className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors">
                        Contact
                    </a>
                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                        Privacy
                    </Link>
                    {/* <Link
                        href="/terms"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Terms
                    </Link> */}
                </div>

                {/* Second row - Copyright and Social */}
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                        © 2025 <span className="font-clash">Diran AI</span>
                    </p>

                    <div className="flex items-center space-x-4">
                        {/* LinkedIn */}
                        <a
                            href="https://linkedin.com/company/diranai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>

                        {/* X (Twitter) */}
                        <a
                            href="https://x.com/diran_ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
