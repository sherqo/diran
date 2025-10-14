import Image from 'next/image';
const ChatDemo = () => {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-xl">
            {/* Frosted-glass blue gradient background */}
            <div className="absolute inset-0 backdrop-blur-sm" />

            {/* Chat container */}
            <div className="relative z-10 flex h-full flex-col space-y-2 px-1">
                {/* AI Avatar in top left */}
                <div className="mb-2 flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm">
                        <Image src="/identity/logo-512.png" alt="AI Avatar" width={32} height={32} />
                    </div>
                </div>

                {/* AI Message Bubble */}
                <div className="flex items-start space-x-3">
                    <div className="max-w-xs">
                        <div className="text-foreground bg-primary/90 relative z-10 flex items-center rounded-2xl rounded-tl-md border border-white/30 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
                            <p className="leading-relaxed">Bro, you always fail on Thursday!</p>
                        </div>
                    </div>
                </div>

                {/* User Message Bubble */}
                <div className="flex items-start justify-end">
                    <div className="max-w-xs">
                        <div className="bg-muted border-muted-400/40 relative z-10 flex items-center rounded-2xl rounded-r-md border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
                            <p className="text-foreground leading-relaxed">Damn, that&apos;s true.</p>
                        </div>
                    </div>
                </div>

                {/* User Message Bubble */}
                <div className="flex items-start justify-end">
                    <div className="max-w-xs">
                        <div className="bg-muted border-muted-400/40 relative z-10 -mt-1 flex items-center rounded-2xl rounded-tr-md border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
                            <p className="text-foreground leading-relaxed">You got a fix?</p>
                        </div>
                    </div>
                </div>

                {/* AI Message Bubble */}
                <div className="flex items-start space-x-3">
                    <div className="max-w-xs">
                        <div className="text-foreground bg-primary/90 relative z-10 flex items-center rounded-2xl rounded-tl-md border border-white/30 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
                            <p className="leading-relaxed">Can you even doubt that?</p>
                        </div>
                    </div>
                </div>
                {/* Subtle floating elements for ambiance */}
                <div className="absolute top-10 right-8 h-2 w-2 animate-pulse rounded-full bg-white/30 blur-sm" />
                <div className="absolute bottom-16 left-12 h-1 w-1 animate-pulse rounded-full bg-blue-300/40 blur-sm delay-700" />
                <div className="absolute top-20 left-1/3 h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300/30 blur-sm delay-1000" />
            </div>
        </div>
    );
};

export default ChatDemo;
