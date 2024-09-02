import RawMessage from './raw-message'

interface RawEntry {
    id: string
    message: RawMessage | null
    children: string[]
    parent: string | null
}

export default RawEntry
