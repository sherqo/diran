'use client';

import { useState } from 'react';
import {
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    Navbar,
    NavbarButton,
    NavbarLogo,
    NavBody,
    NavItems,
} from '@/components/ui/resizable-navbar';

const AppNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Home', link: '#' },
        // { name: 'Features', link: '#features' },
        { name: 'Faq', link: '#faq' },
        { name: 'Contact', link: '#contact' },
    ];

    const navBarBtnData = {
        href: '#waitlist',
        label: 'Diran me',
    };

    return (
        <Navbar>
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} onItemClick={() => setIsOpen(false)} />
                <NavbarButton href={navBarBtnData.href}>{navBarBtnData.label}</NavbarButton>
            </NavBody>

            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo />
                    <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
                </MobileNavHeader>
                <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
                    {navItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            className="text-foreground hover:text-muted-foreground text-lg font-medium"
                            onClick={() => setIsOpen(false)}>
                            {item.name}
                        </a>
                    ))}
                    <NavbarButton href={navBarBtnData.href} className="mt-4">
                        {navBarBtnData.label}
                    </NavbarButton>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
};

export default AppNavbar;
