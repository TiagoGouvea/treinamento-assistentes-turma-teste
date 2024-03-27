import OpenAi from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});

const assistantId = 'asst_Y0DhYmpi4RACOlPx95qIva6o';

const assistant = {
    instructions:
        'Você é um assiste virtual que auxilia ao usuário a realizar um hackathon.',
    name: 'Assistente de Eventos',
    model: 'gpt-3.5-turbo',
    // tools: null,
    // file_ids: null
};


async function main() {
    if (!assistantId) {
        // Create Assistant - https://platform.openai.com/docs/api-reference/assistants/createAssistant
        console.log('createAssistant...');
        const myAssistant = await openai.beta.assistants.create(assistant);
        console.log('✅ createAssistant');
        console.dir(myAssistant, { depth: null });
    } else {
        // Update Assistant - https://platform.openai.com/docs/api-reference/assistants/modifyAssistant
        console.log('updateAssistant...');
        const myUpdatedAssistant = await openai.beta.assistants.update(
            assistantId,
            assistant
        );
        console.log('✅ updateAssistant');
        console.dir(myUpdatedAssistant, { depth: null });
    }
}

main();
