import * as pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const readPDF = async (buffer: Buffer) => {
    const data = await pdfParse(buffer);
    return data.text;
}

export const splitText = async (data: string) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    return await splitter.splitText(data);
}