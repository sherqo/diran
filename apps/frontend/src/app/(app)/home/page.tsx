import { AppSidebar } from '@/components/app-sidebar';
import { NavActions } from '@/components/nav-actions';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
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

const PageBody = ({ className }: { className?: string }) => (
    <div className={`flex flex-col gap-4 px-4 py-10 ${className || ''}`}>
        <SimpleEditor />
    </div>
);

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex h-screen flex-col">
                <PageHeader className="flex-shrink-0" />
                <PageBody className="flex-1 overflow-y-auto" />
            </SidebarInset>
        </SidebarProvider>
    );
}
