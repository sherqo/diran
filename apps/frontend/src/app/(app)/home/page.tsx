'use client';

import { useEffect, useRef } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { NavActions } from '@/components/nav-actions';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const PageHeader = ({ className }: { className?: string }) => (
    <header className={`bg-sidebar flex h-14 shrink-0 items-center gap-2 border-b ${className || ''}`}>
        <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage className="line-clamp-1">Project Management & Task Tracking</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
            <NavActions />
        </div>
    </header>
);

const PageBody = ({ className }: { className?: string }) => {
    return (
        <div className={`flex flex-col gap-4 px-4 py-10 ${className || ''}`}>
            {/* Content will go here */}
            this editor should be her <div id="editorjs" className="w-full max-w-3xl" />
        </div>
    );
};

export default function Page() {
    const editorRef = useRef<{ destroy?: () => void } | null>(null);

    useEffect(() => {
        const initEditor = async () => {
            if (!editorRef.current) {
                // Dynamic imports to avoid SSR issues
                const EditorJS = (await import('@editorjs/editorjs')).default;
                const Header = (await import('@editorjs/header')).default;
                const List = (await import('@editorjs/list')).default;

                const editor = new EditorJS({
                    /**
                     * Id of Element that should contain the Editor
                     */
                    holder: 'editorjs',

                    /**
                     * Available Tools list.
                     * Pass Tool's class or Settings object for each Tool you want to use
                     */
                    tools: {
                        header: Header,
                        list: List,
                    },

                    onReady: () => {
                        console.log('Editor.js is ready to work!');
                    },

                    onChange: (api, event) => {
                        console.log("Now I know that Editor's content changed!", event);
                    },
                });

                editor.isReady
                    .then(() => {
                        console.log('Editor.js is ready to work!');
                        /** Do anything you need after editor initialization */
                    })
                    .catch(reason => {
                        console.log(`Editor.js initialization failed because of ${reason}`);
                    });

                editorRef.current = editor;
            }
        };

        initEditor();

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
            }
        };
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex h-screen flex-col">
                <PageHeader className="shrink-0" />
                <PageBody className="flex-1 overflow-y-auto" />
            </SidebarInset>
        </SidebarProvider>
    );
}
