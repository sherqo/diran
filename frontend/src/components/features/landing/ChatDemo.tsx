import Image from 'next/image';
const ChatDemo = () => {
    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl">
            {/* Frosted-glass blue gradient background */}
            <div className="absolute inset-0 backdrop-blur-sm" />

            {/* Chat container */}
            <div className="relative z-10 flex flex-col h-full space-y-2 px-1">
                {/* AI Avatar in top left */}
                <div className="flex items-start space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Image
                            src="/identity/logo-512.png"
                            alt="AI Avatar"
                            width={32}
                            height={32}
                        />
                    </div>
                </div>

                {/* AI Message Bubble */}
                <div className="flex items-start space-x-3">
                    <div className="max-w-xs">
                        <div className="relative z-10 flex items-center px-4 py-2 text-foreground text-sm font-medium bg-primary/90 backdrop-blur-sm rounded-2xl rounded-tl-md shadow-sm border border-white/30">
                            <p className="leading-relaxed">
                                Bro, you always fail on Thursday!
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Message Bubble */}
                <div className="flex items-start justify-end">
                    <div className="max-w-xs">
                        <div className="relative z-10 flex items-center px-4 py-2 text-sm font-medium bg-muted backdrop-blur-sm rounded-2xl rounded-r-md shadow-sm border border-muted-400/40">
                            <p className="text-foreground leading-relaxed">
                                Damn, that&apos;s true.
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Message Bubble */}
                <div className="flex items-start justify-end">
                    <div className="max-w-xs">
                        <div className="relative z-10 flex items-center px-4 py-2 text-sm font-medium bg-muted backdrop-blur-sm rounded-2xl rounded-tr-md shadow-sm border border-muted-400/40 -mt-1">
                            <p className="text-foreground leading-relaxed">
                                You got a fix?
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Message Bubble */}
                <div className="flex items-start space-x-3">
                    <div className="max-w-xs">
                        <div className="relative z-10 flex items-center px-4 py-2 text-foreground text-sm font-medium bg-primary/90 backdrop-blur-sm rounded-2xl rounded-tl-md shadow-sm border border-white/30">
                            <p className="leading-relaxed">
                                Can you even doubt that?
                            </p>
                        </div>
                    </div>
                </div>
                {/* Subtle floating elements for ambiance */}
                <div className="absolute top-10 right-8 w-2 h-2 bg-white/30 rounded-full blur-sm animate-pulse" />
                <div className="absolute bottom-16 left-12 w-1 h-1 bg-blue-300/40 rounded-full blur-sm animate-pulse delay-700" />
                <div className="absolute top-20 left-1/3 w-1.5 h-1.5 bg-purple-300/30 rounded-full blur-sm animate-pulse delay-1000" />
            </div>
        </div>
    );
};

export default ChatDemo;
