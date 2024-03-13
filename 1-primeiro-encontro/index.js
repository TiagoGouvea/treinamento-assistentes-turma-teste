import OpenAi from "openai";
import dotenv from "dotenv";
import prompt from 'prompt';
import colors from '@colors/colors';
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});
const model = "gpt-3.5-turbo";

// Consumindo modelo local (LM Studio / Ollama)
// const openai = new OpenAi({baseURL: 'http://localhost:1234/v1', apiKey: process.env.OPENAI_KEY});
// const model = "local-model";


async function main(){
    const messages = [{
        "role": "system",
        "content": `
        Você é um assistente que ajuda a montar um plano de estudo com base em uma tecnologia.
        O usuário enviar uma tecnologia, e você montará um plano contendo:
        - Conceitos fundamentais
        - Primeiros passos
        - Documentação e links uteis
        - Projeto prático
        Logo no começo da conversa, já pergunte qual tecnologia a pessoa quer aprender.
        Não conversar sobre outros assuntos.
        Comece a conversa perguntando o que o usuário deseja aprender mais na área de programação.
        `
        // "Sempre responda no formato: {language: 'nome da linguagem', response: 'Sua respota'}"
    }];

    while (true){
        if (messages.length>1){
            const question = await promptMessage();

            // const isPr = await isProgrammingLanguage(question);
            // console.log("isProgramming", isPr);

            messages.push({
                "role": "user",
                "content": question
            });
        }

        const completion = await openai.chat.completions.create({
            messages,
            model
        });

        // console.dir(completion,{depth:null});
        // conferir se a pergunta tem a palavra "X", se tiver incluir um message system com informações

        messages.push(completion.choices[0].message);

        // console.log(completion.choices[0].message.content);
        printMessages(messages, true);
    }

    // console.dir(completion,{depth:null});
}

async function isProgrammingLanguage(message){
        const completion = await openai.chat.completions.create({
                messages:[
                    {"role": "system","content": `Você responde apenas "sim" ou "não", se na mensagem abaixo, existe uma linguagem de programação ou framework.`},
                    {"role": "user", "content": message}
                ],
            model
        });

        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content.toLowerCase().includes("sim");
}

export async function promptMessage() {
    try {
        prompt.message = '';
        prompt.delimiter = '';
        const res = await prompt.get({
            properties: {
                message: {
                    description: colors.magenta('Mensagem>'),
                },
            },
        });
        if (res.message?.trim() !== '') return res.message;
    } catch (e) {
        if (e.message === 'canceled') {
            process.exit();
        }
        console.error(e);
    }
}


function printMessages(messages, justLast) {
    if (justLast) messages = [messages[messages.length-1]];

    messages.map((msg) => {
        if (msg.role == 'user') {
            console.log(colors.magenta(msg.content));
        } else if (msg.role == 'assistant') {
            console.log(colors.green(msg.content));
        }
        if (msg.metadata) {
            console.log('🔥 metadata', msg.metadata);
        }
    });
}

main().then();