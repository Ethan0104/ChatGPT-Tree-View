import RawMessage from './raw-message'

interface RawEntry {
    id: string
    message: RawMessage | null // null iff it is the root node
    children: string[]
    parent: string | null // null iff it is the root node
}

export default RawEntry
