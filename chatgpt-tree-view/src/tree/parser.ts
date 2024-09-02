import logger from "../logger"
import { CodePart, ImagePart, TextPart } from "../models/content"
import { RawAuthorRole } from "../models/raw-author"
import Message from "../models/message"
import { RawContentType } from "../models/raw-content"
import RawMessage from "../models/raw-message"

const mergeRawMessages = (rawMessages: RawMessage[]): Message => {
    /**
     * Merges raw messages into a single (assistant) Message object.
     * Since only assistant messages require merging (Dall-E image and code chunks), this function assumes the resultant Message is from the assistant.
     * 
     * @param rawMessages - List of raw messages to merge
     * @returns Merged Message object
     */

    // Initialize parts array
    // const parts: (TextPart | ImagePart | CodePart)[] = []
    // rawMessages.forEach((rawMessage) => {
    //     if (rawMessage.content.content_type === RawContentType.TEXT || rawMessage.content.content_type === RawContentType.MULTIMODAL) {
    //         parts.push(...rawMessage.content.parts)
    //     } else if (rawMessage.content.content_type === RawContentType.EXECUTION_OUTPUT) {
    //         parts.push({ code: rawMessage.content.text, output: rawMessage.metadata.aggregate_result?.code || "" })
    //     } else {
    //         logger.error(`Unexpected content type ${rawMessage.content.content_type} made it to the merging phase. This implies an error in the filtering step. Skipping for now.`)
    //     }
    // })

    // return {

    // }

    // Map each raw message to a "Chunk"
    const chunks = rawMessages.map((rawMessage) => {
        if (rawMessage.content.content_type === RawContentType.TEXT || rawMessage.content.content_type === RawContentType.MULTIMODAL) {
            return {
                id: rawMessage.id,
                parts: rawMessage.content.parts
            }
        } else if (rawMessage.content.content_type === RawContentType.EXECUTION_OUTPUT) {
            return {
                id: rawMessage.id,
                parts: [{ code: rawMessage.content.text, output: rawMessage.metadata.aggregate_result?.code || "" }]
            }
        } else {
            logger.error(`Unexpected content type ${rawMessage.content.content_type} made it to the merging phase. This implies an error in the filtering step. Skipping for now.`)
            return null
        }
    })

    // the "id" of the final Message is the id of the first raw message from the assistant
    try {
        const id = rawMessages.filter((rawMessage) => rawMessage.author.role === RawAuthorRole.ASSISTANT)[0].id
    } catch (error) {
        const msg = `No assistant message found in the raw messages. This should not happen. First raw message id: ${rawMessages[0].id}`
        logger.error(msg)
        throw new Error(msg)
    }
}