document.addEventListener('DOMContentLoaded', () => {
    // Initialize the editor with all extensions
    const editor = new tiptap.Editor({
        element: document.getElementById('editor'),
        extensions: [
            tiptap.StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            }),
            tiptap.Link.configure({
                openOnClick: false,
            }),
            tiptap.Image,
            tiptap.Table.configure({
                resizable: true,
            }),
            tiptap.TableRow,
            tiptap.TableHeader,
            tiptap.TableCell,
            tiptap.TaskList,
            tiptap.TaskItem.configure({
                nested: true,
            }),
            tiptap.Highlight,
            tiptap.HorizontalRule,
            tiptap.CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: '<p>Start writing your content here...</p>',
        onUpdate: ({ editor }) => {
            // Handle editor updates
        },
    });

    // Floating toolbar functionality
    const floatingToolbar = document.getElementById('floating-toolbar');
    let isToolbarVisible = false;

    // Add buttons to floating toolbar
    const floatingToolbarButtons = [
        { command: 'bold', icon: 'bold' },
        { command: 'italic', icon: 'italic' },
        { command: 'underline', icon: 'underline' },
        { command: 'strike', icon: 'strikethrough' },
        { command: 'link', icon: 'link' },
    ];

    floatingToolbarButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'p-2 rounded hover:bg-gray-200';
        button.innerHTML = `<i class="fas fa-${btn.icon}"></i>`;
        button.dataset.command = btn.command;
        floatingToolbar.appendChild(button);
    });

    // Position floating toolbar when text is selected
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed || !editor.isActive()) {
            hideFloatingToolbar();
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        floatingToolbar.style.top = `${rect.top + window.scrollY - floatingToolbar.offsetHeight - 10}px`;
        floatingToolbar.style.left = `${rect.left + window.scrollX - floatingToolbar.offsetWidth / 2 + rect.width / 2}px`;
        showFloatingToolbar();
    });

    function showFloatingToolbar() {
        if (!isToolbarVisible) {
            floatingToolbar.classList.add('active');
            isToolbarVisible = true;
        }
    }

    function hideFloatingToolbar() {
        if (isToolbarVisible) {
            floatingToolbar.classList.remove('active');
            isToolbarVisible = false;
        }
    }

    // Handle toolbar button clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.toolbar-btn') || e.target.closest('#floating-toolbar button')) {
            const button = e.target.closest('button');
            const command = button.dataset.command;
            
            if (command === 'heading') {
                const level = button.value;
                if (level) {
                    editor.chain().focus().toggleHeading({ level: parseInt(level) }).run();
                } else {
                    editor.chain().focus().setParagraph().run();
                }
            } else if (command === 'link') {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                
                if (url === null) return;
                if (url === '') {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    return;
                }
                
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            } else if (command === 'image') {
                const url = window.prompt('Enter the URL of the image:');
                
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            } else if (command === 'table') {
                const rows = Number(window.prompt('How many rows?', 3));
                const cols = Number(window.prompt('How many columns?', 3));
                
                if (rows && cols) {
                    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                }
            } else {
                editor.chain().focus()[command]().run();
            }
        }
    });

    // Mobile responsive behavior
    function handleMobileView() {
        const toolbarGroups = document.querySelectorAll('.toolbar-group');
        if (window.innerWidth < 640) {
            toolbarGroups.forEach(group => {
                if (!group.classList.contains('mobile-visible')) {
                    group.style.display = 'none';
                }
            });
        } else {
            toolbarGroups.forEach(group => {
                group.style.display = 'flex';
            });
        }
    }

    window.addEventListener('resize', handleMobileView);
    handleMobileView();

    // Mobile menu toggle
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'p-2 rounded hover:bg-gray-200 md:hidden';
    mobileMenuToggle.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    document.querySelector('.toolbar').prepend(mobileMenuToggle);

    mobileMenuToggle.addEventListener('click', () => {
        const hiddenGroups = document.querySelectorAll('.toolbar-group:not(.mobile-visible)');
        hiddenGroups.forEach(group => {
            group.style.display = group.style.display === 'none' ? 'flex' : 'none';
        });
    });
});
