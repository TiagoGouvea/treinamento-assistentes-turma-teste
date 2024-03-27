import OpenAi from "openai";
import dotenv from "dotenv";
import prompt from 'prompt';
import colors from '@colors/colors';
import {promptMessage} from "../utils/prompt.js";
import {sleep} from "openai/core";
import {printMessagesAssistant} from "../utils/printMessagesAssistant.js";
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});
const model = "gpt-3.5-turbo";
const assistantId = 'asst_DZwcnx9wTULvK20fXMyu0hYF';

async function main(){
    // Criar thread
    const thread = await openai.beta.threads.create();
    // console.log("👉 thread");
    // console.log(thread);

    // Adicionar mensagem na thread
    const question = await promptMessage();
    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: question
        }
    );
    // console.log("👉 message");
    // console.dir(message, { depth: null });

    // Executar Thread
    const run = await openai.beta.threads.runs.create(
        thread.id,
        {
            assistant_id: assistantId,
            model,
            // additional_instructions: "O nome do usuário é Tiago Gouvêa."
        }
    );
    // console.log("👉 run");
    // console.log(run);

    // Observar run em execução
    let wait = true;
    while (wait){
        const running = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id
        );
        // console.log("👉 running", running.status);
        // console.dir(running,{depth:null});
        wait = running.status!= "completed"; //  (['queued', 'in_progress', 'cancelling'].includes(running.status))
        if (wait)
            await sleep(1000);
        else {
            // console.log("👉 usage", running.usage);
        }
    }

    // Obter mensagens e apresentar
    const messages = await openai.beta.threads.messages.list(
        thread.id
    );
    // console.log("👉 messages", messages.data.length);
    // console.dir(messages.data, {depth: null});
    printMessagesAssistant(messages.data.reverse());
};

main().then();