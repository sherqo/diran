// import { useMemo, useState } from 'react';

// import YooptaEditor, { createYooptaEditor, YooptaContentValue, YooptaOnChangeOptions } from '@yoopta/editor';
// import paragraph from '@yoopta/paragraph';
// import blockquote from '@yoopta/blockquote';
// // import headings from '@yoopta/headings';
// import { Bold } from '@yoopta/marks';

// const plugins = [paragraph, blockquote];
// const marks = [Bold];

// export default function Editor() {
//     const editor = useMemo(() => createYooptaEditor(), []);
//     const [value, setValue] = useState<YooptaContentValue>();

//     const onChange = (value: YooptaContentValue, options: YooptaOnChangeOptions) => {
//         console.log('fuck all');
//         setValue(value);
//     };

//     return (
//         <body>
//             <div>
//                 <YooptaEditor editor={editor} placeholder="Type text.." plugins={plugins} marks={marks} value={value} onChange={onChange} />
//             </div>
//         </body>
//     );
// }

'use client';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';

import Paragraph from '@yoopta/paragraph';
import Blockquote from '@yoopta/blockquote';
import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Link from '@yoopta/link';
import Callout from '@yoopta/callout';
import Video from '@yoopta/video';
import File from '@yoopta/file';
import Accordion from '@yoopta/accordion';
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Code from '@yoopta/code';
import Table from '@yoopta/table';
import Divider from '@yoopta/divider';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

// NOTE: Upload logic is intentionally commented out per request —
// if you need to re-enable uploading, implement a real upload handler
// and return the expected shape (secure_url, width, height, format, name, bytes).
/*
const uploadToCloudinary = async () => {
    // mock function
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                secure_url: 'https://via.placeholder.com/150',
                width: 150,
                height: 150,
                format: 'png',
                name: 'placeholder.png',
                bytes: 12345,
            });
        }, 1000);
    });
};
*/

import { useMemo, useRef, useState } from 'react';
import { WITH_BASIC_INIT_VALUE } from './initValue';

const plugins = [
    Paragraph,
    Table,
    Divider.extend({
        elementProps: {
            divider: props => ({
                ...props,
                color: '#007aff',
            }),
        },
    }),
    Accordion,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    Callout,
    NumberedList,
    BulletedList,
    TodoList,
    Code,
    Link,
    Embed,
    // Image upload handler removed / commented out
    Image.extend({
        // options: {
        //     async onUpload(file) {
        //         const data = await uploadToCloudinary(file, 'image');
        //         return {
        //             src: data.secure_url,
        //             alt: 'cloudinary',
        //             sizes: {
        //                 width: data.width,
        //                 height: data.height,
        //             },
        //         };
        //     },
        // },
    }),
    // Video upload handlers removed / commented out
    Video.extend({
        // options: {
        //     onUpload: async file => {
        //         const data = await uploadToCloudinary(file, 'video');
        //         return {
        //             src: data.secure_url,
        //             alt: 'cloudinary',
        //             sizes: {
        //                 width: data.width,
        //                 height: data.height,
        //             },
        //         };
        //     },
        //     onUploadPoster: async file => {
        //         const image = await uploadToCloudinary(file, 'image');
        //         return image.secure_url;
        //     },
        // },
    }),
    // File upload handler removed / commented out
    File.extend({
        // options: {
        //     onUpload: async file => {
        //         const response = await uploadToCloudinary(file, 'auto');
        //         return {
        //             src: response.secure_url,
        //             format: response.format,
        //             name: response.name,
        //             size: response.bytes,
        //         };
        //     },
        // },
    }),
];

const TOOLS = {
    ActionMenu: {
        render: DefaultActionMenuRender,
        tool: ActionMenuList,
    },
    Toolbar: {
        render: DefaultToolbarRender,
        tool: Toolbar,
    },
    LinkTool: {
        render: DefaultLinkToolRender,
        tool: LinkTool,
    },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

function WithBaseFullSetup() {
    const [value, setValue] = useState(WITH_BASIC_INIT_VALUE);
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);

    const onChange = (newValue: YooptaContentValue) => {
        setValue(newValue);
    };

    return (
        <div className="px-auto flex w-full justify-center" ref={selectionRef}>
            {/* editor surface — tuned for light / dark modes and responsive widths */}
            {/* <div className="w-full rounded-xl bg-white p-6 text-slate-900 shadow-sm transition-colors duration-150 dark:bg-slate-900 dark:text-slate-100"> */}
            <YooptaEditor
                className="w-full"
                editor={editor}
                plugins={plugins}
                tools={TOOLS}
                marks={MARKS}
                selectionBoxRoot={selectionRef}
                value={value}
                onChange={onChange}
                autoFocus
            />
            {/* </div> */}
        </div>
    );
}

export default WithBaseFullSetup;
