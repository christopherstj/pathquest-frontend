"use client";

import React from "react";
import Link from "next/link";

/**
 * Pane footer links.
 *
 * Render this at the bottom of a scrollable “display pane” (desktop side panel
 * or mobile sheet) so users see it when they scroll to the bottom.
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-10 border-t border-border/50 px-4 py-6">
            <nav className="flex items-center justify-center gap-4 text-sm flex-wrap">
                <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    About
                </Link>
                <span className="text-border">|</span>
                <Link
                    href="/faq"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    FAQ
                </Link>
                <span className="text-border">|</span>
                <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Privacy
                </Link>
                <span className="text-border">|</span>
                <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Terms
                </Link>
                <span className="text-border">|</span>
                <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Contact
                </Link>
            </nav>
            <p className="mt-3 text-center text-xs text-muted-foreground/70">
                &copy; {currentYear} PathQuest
            </p>
        </footer>
    );
};

export default Footer;

