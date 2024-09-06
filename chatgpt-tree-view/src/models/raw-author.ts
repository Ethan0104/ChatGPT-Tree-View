enum RawAuthorRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
    TOOL = 'tool',
}

enum RawAuthorName {
    BIO = 'bio', // user memories
    FILE_BROWSER = 'myfiles_browser',
    PYTHON = 'python',
    DALLE = 'dalle.text2im',
}

interface RawAuthor {
    role: RawAuthorRole
    name: RawAuthorName
}

export { RawAuthor, RawAuthorName, RawAuthorRole }
